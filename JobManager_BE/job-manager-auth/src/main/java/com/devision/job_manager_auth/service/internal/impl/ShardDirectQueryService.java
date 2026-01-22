package com.devision.job_manager_auth.service.internal.impl;

import com.devision.job_manager_auth.entity.AuthProvider;
import com.devision.job_manager_auth.entity.CompanyAccount;
import com.devision.job_manager_auth.entity.Country;
import com.devision.job_manager_auth.entity.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Service
@Slf4j
public class ShardDirectQueryService {

    private final Map<String, JdbcTemplate> shardJdbcTemplates;

    private static final List<String> SHARD_KEYS = List.of(
            "auth_shard_vn",
            "auth_shard_sg",
            "auth_shard_asia",
            "auth_shard_oceania",
            "auth_shard_na",
            "auth_shard_eu",
            "auth_shard_others"
    );

    private static final String EXISTS_BY_EMAIL_SQL = """
        SELECT COUNT(*) FROM company_account
        WHERE email = ?
        """;

    private static final String FIND_BY_ACTIVATION_TOKEN_SQL = """
            SELECT id, email, password_hash, country, auth_provider, sso_provider_id,
                   role, is_activated, activation_token, activation_token_expiry,
                   failed_login_attempts, is_locked, last_failed_login_time,
                   password_reset_token, password_reset_token_expiry,
                   created_at, updated_at
            FROM company_account
            WHERE activation_token = ?
            """;

    private static final String FIND_BY_PASSWORD_RESET_TOKEN_SQL = """
            SELECT id, email, password_hash, country, auth_provider, sso_provider_id,
                   role, is_activated, activation_token, activation_token_expiry,
                   failed_login_attempts, is_locked, last_failed_login_time,
                   password_reset_token, password_reset_token_expiry,
                   created_at, updated_at
            FROM company_account
            WHERE password_reset_token = ?
            """;

    private static final String FIND_BY_SSO_PROVIDER_SQL = """
            SELECT id, email, password_hash, country, auth_provider, sso_provider_id,
                   role, is_activated, activation_token, activation_token_expiry,
                   failed_login_attempts, is_locked, last_failed_login_time,
                   password_reset_token, password_reset_token_expiry,
                   created_at, updated_at
            FROM company_account
            WHERE auth_provider = ? AND sso_provider_id = ?
            """;

    private static final String EXISTS_BY_SSO_PROVIDER_SQL = """
            SELECT COUNT(*) FROM company_account
            WHERE auth_provider = ? AND sso_provider_id = ?
            """;

    private static final String FIND_BY_ID_SQL = """
            SELECT id, email, password_hash, country, auth_provider, sso_provider_id,
                   role, is_activated, activation_token, activation_token_expiry,
                   failed_login_attempts, is_locked, last_failed_login_time,
                   password_reset_token, password_reset_token_expiry,
                   created_at, updated_at
            FROM company_account
            WHERE id = ?
            """;

    public ShardDirectQueryService(
            @Qualifier("shardDataSources") Map<String, DataSource> shardDataSources) {

        this.shardJdbcTemplates = new HashMap<>();
        for (Map.Entry<String, DataSource> entry : shardDataSources.entrySet()) {
            this.shardJdbcTemplates.put(entry.getKey(), new JdbcTemplate(entry.getValue()));
            log.info("Created JdbcTemplate for shard: {}", entry.getKey());
        }
        log.info("ShardDirectQueryService initialized with {} shards", shardJdbcTemplates.size());
    }

