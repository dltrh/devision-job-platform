package com.devision.job_manager_notification.repository;

import com.devision.job_manager_notification.entity.Notification;
import com.devision.job_manager_notification.enums.NotificationStatus;
import com.devision.job_manager_notification.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // Find notifications by user
    Page<Notification> findByUserId(UUID userId, Pageable pageable);

    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<Notification> findByUserIdAndStatus(UUID userId, NotificationStatus status, Pageable pageable);

    Page<Notification> findByUserIdAndType(UUID userId, NotificationType type, Pageable pageable);

    Page<Notification> findByUserIdAndStatusAndType(UUID userId, NotificationStatus status, NotificationType type, Pageable pageable);

    // Find by reference
    Optional<Notification> findByUserIdAndReferenceIdAndReferenceType(UUID userId, String referenceId, String referenceType);

    List<Notification> findByReferenceIdAndReferenceType(String referenceId, String referenceType);

    // Count queries
    long countByUserIdAndStatus(UUID userId, NotificationStatus status);

    long countByUserId(UUID userId);

    // Mark as read
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status, n.readAt = :readAt WHERE n.id = :id")
    int updateStatus(@Param("id") UUID id, @Param("status") NotificationStatus status, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("UPDATE Notification n SET n.status = :status, n.readAt = :readAt WHERE n.userId = :userId AND n.status = :oldStatus")
    int markAllAsReadByUser(@Param("userId") UUID userId, @Param("status") NotificationStatus status, @Param("readAt") LocalDateTime readAt, @Param("oldStatus") NotificationStatus oldStatus);

    // Delete old notifications
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :beforeDate AND n.status = :status")
    int deleteOldNotifications(@Param("beforeDate") LocalDateTime beforeDate, @Param("status") NotificationStatus status);

    void deleteByUserId(UUID userId);
}
