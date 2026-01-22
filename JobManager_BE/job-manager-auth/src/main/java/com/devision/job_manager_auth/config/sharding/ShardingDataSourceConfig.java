package com.devision.job_manager_auth.config.sharding;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

/**
 * This class reads the shard configurations, creates connection pools for each database, and sets up Spring's JPA infrastructure to use the routing datasource
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = "com.devision.job_manager_auth.repository",
        entityManagerFactoryRef = "shardingEntityManagerFactory",
        transactionManagerRef = "shardingTransactionManager"
)
public class ShardingDataSourceConfig {
    private final ShardingProperties shardingProperties;
    private final Environment environment;

    /**
     * Creates the routing datasource that delegates to shard-specific datasources
     */
    @Bean
    @Primary
    public DataSource dataSource() {
//        log.info("=== SPRING ENVIRONMENT DEBUG ===");
//        log.info("env.SHARD_VN_URL: {}", environment.getProperty("env.SHARD_VN_URL"));
//        log.info("env.SHARD_OTHERS_URL: {}", environment.getProperty("env.SHARD_OTHERS_URL"));
//        log.info("env.NEON_USERNAME: {}", environment.getProperty("env.NEON_USERNAME"));
//        log.info("SHARD_VN_URL (no prefix): {}", environment.getProperty("SHARD_VN_URL"));
//        log.info("SHARD_OTHERS_URL (no prefix): {}", environment.getProperty("SHARD_OTHERS_URL"));
//        log.info("GOOGLE_CLIENT_ID: {}", environment.getProperty("GOOGLE_CLIENT_ID"));
//        log.info("=== END SPRING ENV DEBUG ===");

        ShardRoutingDataSource routingDataSource = new ShardRoutingDataSource();

        Map<Object, Object> targetDataSources = new HashMap<>();

        log.info("=== SHARDING CONFIGURATION START ===");
        log.info("Number of shards configured: {}", shardingProperties.getShards().size());
        log.info("Default shard: {}", shardingProperties.getDefaultShard());

        log.info("=== SHARDING PROPERTIES DEBUG ===");
        shardingProperties.getShards().forEach((shardKey, shardProps) -> {
            log.info("Configuring datasource for shard: {}", shardKey);
            HikariDataSource ds = createHikariDataSource(shardKey, shardProps);
            log.info("Shard {}: URL = {}", shardKey, shardProps.getUrl());
            targetDataSources.put(shardKey, ds);
        });

        log.info("Total shards configured: {}", targetDataSources.size());
        log.info("Available shard keys: {}", targetDataSources.keySet());
        log.info("=== SHARDING CONFIGURATION END ===");

        routingDataSource.setTargetDataSources(targetDataSources);

        // Set the default datasource
        String defaultShardKey = shardingProperties.getDefaultShard();
        DataSource defaultDataSource = (DataSource) targetDataSources.get(defaultShardKey);

        if (defaultDataSource == null) {
            throw new IllegalStateException(
                    "Default shard '" + defaultShardKey + "' not found in configured shards. " +
                            "Available shards: " + targetDataSources.keySet()
            );
        }

        routingDataSource.setDefaultTargetDataSource(defaultDataSource);
        routingDataSource.afterPropertiesSet();

        log.info("Sharding datasource configured with {} shards. Default shard: {}",
                targetDataSources.size(), defaultShardKey);

        return routingDataSource;
    }

    /**
     * Creates a HikariCP datasource for a specific shard
     */
    private HikariDataSource createHikariDataSource(String shardKey,
                                                    ShardingProperties.ShardProperties props) {
        HikariDataSource dataSource = new HikariDataSource();

        dataSource.setPoolName("HikariPool-" + shardKey);
        dataSource.setJdbcUrl(props.getUrl());
        dataSource.setUsername(props.getUsername());
        dataSource.setPassword(props.getPassword());
        dataSource.setDriverClassName(props.getDriverClassName());

        // Connection pool settings
        dataSource.setMaximumPoolSize(props.getMaximumPoolSize());
        dataSource.setMinimumIdle(props.getMinimumIdle());
        dataSource.setConnectionTimeout(props.getConnectionTimeout());
        dataSource.setIdleTimeout(props.getIdleTimeout());
        dataSource.setMaxLifetime(props.getMaxLifetime());

        // Disable auto-commit for Spring transaction management
        dataSource.setAutoCommit(false);

        return dataSource;
    }

    /**
     * Creates the EntityManagerFactory for JPA using the routing datasource
     */
    @Bean
    @Primary
    public LocalContainerEntityManagerFactoryBean shardingEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("dataSource") DataSource dataSource) {

        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "validate");
        properties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        properties.put("hibernate.show_sql", "true");
        properties.put("hibernate.format_sql", "true");

        return builder
                .dataSource(dataSource)
                .packages("com.devision.job_manager_auth.entity")
                .persistenceUnit("sharding")
                .properties(properties)
                .build();
    }

    /**
     * Creates the transaction manager for the sharding datasource
     */
    @Bean
    @Primary
    public PlatformTransactionManager shardingTransactionManager(
            @Qualifier("shardingEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    @Bean
    @Qualifier("shardDataSources")
    public Map<String, DataSource> shardDataSources() {
        Map<String, DataSource> dataSources = new HashMap<>();

        shardingProperties.getShards().forEach((shardKey, shardConfig) -> {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(shardConfig.getUrl());
            config.setUsername(shardConfig.getUsername());
            config.setPassword(shardConfig.getPassword());
            config.setDriverClassName("org.postgresql.Driver");
            config.setPoolName("DirectPool-" + shardKey);
            config.setMaximumPoolSize(3);  // Smaller pool for scatter-gather
            config.setMinimumIdle(1);
            config.setConnectionTimeout(30000);
            config.setIdleTimeout(600000);
            config.setMaxLifetime(1800000);

            // Disable auto-commit for Spring transaction management
            config.setAutoCommit(false);

            dataSources.put(shardKey, new HikariDataSource(config));
            log.info("Created direct DataSource for shard: {}", shardKey);
        });

        return dataSources;
    }
}