    /**
     * Find account by activation token across all shards (scatter-gather)
     */
    public Optional<CompanyAccount> findByActivationTokenAcrossShards(String token) {
        log.debug("Searching for activation token across all shards");

        for (String shardKey : SHARD_KEYS) {
            JdbcTemplate jdbcTemplate = shardJdbcTemplates.get(shardKey);
            if (jdbcTemplate == null) {
                log.warn("No JdbcTemplate found for shard: {}", shardKey);
                continue;
            }

            try {
                log.debug("Querying shard '{}' for activation token", shardKey);
                List<CompanyAccount> results = jdbcTemplate.query(
                        FIND_BY_ACTIVATION_TOKEN_SQL,
                        new CompanyAccountRowMapper(),
                        token
                );

                if (!results.isEmpty()) {
                    log.info("Found account with activation token in shard '{}'", shardKey);
                    return Optional.of(results.get(0));
                }
                log.debug("Activation token not found in shard '{}'", shardKey);
            } catch (Exception e) {
                log.error("Error querying shard '{}' for activation token: {}", shardKey, e.getMessage());
            }
        }

        log.warn("Activation token not found in any shard");
        return Optional.empty();
    }

    /**
     * Find account by password reset token across all shards (scatter-gather)
     */
    public Optional<CompanyAccount> findByPasswordResetTokenAcrossShards(String token) {
        log.debug("Searching for password reset token across all shards");

        for (String shardKey : SHARD_KEYS) {
            JdbcTemplate jdbcTemplate = shardJdbcTemplates.get(shardKey);
            if (jdbcTemplate == null) continue;

            try {
                log.debug("Querying shard '{}' for password reset token", shardKey);
                List<CompanyAccount> results = jdbcTemplate.query(
                        FIND_BY_PASSWORD_RESET_TOKEN_SQL,
                        new CompanyAccountRowMapper(),
                        token
                );

                if (!results.isEmpty()) {
                    log.info("Found account with password reset token in shard '{}'", shardKey);
                    return Optional.of(results.get(0));
                }
            } catch (Exception e) {
                log.error("Error querying shard '{}' for password reset token: {}", shardKey, e.getMessage());
            }
        }

        log.warn("Password reset token not found in any shard");
        return Optional.empty();
    }

    /**
     * Find account by SSO provider ID across all shards (scatter-gather)
     */
    public Optional<CompanyAccount> findBySsoProviderIdAcrossShards(AuthProvider provider, String ssoProviderId) {
        log.debug("Searching for SSO provider ID across all shards");

        for (String shardKey : SHARD_KEYS) {
            JdbcTemplate jdbcTemplate = shardJdbcTemplates.get(shardKey);
            if (jdbcTemplate == null) continue;

            try {
                log.debug("Querying shard '{}' for SSO provider ID", shardKey);
                List<CompanyAccount> results = jdbcTemplate.query(
                        FIND_BY_SSO_PROVIDER_SQL,
                        new CompanyAccountRowMapper(),
                        provider.name(),
                        ssoProviderId
                );

                if (!results.isEmpty()) {
                    log.info("Found account with SSO provider ID in shard '{}'", shardKey);
                    return Optional.of(results.get(0));
                }
            } catch (Exception e) {
                log.error("Error querying shard '{}' for SSO provider ID: {}", shardKey, e.getMessage());
            }
        }

        log.debug("SSO provider ID not found in any shard");
        return Optional.empty();
    }

    /**
     * Check if SSO provider ID exists in any shard
     */
    public boolean ssoProviderIdExistsInAnyShard(AuthProvider provider, String ssoProviderId) {
        log.debug("Checking if SSO provider ID exists in any shard");

        for (String shardKey : SHARD_KEYS) {
            JdbcTemplate jdbcTemplate = shardJdbcTemplates.get(shardKey);
            if (jdbcTemplate == null) continue;

            try {
                Integer count = jdbcTemplate.queryForObject(
                        EXISTS_BY_SSO_PROVIDER_SQL,
                        Integer.class,
                        provider.name(),
                        ssoProviderId
                );

                if (count != null && count > 0) {
                    log.info("SSO provider ID exists in shard '{}'", shardKey);
                    return true;
                }
            } catch (Exception e) {
                log.error("Error checking shard '{}' for SSO provider ID: {}", shardKey, e.getMessage());
            }
        }

        return false;
    }

