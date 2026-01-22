# Sharding Feature Implementation Report
**Date**: 2025-12-21
**Branch**: develop
**Purpose**: Comprehensive analysis for implementing database sharding
 
---

## Executive Summary

The JobManager_BE is a microservices-based job management platform with **9 microservices** following a **database-per-service pattern**. The codebase **already has sharding keys defined** in the `Country` enum (`job-manager-auth/src/main/java/com/devision/job_manager_auth/entity/Country.java:42`), but sharding is **not yet implemented**. The application is well-positioned for geographical sharding implementation.
 
---

## 1. Current Architecture Overview

### 1.1 Microservices
```
├── job-manager-discovery (Eureka Server - Port 8761)
├── job-manager-gateway (API Gateway - Port 8080)
├── job-manager-auth (Authentication - Port 8081)
├── job-manager-company (Company Management - Port 8082)
├── job-manager-jobpost (Job Posting - Port 8083)
├── job-manager-search (Search Service)
├── job-manager-premium (Premium Features)
├── job-manager-payment (Payment Processing)
└── job-manager-notification (Notifications)
```

### 1.2 Technology Stack
- **Framework**: Spring Boot 3.2.1 / 3.5.7
- **Java Version**: 17
- **Spring Cloud**: 2023.0.0 / 2025.0.0
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Message Broker**: Kafka 7.5.0 with Zookeeper
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT + OAuth2 (Google SSO)

### 1.3 Current Database Setup (docker-compose.yaml)
Each service has its **own PostgreSQL database**:
```
- postgres-auth (Port 5439) → job_manager_auth
- postgres-company (Port 5433) → job_manager_company
- postgres-jobpost (Port 5434) → job_manager_jobpost
- postgres-search (Port 5435) → job_manager_search
- postgres-premium (Port 5436) → job_manager_premium
- postgres-payment (Port 5437) → job_manager_payment
- postgres-notification (Port 5438) → job_manager_notification
```

**Current State**: Each service connects to a **single database instance**. No multi-datasource configuration exists.
 
---

## 2. Existing Sharding Strategy (Already Defined!)

### 2.1 The Country Enum Shard Keys
Location: `job-manager-auth/src/main/java/com/devision/job_manager_auth/entity/Country.java:8-42`

The application **already defines** a geographical sharding strategy:

| Shard Key | Countries | Region |
|-----------|-----------|--------|
| `auth_shard_vn` | Vietnam (VN) | Southeast Asia |
| `auth_shard_sg` | Singapore (SG) | Southeast Asia |
| `auth_shard_sea` | Malaysia, Thailand, Philippines, Indonesia | Southeast Asia |
| `auth_shard_ea` | Japan, South Korea, China | East Asia |
| `auth_shard_oc` | Australia, New Zealand | Oceania |
| `auth_shard_na` | United States, Canada | North America |
| `auth_shard_eu` | UK, Germany, France, Netherlands | Europe |
| `auth_shard_sa` | India | South Asia |
| `auth_shard_others` | Other (XX) | Rest of World |

**Key Insight**: Vietnam and Singapore get dedicated shards, suggesting these are primary markets.

### 2.2 Country Enum Structure
```java
public enum Country {
    VIETNAM("VN", "Vietnam", "auth_shard_vn"),
    SINGAPORE("SG", "Singapore", "auth_shard_sg"),
    // ... more countries
 
    private final String code;        // ISO 3166-1 code
    private final String displayName; // Human-readable name
    private final String shardKey;    // Shard identifier ⭐
}
```

**Methods Available**:
- `Country.fromCode(String code)` - Get country by ISO code
- `Country.fromDisplayName(String name)` - Get country by name
- `getShardKey()` - Get the shard identifier

### 2.3 Current Usage
The `shardKey` field is **defined but not used** anywhere in the codebase. The Country enum is currently used only for:
1. Storing user's country in `CompanyAccount.country` (job-manager-auth)
2. Validation during registration

---

## 3. Data Models & Relationships

### 3.1 Key Entities

