# JobPost API Testing Setup Guide

## What to Turn On - Complete Checklist

This guide tells you exactly what services to start and how to test the JobPost API with Kafka events.

---

## Prerequisites

Before starting, ensure you have:
- Docker Desktop installed and running
- Java 17+ installed
- Maven installed
- Postman installed

---

## Step 1: Start Required Docker Services

### Option A: Start ONLY JobPost Required Services (Recommended for Testing)

```bash
# Navigate to project root
cd d:\[github] - projects\SYSARCHBackend\JobManager_BE

# If containers already exist (recommended - faster):
docker start zookeeper kafka postgres-jobpost

# If containers don't exist yet (first time):
docker-compose up -d zookeeper kafka postgres-jobpost
```

**What this starts:**
- ✅ **Zookeeper** (port 2181) - Required for Kafka coordination
- ✅ **Kafka** (port 9092) - Message broker for Ultimo 4.3.1 events
- ✅ **PostgreSQL JobPost DB** (port 5434) - Database for job posts

### Option B: Start All Services (If testing full system)

```bash
docker-compose up -d
```

### Verify Services are Running

```bash
# Check running containers
docker ps

# You should see:
# - zookeeper (port 2181)
# - kafka (port 9092)
# - postgres-jobpost (port 5434)
```

---

## Step 2: Start JobPost Microservice

### Using Maven

```bash
# Navigate to JobPost service directory
cd job-manager-jobpost

# Run the service
mvn spring-boot:run
```

### Using IDE (IntelliJ/Eclipse)

1. Open the project in your IDE
2. Navigate to `JobManagerJobpostApplication.java`
3. Right-click → Run

### Verify Service Started Successfully

Check the console output for:
```
✅ Started JobManagerJobpostApplication in X seconds
✅ Tomcat started on port 8083
✅ Kafka topics created successfully
```

The service will automatically create 8 Kafka topics on startup:
1. `jobpost.created`
2. `jobpost.updated`
3. `jobpost.published`
4. `jobpost.unpublished`
5. `jobpost.deleted`
6. **`jobpost.skills.changed`** ⭐ (CRITICAL for Ultimo 4.3.1)
7. **`jobpost.country.changed`** ⭐ (CRITICAL for Ultimo 4.3.1)
8. `jobpost.expiry.reminder`

---

## Step 3: Import Postman Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `d:\[github] - projects\SYSARCHBackend\JobManager_BE\job-manager-jobpost\JobPost_API.postman_collection.json`
4. Collection "JobPost API - With Kafka Skills Update" will appear in your collections

### Configure Postman Variables

The collection includes pre-configured variables. You can customize them:

1. Click on the collection → **Variables** tab
2. Review/update these values:

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `baseUrl` | `http://localhost:8083` | JobPost service URL |
| `companyId` | `550e8400-e29b-41d4-a716-446655440000` | Test company UUID |
| `jobPostId` | `650e8400-e29b-41d4-a716-446655440001` | Test job post UUID |
| `skill1` | `750e8400-e29b-41d4-a716-446655440001` | Test skill UUID 1 |
| `skill2` | `750e8400-e29b-41d4-a716-446655440002` | Test skill UUID 2 |
| `skill3` | `750e8400-e29b-41d4-a716-446655440003` | Test skill UUID 3 |

---

## Step 4: Test the API - Complete Workflow

### Phase 1: Basic CRUD Operations

#### 1. Create a Job Post
- Select request: **"1. Create Job Post"**
- Click **Send**
- Expected: `200 OK` with job post details
- **IMPORTANT**: Copy the returned `id` and update the `jobPostId` variable in Postman

#### 2. Get Job Post by ID
- Select request: **"2. Get Job Post by ID"**
- Ensure `{{jobPostId}}` is set correctly
- Click **Send**
- Expected: `200 OK` with job post details

#### 3. Get All Company Job Posts
- Select request: **"3. Get All Company Job Posts"**
- Click **Send**
- Expected: Paginated list of job posts for the company

#### 4. Update Job Post
- Select request: **"6. Update Job Post"**
- Modify the request body as needed
- Click **Send**
- Expected: `200 OK` with updated details

### Phase 2: Publish/Unpublish

#### 5. Publish Job Post
- Select request: **"7. Publish Job Post"**
- Click **Send**
- Expected: `200 OK` - Job post is now public

#### 6. Get Published Company Job Posts
- Select request: **"4. Get Published Company Job Posts"**
- Click **Send**
- Expected: List includes the published job post