    public boolean emailExistsInAnyShard(String email) {
        log.debug("Checking if email '{}' exists in any shard", email);

        for (String shardKey : SHARD_KEYS) {
            JdbcTemplate jdbcTemplate = shardJdbcTemplates.get(shardKey);
            if (jdbcTemplate == null) continue;

            try {
                Integer count = jdbcTemplate.queryForObject(
                        EXISTS_BY_EMAIL_SQL,
                        Integer.class,
                        email
                );

                if (count != null && count > 0) {
                    log.info("Email '{}' already exists in shard '{}'", email, shardKey);
                    return true;
                }
            } catch (Exception e) {
                log.error("Error checking shard '{}' for email: {}", shardKey, e.getMessage());
            }
        }

        log.debug("Email '{}' not found in any shard", email);
        return false;
    }

    /**
     * Find account by ID across all shards (scatter-gather)
     * Returns a record containing both the account and the shard key where it was found
     */
    public Optional<AccountWithShard> findByIdAcrossShards(UUID companyId) {
        log.debug("Searching for company ID {} across all shards", companyId);

        for (String shardKey : SHARD_KEYS) {
            JdbcTemplate jdbcTemplate = shardJdbcTemplates.get(shardKey);
            if (jdbcTemplate == null) continue;

            try {
                log.debug("Querying shard '{}' for company ID {}", shardKey, companyId);
                List<CompanyAccount> results = jdbcTemplate.query(
                        FIND_BY_ID_SQL,
                        new CompanyAccountRowMapper(),
                        companyId
                );

                if (!results.isEmpty()) {
                    log.info("Found company account with ID {} in shard '{}'", companyId, shardKey);
                    return Optional.of(new AccountWithShard(results.get(0), shardKey));
                }
            } catch (Exception e) {
                log.error("Error querying shard '{}' for company ID {}: {}", shardKey, companyId, e.getMessage());
            }
        }

        log.warn("Company account with ID {} not found in any shard", companyId);
        return Optional.empty();
    }

    /**
     * Record to hold both the account and the shard where it was found
     */
    public record AccountWithShard(CompanyAccount account, String shardKey) {}

    /**
     * Get all shard keys
     */
    public List<String> getShardKeys() {
        return SHARD_KEYS;
    }