#### CompanyAccount (Auth Service)
Location: `job-manager-auth/src/main/java/com/devision/job_manager_auth/entity/CompanyAccount.java`
```java
@Entity
@Table(name = "company_account")
public class CompanyAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;                    // ⭐ Primary key
 
    private String email;               // Unique
    private String passwordHash;
    private Country country;            // ⭐ Sharding key source!
    private AuthProvider authProvider;  // LOCAL, GOOGLE
    private String ssoProviderId;
    private Role role;
    private Boolean isActivated;
    private Integer failedLoginAttempts;
    private Boolean isLocked;
    // ... timestamps
}
```

#### Company (Company Service)
Location: `job-manager-company/src/main/java/com/devision/job_manager_company/model/Company.java`
```java
@Entity
@Table(name = "company")
public class Company {
    @Id
    private UUID id;                    // ⭐ Shared from Auth service (NOT auto-generated)
 
    private String name;
    private String phone;
    private String streetAddress;
    private String city;
    private String countryCode;         // ISO code (e.g., "VN", "SG")
 
    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL)
    private CompanyProfile profile;
}
```

#### JobPost (JobPost Service)
Location: `job-manager-jobpost/src/main/java/com/devision/job_manager_jobpost/model/JobPost.java`
```java
@Entity
@Table(name = "job_post")
public class JobPost {
    @Id
    private Long jobPostId;             // ⚠️ INCONSISTENCY: Uses Long, not UUID!
 
    private Long companyId;             // ⚠️ INCONSISTENCY: Should be UUID!
 
    private String title;
    private String description;
    private boolean fresher;
    private SalaryType salaryType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String locationCity;
    private UUID countryId;             // ⭐ Potential sharding key
    private boolean published;
    // ... more fields
}
```

**⚠️ CRITICAL DATA INCONSISTENCY**:
- `CompanyAccount.id` and `Company.id` use **UUID**
- `JobPost.jobPostId` and `JobPost.companyId` use **Long**
- This must be resolved before implementing sharding!

### 3.2 Service Communication Pattern

Services communicate via **Kafka events** (event-driven architecture):

```
┌─────────────────┐    CompanyRegisteredEvent    ┌──────────────────┐
│   Auth Service  │──────────────────────────────>│ Company Service  │
│  (Register user)│                               │ (Create profile) │
└─────────────────┘                               └──────────────────┘
```

**Key Kafka Topics** (job-manager-auth/src/main/java/com/devision/job_manager_auth/config/KafkaTopicConfig.java):
- `company.registered` (3 partitions)
- `company.activated` (3 partitions)
- `company.account.locked` (3 partitions)

**Event Example**: `CompanyRegisteredEvent`
```java
{
    UUID companyId,
    String email,
    String countryCode,    // ⭐ Important for sharding
    // ... other fields
}
```
 
---

## 4. Repository Layer Analysis

### 4.1 Auth Service Repositories
Location: `job-manager-auth/src/main/java/com/devision/job_manager_auth/repository/`

**CompanyAccountRepository** extends `JpaRepository<CompanyAccount, UUID>`

**Key Methods**:
```java
// Query patterns that need sharding consideration:
Optional<CompanyAccount> findByEmail(String email);
boolean existsByEmail(String email);
Optional<CompanyAccount> findByActivationToken(String activationToken);
 
// SSO queries
Optional<CompanyAccount> findByAuthProviderAndSsoProviderId(...);
 
// Security queries
Optional<CompanyAccount> findByEmailAndIsActivatedTrueAndIsLockedFalse(String email);
 
// Custom update queries (uses @Modifying)
@Query("UPDATE CompanyAccount c SET c.failedLoginAttempts = ...")
void incrementFailedLoginAttempts(...);
```

**Sharding Consideration**: Email-based lookups cannot use country-based sharding key directly. May need:
1. Multi-shard query (scatter-gather)
2. Secondary index/mapping table (email → shard)
3. Embed country in session/token

### 4.2 Company Service Repositories
Location: `job-manager-company/src/main/java/com/devision/job_manager_company/repository/`

**CompanyRepository** extends `JpaRepository<Company, UUID>`