#### 7. Get All Public Job Posts
- Select request: **"5. Get All Public Job Posts"**
- Click **Send**
- Expected: Public feed including your published job post

### Phase 3: Test Kafka Skills Event (CRITICAL for Ultimo 4.3.1) ⭐

#### 8. Update Skills and Trigger Kafka Event
- Select request: **"9. ⭐ Update Skills (Kafka Event)"**
- Review the request body:
  ```json
  {
    "skillIds": [
      "{{skill1}}",
      "{{skill2}}",
      "{{skill3}}"
    ]
  }
  ```
- Click **Send**
- Expected: `200 OK` with message: "Job post skills updated successfully. Notifications sent to matching applicants."

**What happens behind the scenes:**
1. ✅ Skills are updated in database
2. ✅ Added and removed skills are calculated
3. ✅ `JobPostSkillsChangedEvent` is published to Kafka topic: `jobpost.skills.changed`
4. ✅ Event contains: jobPostId, companyId, addedSkills, removedSkills, currentSkills
5. ✅ Other services (like Applicant Search) can consume this event for instant notifications

---

## Step 5: Verify Kafka Events (Ultimo 4.3.1 Proof)

### Option A: Using Kafka Console Consumer

Open a new terminal and run:

```bash
# Monitor the skills changed topic
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic jobpost.skills.changed \
  --from-beginning
```

**Expected output after updating skills:**
```json
{
  "jobPostId": "650e8400-e29b-41d4-a716-446655440001",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Senior Backend Developer",
  "locationCity": "San Francisco",
  "countryCode": null,
  "addedSkills": [
    "750e8400-e29b-41d4-a716-446655440001",
    "750e8400-e29b-41d4-a716-446655440002"
  ],
  "removedSkills": [],
  "currentSkills": [
    "750e8400-e29b-41d4-a716-446655440001",
    "750e8400-e29b-41d4-a716-446655440002",
    "750e8400-e29b-41d4-a716-446655440003"
  ],
  "changedAt": "2025-12-26T10:30:00"
}
```

### Option B: Monitor All Topics

```bash
# See all topics
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --list

# Monitor any specific topic
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic jobpost.created \
  --from-beginning
```

---

## Step 6: Advanced Testing Scenarios

### Scenario 1: Test Skills Addition
1. Create a job post with no skills (empty skillIds array)
2. Update skills to add 3 skills using endpoint 9
3. Check Kafka - should see `addedSkills` with 3 UUIDs, `removedSkills` empty

### Scenario 2: Test Skills Removal
1. Create a job post with 5 skills
2. Update skills to remove 2 skills
3. Check Kafka - should see `removedSkills` with 2 UUIDs

### Scenario 3: Test Skills Replacement
1. Create a job post with skills [A, B, C]
2. Update skills to [D, E, F]
3. Check Kafka - should see:
   - `addedSkills`: [D, E, F]
   - `removedSkills`: [A, B, C]
   - `currentSkills`: [D, E, F]

### Scenario 4: Test Published vs Unpublished
1. Create job post (unpublished by default)
2. Verify it appears in "Get All Company Job Posts"
3. Verify it does NOT appear in "Get All Public Job Posts"
4. Publish the job post
5. Verify it now appears in "Get All Public Job Posts"

---

## Step 7: Cleanup and Shutdown

### Stop JobPost Service
- Press `Ctrl+C` in the terminal running the service
- Or stop from IDE

### Stop Docker Services

```bash
# Stop only JobPost services
docker-compose stop zookeeper kafka postgres-jobpost

# OR stop all services
docker-compose down

# To remove volumes (deletes all data)
docker-compose down -v
```

---

## Troubleshooting

### Issue: JobPost Service Won't Start

**Symptom:** Port 8083 already in use
```bash
# Find process using port 8083
netstat -ano | findstr :8083

# Kill the process (Windows)
taskkill /PID <process_id> /F
```

### Issue: Kafka Connection Failed

**Check Kafka is running:**
```bash
docker ps | grep kafka
```

**Check Kafka logs:**
```bash
docker logs kafka
```

**Restart Kafka:**
```bash
docker-compose restart kafka
```

### Issue: Database Connection Failed

**Check PostgreSQL is running:**
```bash
docker ps | grep postgres-jobpost
```

**Check PostgreSQL logs:**
```bash
docker logs postgres-jobpost
```

