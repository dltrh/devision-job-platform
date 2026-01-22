package com.devision.job_manager_auth.repository;

import com.devision.job_manager_auth.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, UUID> {

    // Find recent login attempts for an account
    List<LoginAttempt> findByAccountIdOrderByAttemptedAtDesc(UUID accountId);

    // Find login attempts within a time window for security analysis
    @Query("SELECT la FROM LoginAttempt la WHERE la.account.id = :accountId " +
            "AND la.attemptedAt >= :since ORDER BY la.attemptedAt DESC")
    List<LoginAttempt> findRecentAttempts(
            @Param("accountId") UUID accountId,
            @Param("since") LocalDateTime since
    );

    // Count failed attempts within a time window
    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.account.id = :accountId " +
            "AND la.isSuccess = false AND la.attemptedAt >= :since")
    long countRecentFailedAttempts(
            @Param("accountId") Long accountId,
            @Param("since") LocalDateTime since
    );

    // Count failed attempts from a specific IP within a time window
    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.ipAddress = :ipAddress " +
            "AND la.isSuccess = false AND la.attemptedAt >= :since")
    long countRecentFailedAttemptsFromIp(
            @Param("ipAddress") String ipAddress,
            @Param("since") LocalDateTime since
    );

    // Clean up old login attempts
    void deleteByAttemptedAtBefore(LocalDateTime before);
}