**Key Methods**:
```java
List<Company> findByCountryCode(String countryCode);  // ⭐ Perfect for sharding!
List<Company> findByCity(String city);
 
@Query("SELECT c FROM Company c WHERE LOWER(c.name) LIKE ...")
List<Company> searchByName(String name);  // ⚠️ Would need multi-shard search
 
@Query("SELECT c FROM Company c LEFT JOIN FETCH c.profile WHERE c.id = :id")
Optional<Company> findByIdWithProfile(UUID id);
```

### 4.3 JobPost Service Repositories
Location: `job-manager-jobpost/src/main/java/com/devision/job_manager_jobpost/repository/`

**JobPostRepository** extends `JpaRepository<JobPost, Long>`

**Key Methods**:
```java
Page<JobPost> findByCompanyId(Long companyId, Pageable pageable);
Page<JobPost> findByPublishedTrue(Pageable pageable);  // ⚠️ Multi-shard query
Page<JobPost> findByPublishedTrueAndCompanyId(Long companyId, Pageable pageable);
Page<JobPost> findByPublishedTrueAndExpiryAtAfter(LocalDateTime now, Pageable pageable);
```

**Note**: All queries return `Page` objects, supporting pagination.
 
---

## 5. Current Database Connection Configuration

### 5.1 Auth Service Database Config
Location: `job-manager-auth/src/main/resources/application.yaml:23-36`

```yaml
spring:
  datasource:
    url: ${POSTGRES_AUTH_URL:jdbc:postgresql://localhost:5439/job_manager_auth}
    username: ${POSTGRES_AUTH_USERNAME:postgres}
    password: ${POSTGRES_AUTH_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
 
  jpa:
    hibernate:
      ddl-auto: update  # ⚠️ Auto-creates tables (development mode)
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

**Current State**:
- Single datasource configuration
- No `@Configuration` classes for multiple datasources
- No routing logic exists

**For Sharding, You Need**:
- Multiple datasource configurations (one per shard)
- Dynamic datasource routing based on `Country.shardKey`
- Transaction management across shards (if needed)

### 5.2 Company Service Database Config
Similar single-datasource setup:
```yaml
spring:
  datasource:
    url: ${POSTGRES_COMPANY_URL:jdbc:postgresql://localhost:5433/job_manager_company}
```

### 5.3 JobPost Service Database Config
```yaml
spring:
  datasource:
    url: ${POSTGRES_JOBPOST_URL:jdbc:postgresql://localhost:5434/job_manager_jobpost}
```
 
---

## 6. Critical Issues to Resolve Before Sharding

### 6.1 Data Type Inconsistencies ⚠️

**Problem**: Mixed use of `UUID` and `Long` for IDs

| Service | Entity | Primary Key Type | Foreign Key Type |
|---------|--------|------------------|------------------|
| Auth | CompanyAccount | UUID | - |
| Company | Company | UUID (from Auth) | - |
| JobPost | JobPost | Long | companyId: Long ⚠️ |

**Impact**:
- JobPost cannot properly reference Company (UUID vs Long mismatch)
- Distributed ID generation strategy unclear
- Potential data integrity issues

**Recommendation**:
1. Standardize on UUID for all company-related entities
2. Update JobPost.companyId to UUID before implementing sharding

### 6.2 Email-Based Authentication with Sharding

**Problem**: Users log in with email, but sharding is by country.

**Current Flow**:
```
1. User enters email + password
2. Query: findByEmail(email)  // ⚠️ Which shard?
3. Validate password
4. Generate JWT
```

**Sharding Challenges**:
- Email doesn't contain country information
- Must query all shards (scatter-gather) OR
- Maintain email→shard mapping table

**Possible Solutions**:

**Option A: Scatter-Gather**
```
1. Query all shards in parallel for email
2. First response wins
3. Cache result in Redis (email → shard mapping)
```
Pros: Simple, no schema changes
Cons: Slower on first login, more database load

**Option B: Centralized Lookup Table**
```
email_to_shard_mapping (Global table)
- email (PK)
- shard_key
- last_updated
```
Pros: Fast lookups
Cons: Single point of failure, synchronization complexity

**Option C: Embed Country in Login**
```
1. User enters email + password + country (dropdown)
2. Route to correct shard immediately
```
Pros: Efficient
Cons: UX friction, users may forget country

**Option D: Redis Cache**
```
1. On first login: scatter-gather
2. Cache in Redis: email → shard_key (TTL: long)
3. Subsequent logins: check cache first
```
Pros: Fast after first login, no schema changes
Cons: Cache invalidation complexity

### 6.3 Cross-Shard Queries

**Queries That Require All Shards**:
1. `searchByName(String name)` - Search companies by name
2. `findByPublishedTrue()` - Get all published job posts
3. Global statistics/analytics
4. Admin dashboards

**Solutions**:
- **Read Replicas**: Aggregate data into a read-optimized database
- **Search Service**: Use Elasticsearch for global search
- **CQRS Pattern**: Separate read/write models
- **API Aggregation**: Query all shards and merge results (slower)

---

## 7. Sharding Implementation Approaches

### 7.1 Approach 1: Application-Level Sharding (Recommended)

**How It Works**:
1. Create multiple datasource beans (one per shard)
2. Implement `AbstractRoutingDataSource` to route queries
3. Use `ThreadLocal` to set shard context
4. Interceptor/AOP to determine shard from request

**Pros**:
- Full control over routing logic
- No database-level changes
- Easier to test and debug
- Can implement complex routing rules

**Cons**:
- More application code
- Must handle shard routing in every query
- Transaction management complexity

**Example Architecture**:
```java
@Configuration
public class ShardingDataSourceConfig {
 
    @Bean
    public DataSource dataSource() {
        ShardRoutingDataSource routingDataSource = new ShardRoutingDataSource();
 
        Map<Object, Object> shards = new HashMap<>();
        shards.put("auth_shard_vn", createDataSource("jdbc:postgresql://host1:5432/auth_vn"));
        shards.put("auth_shard_sg", createDataSource("jdbc:postgresql://host2:5432/auth_sg"));
        shards.put("auth_shard_sea", createDataSource("jdbc:postgresql://host3:5432/auth_sea"));
        // ... more shards
 
        routingDataSource.setTargetDataSources(shards);
        routingDataSource.setDefaultTargetDataSource(shards.get("auth_shard_others"));
 
        return routingDataSource;
    }
}
 
public class ShardRoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return ShardContext.getCurrentShardKey();
    }
}
 
