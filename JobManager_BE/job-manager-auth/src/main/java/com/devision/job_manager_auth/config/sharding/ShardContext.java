package com.devision.job_manager_auth.config.sharding;


import lombok.extern.slf4j.Slf4j;

/*
 * telling the database layer which shard to query
 * */
@Slf4j
public class ShardContext {
    private static final ThreadLocal<String> currentShard = new ThreadLocal<>();

    // Define the default shard for fallback
    public static final String DEFAULT_SHARD = "auth_shard_others";

    public static void setShardKey(String shardKey) {
        log.debug("Setting shard context to: {}", shardKey);
        currentShard.set(shardKey);
    }

    public static String getShardKey() {
        String shard = currentShard.get();
        if (shard == null) {
            log.debug("No shard context set, using default: {}", DEFAULT_SHARD);
            return DEFAULT_SHARD;
        }
        return shard;
    }

    /**
     * Clear the shard context for this thread.
     * Should be called after request processing is complete to prevent memory leaks.
     */
    public static void clear() {
        log.debug("Clearing shard context");
        currentShard.remove();
    }

    /**
     *
     * @return true if a shard has been set, false otherwise
     */
    public static boolean isSet() {
        return currentShard.get() != null;
    }
}
