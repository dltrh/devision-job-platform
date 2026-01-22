package com.devision.job_manager_auth.config.sharding;


import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

@Slf4j
public class ShardRoutingDataSource extends AbstractRoutingDataSource {

    // This method is called before each database query to determine which shard's datasource should be used
    @Override
    protected Object determineCurrentLookupKey() {
        String shardKey = ShardContext.getShardKey();
        log.debug("Routing database operation to shard: {}", shardKey);
        return shardKey;
    }
}