public class ShardContext {
    private static final ThreadLocal<String> currentShard = new ThreadLocal<>();
 
    public static void setShardKey(String shardKey) {
        currentShard.set(shardKey);
    }
 
    public static String getCurrentShardKey() {
        return currentShard.get();
    }
}
```

**Usage in Service**:
```java
@Service
public class AuthenticationServiceImpl {
 
    public void registerCompany(RegisterRequest request) {
        // Set shard context based on country
        String shardKey = request.getCountry().getShardKey();
        ShardContext.setShardKey(shardKey);
 
        try {
            // All database operations will route to the correct shard
            companyAccountRepository.save(account);
        } finally {
            ShardContext.clear();
        }
    }
}
```

### 7.2 Approach 2: Database-Level Sharding (PostgreSQL Native)

**Options**:
1. **Citus Extension**: Distributed PostgreSQL
2. **Postgres-XL**: Multi-master clustering
3. **pg_shard**: Deprecated, use Citus instead

**Pros**:
- Transparent to application (mostly)
- Automatic query routing
- Built-in distributed transactions

**Cons**:
- Complex setup and maintenance
- Version compatibility issues
- Harder to migrate existing data
- Less control over routing

### 7.3 Approach 3: Hybrid (Recommended for Your Case)

**Strategy**:
1. **Auth Service**: Application-level sharding (by country)
2. **Company Service**: Application-level sharding (same shards as Auth)
3. **JobPost Service**: Application-level sharding (inherit company's shard)
4. **Search Service**: Elasticsearch with data from all shards
5. **Other Services**: Can remain single-database initially

**Benefits**:
- Gradual migration
- Shard only high-traffic services
- Use existing Country enum shard keys
- Event-driven architecture helps with data consistency

---

## 8. Implementation Roadmap

### Phase 1: Preparation & Data Cleanup
1. **Standardize ID Types**
    - Convert JobPost.companyId from Long to UUID
    - Ensure all foreign keys are UUID
    - Update related DTOs and APIs

2. **Create Migration Scripts**
    - Data type migrations
    - Add indexes on country fields
    - Prepare rollback scripts

3. **Set Up Test Environment**
    - Create multiple test databases (one per shard)
    - Update docker-compose with shard databases
    - Prepare test data for each shard

### Phase 2: Infrastructure Setup
1. **Database Provisioning**
   ```yaml
   # docker-compose.yaml additions
   postgres-auth-vn:
     image: postgres:15-alpine
     environment:
       POSTGRES_DB: job_manager_auth_vn
 
   postgres-auth-sg:
     image: postgres:15-alpine
     environment:
       POSTGRES_DB: job_manager_auth_sg
 
   postgres-auth-sea:
     image: postgres:15-alpine
     environment:
       POSTGRES_DB: job_manager_auth_sea
   # ... more shards
   ```

2. **Update Configuration**
   ```yaml
   # application.yaml
   sharding:
     shards:
       auth_shard_vn:
         url: jdbc:postgresql://localhost:5440/job_manager_auth_vn
         username: postgres
         password: postgres
       auth_shard_sg:
         url: jdbc:postgresql://localhost:5441/job_manager_auth_sg
       # ... more configurations
   ```

### Phase 3: Core Sharding Implementation
1. **Create Sharding Components**
    - `ShardingDataSourceConfig.java`
    - `ShardRoutingDataSource.java`
    - `ShardContext.java` (ThreadLocal storage)
    - `ShardInterceptor.java` (Automatic shard detection)
    - `ShardKeyResolver.java` (Business logic for shard selection)

2. **Update Repositories**
    - Add shard-aware methods
    - Implement multi-shard queries where needed
    - Add caching for cross-shard lookups

3. **Service Layer Updates**
    - Inject shard context in service methods
    - Handle cross-shard transactions
    - Update event publishers to include shard info

### Phase 4: Email-Based Lookup Solution
**Recommended**: Redis Cache + Lazy Scatter-Gather

1. **Create Email-to-Shard Cache**
   ```java
   @Service
   public class ShardLookupService {
 
       @Autowired
       private RedisTemplate<String, String> redisTemplate;
 
       public String findShardByEmail(String email) {
           // Check cache
           String cachedShard = redisTemplate.opsForValue().get("email:shard:" + email);
           if (cachedShard != null) return cachedShard;
 
           // Scatter-gather across all shards
           return scatterGatherFindByEmail(email);
       }
 
       private String scatterGatherFindByEmail(String email) {
           List<CompletableFuture<Optional<String>>> futures = new ArrayList<>();
 
           for (String shardKey : ALL_SHARD_KEYS) {
               futures.add(CompletableFuture.supplyAsync(() -> {
                   ShardContext.setShardKey(shardKey);
                   try {
                       Optional<CompanyAccount> account =
                           companyAccountRepository.findByEmail(email);
                       return account.isPresent()
                           ? Optional.of(shardKey)
                           : Optional.empty();
                   } finally {
                       ShardContext.clear();
                   }
               }));
           }
 
           // Wait for first non-empty result
           String foundShard = futures.stream()
               .map(CompletableFuture::join)
               .filter(Optional::isPresent)
               .map(Optional::get)
               .findFirst()
               .orElse(null);
 
           // Cache the result
           if (foundShard != null) {
               redisTemplate.opsForValue().set(
                   "email:shard:" + email,
                   foundShard,
                   Duration.ofDays(30)
               );
           }
 
           return foundShard;
       }
   }
   ```

### Phase 5: Cross-Shard Query Handling
1. **Identify All Cross-Shard Queries**
    - Document which queries need multi-shard access
    - Prioritize by frequency and performance impact

2. **Implement Solutions**
    - **Option A**: API-level aggregation (query all shards, merge results)
    - **Option B**: Elasticsearch for search queries
    - **Option C**: Read replica with aggregated data

3. **Example: Global Company Search**
   ```java
   @Service
   public class GlobalCompanySearchService {
 
       public List<Company> searchCompanies(String name, Pageable pageable) {
           List<Company> allResults = new ArrayList<>();
 
           // Query all shards in parallel
           List<CompletableFuture<List<Company>>> futures = ALL_SHARD_KEYS.stream()
               .map(shardKey -> CompletableFuture.supplyAsync(() -> {
                   ShardContext.setShardKey(shardKey);
                   try {
                       return companyRepository.searchByName(name);
                   } finally {
                       ShardContext.clear();
                   }
               }))
               .toList();
 
           // Aggregate results
           futures.forEach(future -> {
               allResults.addAll(future.join());
           });
 
           // Apply pagination
           return allResults.stream()
               .sorted(Comparator.comparing(Company::getName))
               .skip(pageable.getOffset())
               .limit(pageable.getPageSize())
               .toList();
       }
   }
   ```

### Phase 6: Testing & Validation
1. **Unit Tests**
    - Test shard routing logic
    - Test each shard independently
    - Test multi-shard queries

2. **Integration Tests**
    - End-to-end flows with multiple shards
    - Cross-shard transactions
    - Event propagation across shards

3. **Performance Tests**
    - Compare single-shard vs multi-shard query performance
    - Load testing with realistic data distribution
    - Cache hit rates for email lookups

4. **Data Consistency Tests**
    - Verify event-driven flows work across shards
    - Test idempotency
    - Verify no data loss during shard routing

### Phase 7: Migration Strategy
1. **Create Migration Tool**
    - Read existing data
    - Determine shard for each record (based on country)
    - Insert into appropriate shard database
    - Verify data integrity

2. **Migration Process**
   ```
   1. Enable read-only mode
   2. Export data from single database
   3. Run migration script
   4. Validate data in all shards
   5. Switch application to sharded mode
   6. Verify application health
   7. Keep old database as backup (1 week)
   ```

3. **Rollback Plan**
    - Keep old database
    - Feature flag to switch between single/sharded mode
    - Data sync tool (if needed to rollback)

### Phase 8: Monitoring & Optimization
1. **Add Metrics**
    - Shard distribution (% of queries per shard)
    - Cross-shard query frequency
    - Cache hit rates
    - Query latency per shard

2. **Set Up Alerts**
    - Shard connection failures
    - Uneven shard load distribution
    - Cache miss rate threshold
    - Cross-shard query threshold

3. **Optimize**
    - Rebalance shards if needed
    - Tune cache TTLs
    - Add indexes based on query patterns

---

## 9. Recommended Tools & Libraries

### 9.1 For Application-Level Sharding
```xml
<!-- Already in your pom.xml, no additional dependencies needed -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 9.2 Optional: ShardingSphere (Alternative Approach)
```xml
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-jdbc-core</artifactId>
    <version>5.4.1</version>
</dependency>
```