    /**
     * Insert a company account into a specific shard using direct JDBC.
     * This avoids Hibernate session issues when doing cross-shard operations.
     */
    public void insertAccountInShard(CompanyAccount account, String shardKey) {
        JdbcTemplate jdbcTemplate = shardJdbcTemplates.get(shardKey);
        if (jdbcTemplate == null) {
            throw new IllegalStateException("No JdbcTemplate found for shard: " + shardKey);
        }

        String insertSql = """
            INSERT INTO company_account (
                id, email, password_hash, country, auth_provider, sso_provider_id,
                role, is_activated, activation_token, activation_token_expiry,
                failed_login_attempts, is_locked, last_failed_login_time,
                password_reset_token, password_reset_token_expiry,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        
        jdbcTemplate.update(insertSql,
                account.getId(),
                account.getEmail(),
                account.getPasswordHash(),
                account.getCountry() != null ? account.getCountry().name() : null,
                account.getAuthProvider() != null ? account.getAuthProvider().name() : null,
                account.getSsoProviderId(),
                account.getRole() != null ? account.getRole().name() : null,
                account.getIsActivated(),
                account.getActivationToken(),
                account.getActivationTokenExpiry() != null ? 
                    java.sql.Timestamp.valueOf(account.getActivationTokenExpiry()) : null,
                account.getFailedLoginAttempts(),
                account.getIsLocked(),
                account.getLastFailedLoginTime() != null ? 
                    java.sql.Timestamp.valueOf(account.getLastFailedLoginTime()) : null,
                account.getPasswordResetToken(),
                account.getPasswordResetTokenExpiry() != null ? 
                    java.sql.Timestamp.valueOf(account.getPasswordResetTokenExpiry()) : null,
                java.sql.Timestamp.valueOf(now),
                java.sql.Timestamp.valueOf(now)
        );

        log.info("Inserted company account {} into shard {}", account.getId(), shardKey);
    }

    /**
     * Delete a company account from a specific shard using direct JDBC.
     * This avoids Hibernate session issues when doing cross-shard operations.
     */
    public void deleteAccountFromShard(UUID companyId, String shardKey) {
        JdbcTemplate jdbcTemplate = shardJdbcTemplates.get(shardKey);
        if (jdbcTemplate == null) {
            throw new IllegalStateException("No JdbcTemplate found for shard: " + shardKey);
        }

        String deleteSql = "DELETE FROM company_account WHERE id = ?";
        int rowsAffected = jdbcTemplate.update(deleteSql, companyId);

        if (rowsAffected > 0) {
            log.info("Deleted company account {} from shard {}", companyId, shardKey);
        } else {
            log.warn("No company account found to delete with ID {} in shard {}", companyId, shardKey);
        }
    }

    /**
     * Row mapper for CompanyAccount entity
     */
    private static class CompanyAccountRowMapper implements RowMapper<CompanyAccount> {
        @Override
        public CompanyAccount mapRow(ResultSet rs, int rowNum) throws SQLException {
            CompanyAccount account = new CompanyAccount();

            // UUID - handle PostgreSQL UUID type
            Object idObj = rs.getObject("id");
            if (idObj != null) {
                if (idObj instanceof UUID) {
                    account.setId((UUID) idObj);
                } else {
                    account.setId(UUID.fromString(idObj.toString()));
                }
            }

            account.setEmail(rs.getString("email"));
            account.setPasswordHash(rs.getString("password_hash"));

            // Country enum
            String countryStr = rs.getString("country");
            if (countryStr != null) {
                try {
                    account.setCountry(Country.valueOf(countryStr));
                } catch (IllegalArgumentException e) {
                    // Try to find by code if direct valueOf fails
                    Country country = Country.fromCode(countryStr);
                    if (country != null) {
                        account.setCountry(country);
                    }
                }
            }

            // AuthProvider enum
            String authProviderStr = rs.getString("auth_provider");
            if (authProviderStr != null) {
                account.setAuthProvider(AuthProvider.valueOf(authProviderStr));
            }

            account.setSsoProviderId(rs.getString("sso_provider_id"));

            // Role enum
            String roleStr = rs.getString("role");
            if (roleStr != null) {
                account.setRole(Role.valueOf(roleStr));
            }

            account.setIsActivated(rs.getBoolean("is_activated"));
            account.setActivationToken(rs.getString("activation_token"));

            // LocalDateTime fields
            java.sql.Timestamp activationExpiry = rs.getTimestamp("activation_token_expiry");
            if (activationExpiry != null) {
                account.setActivationTokenExpiry(activationExpiry.toLocalDateTime());
            }

            account.setFailedLoginAttempts(rs.getInt("failed_login_attempts"));
            account.setIsLocked(rs.getBoolean("is_locked"));

            java.sql.Timestamp lastFailed = rs.getTimestamp("last_failed_login_time");
            if (lastFailed != null) {
                account.setLastFailedLoginTime(lastFailed.toLocalDateTime());
            }

            account.setPasswordResetToken(rs.getString("password_reset_token"));

            java.sql.Timestamp resetExpiry = rs.getTimestamp("password_reset_token_expiry");
            if (resetExpiry != null) {
                account.setPasswordResetTokenExpiry(resetExpiry.toLocalDateTime());
            }

            java.sql.Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                account.setCreatedAt(createdAt.toLocalDateTime());
            }

            java.sql.Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                account.setUpdatedAt(updatedAt.toLocalDateTime());
            }

            return account;
        }
    }
}