**Reset database:**
```bash
docker-compose down postgres-jobpost
docker volume rm jobmanager_be_postgres-jobpost-data
docker-compose up -d postgres-jobpost
```

### Issue: Kafka Events Not Appearing

**Verify topic exists:**
```bash
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --list
```

**Check JobPost service logs:**
Look for: `Publishing JobPostSkillsChangedEvent for job post ID: ...`

**Verify Kafka producer config:**
Check `application.yaml` has `spring.kafka.bootstrap-servers: localhost:9092`

---

## Port Reference

| Service | Port | Purpose |
|---------|------|---------|
| JobPost API | 8083 | REST API endpoints |
| PostgreSQL JobPost | 5434 | Job post database |
| Kafka | 9092 | Message broker |
| Zookeeper | 2181 | Kafka coordination |

---

## Quick Start Checklist

For a fast test session, follow this order:

- [ ] 1. Start Docker services: `docker-compose up -d zookeeper kafka postgres-jobpost`
- [ ] 2. Wait 30 seconds for services to initialize
- [ ] 3. Start JobPost service: `mvn spring-boot:run`
- [ ] 4. Wait for "Started JobManagerJobpostApplication" message
- [ ] 5. Import Postman collection
- [ ] 6. Create a job post (request #1)
- [ ] 7. Copy returned ID to `jobPostId` variable
- [ ] 8. Update skills (request #9) ⭐
- [ ] 9. Open terminal and monitor Kafka topic
- [ ] 10. Verify event appears in Kafka

**Total setup time: ~2 minutes**

---

## Ultimo 4.3.1 Compliance Verification

To demonstrate top marks for Ultimo 4.3.1, show your instructor:

1. **Kafka Event Architecture:**
   - Show [KafkaTopicConfig.java](job-manager-jobpost/src/main/java/com/devision/job_manager_jobpost/config/kafka/KafkaTopicConfig.java) with 8 topics
   - Show critical topics: `jobpost.skills.changed` and `jobpost.country.changed`

2. **Event Publishing Service:**
   - Show [EventPublisherServiceImpl.java](job-manager-jobpost/src/main/java/com/devision/job_manager_jobpost/service/internal/impl/EventPublisherServiceImpl.java)
   - Highlight `publishJobPostSkillsChanged` method

3. **Skills Update Implementation:**
   - Show [JobPostServiceImpl.java:132-187](job-manager-jobpost/src/main/java/com/devision/job_manager_jobpost/service/impl/JobPostServiceImpl.java#L132-L187)
   - Explain: calculates added/removed skills, publishes event after DB commit

4. **REST Endpoint:**
   - Show [JobPostController.java:178-194](job-manager-jobpost/src/main/java/com/devision/job_manager_jobpost/controller/JobPostController.java#L178-L194)
   - Demonstrate in Postman

5. **Live Kafka Event:**
   - Run skills update in Postman
   - Show event in Kafka console consumer in real-time
   - Explain: "This enables instant notifications to applicants matching new skills"

---

## Next Steps (Optional Enhancements)

For even higher marks, consider implementing:

1. **Kafka Consumer in Applicant Search Service:**
   - Consume `jobpost.skills.changed` events
   - Match applicants to new skills
   - Send notifications

2. **Country Code Field:**
   - Add `countryCode` to JobPost model
   - Implement country change tracking
   - Publish `JobPostCountryChangedEvent`

3. **Kafka Event Testing:**
   - Create integration tests for event publishing
   - Add consumer test to verify event structure

4. **Event Monitoring Dashboard:**
   - Add Kafka UI for visual event monitoring
   - Track event metrics (count, latency, failures)

---

## Support Files

Refer to these documentation files for more details:

- [KAFKA_SETUP.md](KAFKA_SETUP.md) - General Kafka setup
- [ULTIMO_KAFKA_ANALYSIS.md](ULTIMO_KAFKA_ANALYSIS.md) - Requirement analysis
- [ULTIMO_IMPLEMENTATION_GUIDE.md](ULTIMO_IMPLEMENTATION_GUIDE.md) - Implementation steps
- [KAFKA_CHECKLIST.md](KAFKA_CHECKLIST.md) - Complete checklist
- [SKILLS_ENDPOINT_ADDED.md](SKILLS_ENDPOINT_ADDED.md) - Skills endpoint details

---

**You're now ready to test JobPost API with Kafka events for Ultimo 4.3.1!** 🎉