**Note**: ShardingSphere can handle routing automatically, but has a learning curve.

### 9.3 Monitoring & Observability
```xml
<!-- Already have actuator, add metrics -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```
 
---

## 11. Testing Checklist

### 11.1 Before Starting Development
- [ ] Understand current architecture
- [ ] Review all entity relationships
- [ ] Identify all cross-service queries
- [ ] Map out shard distribution strategy
- [ ] Plan migration approach

### 11.2 During Development
- [ ] Fix data type inconsistencies (UUID vs Long)
- [ ] Set up multiple test databases
- [ ] Implement shard routing logic
- [ ] Add email-to-shard lookup
- [ ] Handle cross-shard queries
- [ ] Update Kafka events with shard info
- [ ] Add comprehensive logging

### 11.3 Before Deployment
- [ ] All unit tests pass
- [ ] Integration tests with multiple shards pass
- [ ] Performance tests show improvement
- [ ] Migration script tested on copy of production data
- [ ] Rollback procedure documented and tested
- [ ] Monitoring dashboards created
- [ ] Team trained on new architecture

---

## 12. Risks & Mitigation

### 12.1 Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data type inconsistency causes bugs | High | High | Fix before starting sharding |
| Cross-shard queries too slow | Medium | Medium | Implement caching, use Elasticsearch |
| Email lookup requires scatter-gather | Medium | High | Redis cache + lazy loading |
| Kafka events missing shard info | High | Medium | Add shardKey to all events |
| Migration data loss | Critical | Low | Thorough testing, keep backups |
| Uneven shard distribution | Medium | Medium | Monitor and rebalance |
| Transaction across shards fails | High | Low | Avoid cross-shard transactions, use events |

