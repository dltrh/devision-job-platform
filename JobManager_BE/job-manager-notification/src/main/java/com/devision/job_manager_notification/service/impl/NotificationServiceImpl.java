package com.devision.job_manager_notification.service.impl;

import com.devision.job_manager_notification.dto.external.ExternalCreateNotificationRequest;
import com.devision.job_manager_notification.dto.external.ExternalNotificationResponse;
import com.devision.job_manager_notification.dto.external.ExternalNotificationSummaryResponse;
import com.devision.job_manager_notification.dto.internal.InternalCreateNotificationRequest;
import com.devision.job_manager_notification.dto.internal.InternalNotificationResponse;
import com.devision.job_manager_notification.dto.response.ApiResponse;
import com.devision.job_manager_notification.entity.Notification;
import com.devision.job_manager_notification.enums.NotificationStatus;
import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.repository.NotificationRepository;
import com.devision.job_manager_notification.service.ExternalNotificationService;
import com.devision.job_manager_notification.service.InternalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Unified implementation of both internal and external notification services.
 * Implements InternalNotificationService for Kafka/internal use and
 * ExternalNotificationService for REST API use.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements InternalNotificationService, ExternalNotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public ApiResponse<InternalNotificationResponse> createNotification(InternalCreateNotificationRequest request) {
        try {
            Notification notification = Notification.builder()
                    .userId(request.getUserId())
                    .type(request.getType())
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .status(NotificationStatus.UNREAD)
                    .referenceId(request.getReferenceId())
                    .referenceType(request.getReferenceType())
                    .metadata(request.getMetadata())
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            log.info("Notification created successfully for user: {}, type: {}", request.getUserId(), request.getType());

            return ApiResponse.success("Notification created successfully", mapToInternalResponse(savedNotification));
        } catch (Exception e) {
            log.error("Error creating notification for user: {}", request.getUserId(), e);
            return ApiResponse.error("Failed to create notification: " + e.getMessage());
        }
    }

    // Overloaded createNotification method for external requests
    @Override
    @Transactional
    public ApiResponse<ExternalNotificationResponse> createNotification(ExternalCreateNotificationRequest request) {
        try {
            Notification notification = Notification.builder()
                    .userId(request.getUserId())
                    .type(request.getType())
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .status(NotificationStatus.UNREAD)
                    .referenceId(request.getReferenceId())
                    .referenceType(request.getReferenceType())
                    .metadata(request.getMetadata())
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            log.info("Notification created successfully for user: {}, type: {}", request.getUserId(), request.getType());

            return ApiResponse.success("Notification created successfully", mapToExternalResponse(savedNotification));
        } catch (Exception e) {
            log.error("Error creating notification for user: {}", request.getUserId(), e);
            return ApiResponse.error("Failed to create notification: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ExternalNotificationResponse> getNotificationById(UUID notificationId) {
        try {
            Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

            return ApiResponse.success("Notification retrieved successfully", mapToExternalResponse(notification));
        } catch (Exception e) {
            log.error("Error retrieving notification: {}", notificationId, e);
            return ApiResponse.error("Failed to retrieve notification: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Page<ExternalNotificationResponse>> getUserNotifications(UUID userId, Pageable pageable) {
        try {
            Page<Notification> notifications = notificationRepository.findByUserId(userId, pageable);
            Page<ExternalNotificationResponse> response = notifications.map(this::mapToExternalResponse);

            return ApiResponse.success("Notifications retrieved successfully", response);
        } catch (Exception e) {
            log.error("Error retrieving notifications for user: {}", userId, e);
            return ApiResponse.error("Failed to retrieve notifications: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Page<ExternalNotificationResponse>> getUserNotificationsByStatus(UUID userId, NotificationStatus status, Pageable pageable) {
        try {
            Page<Notification> notifications = notificationRepository.findByUserIdAndStatus(userId, status, pageable);
            Page<ExternalNotificationResponse> response = notifications.map(this::mapToExternalResponse);

            return ApiResponse.success("Notifications retrieved successfully", response);
        } catch (Exception e) {
            log.error("Error retrieving notifications by status for user: {}", userId, e);
            return ApiResponse.error("Failed to retrieve notifications: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Page<ExternalNotificationResponse>> getUserNotificationsByType(UUID userId, NotificationType type, Pageable pageable) {
        try {
            Page<Notification> notifications = notificationRepository.findByUserIdAndType(userId, type, pageable);
            Page<ExternalNotificationResponse> response = notifications.map(this::mapToExternalResponse);

            return ApiResponse.success("Notifications retrieved successfully", response);
        } catch (Exception e) {
            log.error("Error retrieving notifications by type for user: {}", userId, e);
            return ApiResponse.error("Failed to retrieve notifications: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ExternalNotificationResponse>> getAllUserNotifications(UUID userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            List<ExternalNotificationResponse> response = notifications.stream()
                    .map(this::mapToExternalResponse)
                    .collect(Collectors.toList());

            return ApiResponse.success("All notifications retrieved successfully", response);
        } catch (Exception e) {
            log.error("Error retrieving all notifications for user: {}", userId, e);
            return ApiResponse.error("Failed to retrieve notifications: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<ExternalNotificationResponse> markAsRead(UUID notificationId) {
        try {
            Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

            int updated = notificationRepository.updateStatus(notificationId, NotificationStatus.READ, LocalDateTime.now());

            if (updated > 0) {
                notification.setStatus(NotificationStatus.READ);
                notification.setReadAt(LocalDateTime.now());
                log.info("Notification marked as read: {}", notificationId);
                return ApiResponse.success("Notification marked as read", mapToExternalResponse(notification));
            } else {
                return ApiResponse.error("Failed to mark notification as read");
            }
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", notificationId, e);
            return ApiResponse.error("Failed to mark notification as read: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<String> markAllAsRead(UUID userId) {
        try {
            int updated = notificationRepository.markAllAsReadByUser(
                    userId,
                    NotificationStatus.READ,
                    LocalDateTime.now(),
                    NotificationStatus.UNREAD
            );

            log.info("Marked {} notifications as read for user: {}", updated, userId);
            return ApiResponse.success("All notifications marked as read", updated + " notifications updated");
        } catch (Exception e) {
            log.error("Error marking all notifications as read for user: {}", userId, e);
            return ApiResponse.error("Failed to mark all notifications as read: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<String> deleteNotification(UUID notificationId) {
        try {
            if (!notificationRepository.existsById(notificationId)) {
                return ApiResponse.error("Notification not found with id: " + notificationId);
            }

            notificationRepository.deleteById(notificationId);
            log.info("Notification deleted: {}", notificationId);
            return ApiResponse.success("Notification deleted successfully", null);
        } catch (Exception e) {
            log.error("Error deleting notification: {}", notificationId, e);
            return ApiResponse.error("Failed to delete notification: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<String> deleteAllUserNotifications(UUID userId) {
        try {
            notificationRepository.deleteByUserId(userId);
            log.info("All notifications deleted for user: {}", userId);
            return ApiResponse.success("All notifications deleted successfully", null);
        } catch (Exception e) {
            log.error("Error deleting all notifications for user: {}", userId, e);
            return ApiResponse.error("Failed to delete all notifications: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ExternalNotificationSummaryResponse> getUserNotificationSummary(UUID userId) {
        try {
            long totalCount = notificationRepository.countByUserId(userId);
            long unreadCount = notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.UNREAD);
            long readCount = notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.READ);
            long archivedCount = notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.ARCHIVED);

            ExternalNotificationSummaryResponse summary = ExternalNotificationSummaryResponse.builder()
                    .totalNotifications(totalCount)
                    .unreadCount(unreadCount)
                    .readCount(readCount)
                    .archivedCount(archivedCount)
                    .build();

            return ApiResponse.success("Notification summary retrieved successfully", summary);
        } catch (Exception e) {
            log.error("Error retrieving notification summary for user: {}", userId, e);
            return ApiResponse.error("Failed to retrieve notification summary: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<String> cleanupOldNotifications(int daysOld) {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
            int deleted = notificationRepository.deleteOldNotifications(cutoffDate, NotificationStatus.READ);

            log.info("Cleaned up {} old notifications older than {} days", deleted, daysOld);
            return ApiResponse.success("Old notifications cleaned up", deleted + " notifications deleted");
        } catch (Exception e) {
            log.error("Error cleaning up old notifications", e);
            return ApiResponse.error("Failed to cleanup old notifications: " + e.getMessage());
        }
    }

    private InternalNotificationResponse mapToInternalResponse(Notification notification) {
        return InternalNotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .status(notification.getStatus())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .metadata(notification.getMetadata())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }

    private ExternalNotificationResponse mapToExternalResponse(Notification notification) {
        return ExternalNotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .status(notification.getStatus())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .metadata(notification.getMetadata())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}
