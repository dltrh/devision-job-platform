package com.devision.job_manager_auth.service.internal;

import java.util.UUID;

// Service for migrating company accounts between shards when country changes
public interface ShardMigrationService {
    
    /**
     * Migrate a company account from one shard to another.
     * 
     * @param companyId The company ID
     * @param previousCountryCode The previous country code (source shard)
     * @param newCountryCode The new country code (target shard)
     */
    void migrateCompanyAccount(UUID companyId, String previousCountryCode, String newCountryCode);
}