### 12.2 Mitigation Strategies
1. **Start Small**: Shard only Auth service first, validate, then expand
2. **Feature Flags**: Allow switching between sharded/non-sharded modes
3. **Comprehensive Testing**: Test with realistic data volumes
4. **Gradual Rollout**: Deploy to staging first, monitor for 1 week
5. **Rollback Plan**: Always have a way back

---

## 13. Performance Expectations

### 13.1 Before Sharding (Current)
- Single database handles all requests
- Bottleneck: Database connection pool
- Latency increases with data volume

### 13.2 After Sharding (Expected)
- **Single-shard queries**: 30-50% faster (less data per shard)
- **Multi-shard queries**: May be slower (network overhead)
- **Write throughput**: 3-5x improvement (parallel writes)
- **Read throughput**: Depends on query distribution

### 13.3 Optimization Opportunities
1. **Vietnam & Singapore**: Dedicated shards (primary markets)
2. **Regional Grouping**: Other SEA countries share a shard
3. **Auto-scaling**: Each shard can scale independently
4. **Geographic Locality**: Deploy shards closer to users

---

## 14. Conclusion & Recommendations

### 14.1 Key Findings
✅ **Good News**:
- Sharding strategy already defined (Country enum)
- Microservices architecture is shard-friendly
- Database-per-service pattern in place
- Event-driven communication supports sharding
- Redis available for caching

