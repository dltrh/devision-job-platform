package com.devision.job_manager_auth.config.sharding;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Data
@Component
@ConfigurationProperties(prefix = "sharding")
public class ShardingProperties {

    // When no shard context is set
    private String defaultShard = "auth_shard_others";

    // Map of shard configurations
    private Map<String, ShardProperties> shards = new HashMap<>();

    // Holds connection details for each shard
    @Data
    public static class ShardProperties {
        private String url;
        private String username;
        private String password;
        private String driverClassName = "org.postgresql.Driver";

        // Connection pool settings
        private int maximumPoolSize = 10;
        private int minimumIdle = 2;
        private long connectionTimeout = 30000;
        private long idleTimeout = 600000;
        private long maxLifetime = 1800000;
    }
}