⚠️ **Challenges**:
- Data type inconsistencies must be fixed first
- Email-based auth needs special handling
- Cross-shard queries need optimization
- No existing multi-datasource setup

### 14.2 Recommended Approach
1. **Strategy**: Application-level sharding using `AbstractRoutingDataSource`
2. **Priority**: Start with Auth service, then Company, then JobPost
3. **Email Lookups**: Redis cache + scatter-gather fallback
4. **Cross-Shard Queries**: API aggregation for low-frequency queries
5. **Migration**: Blue-green deployment with feature flag

### 14.3 Estimated Effort
- **Preparation & Cleanup**: 1-2 weeks
- **Core Sharding Implementation**: 2-3 weeks
- **Email Lookup & Cross-Shard**: 1-2 weeks
- **Testing & Validation**: 1-2 weeks
- **Migration & Deployment**: 1 week
- **Total**: 6-10 weeks

### 14.4 Next Steps
1. **Immediate**: Fix UUID/Long inconsistency in JobPost
2. **Week 1-2**: Set up sharded databases in docker-compose
3. **Week 3-4**: Implement ShardingDataSource and routing logic
4. **Week 5-6**: Handle email lookups and cross-shard queries
5. **Week 7-8**: Comprehensive testing
6. **Week 9-10**: Migration and deployment

---

## 15. Additional Resources

### 15.1 Documentation to Read
- Spring AbstractRoutingDataSource: [Official Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/datasource/lookup/AbstractRoutingDataSource.html)
- Database Sharding Best Practices
- Citus for PostgreSQL (if considering database-level sharding)

### 15.2 Reference Implementations
- Look for open-source projects using Spring + sharding
- Study Netflix's architecture (Eureka + sharding patterns)
 
---

**Report Generated**: 2025-12-21
**Branch**: develop
**Commit**: 5afa68d
**Status**: Ready for development ✅