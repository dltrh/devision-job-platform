package com.devision.job_manager_notification.controller;

import com.devision.job_manager_notification.dto.external.ExternalCreateNotificationRequest;
import com.devision.job_manager_notification.dto.external.ExternalNotificationResponse;
import com.devision.job_manager_notification.dto.external.ExternalNotificationSummaryResponse;
import com.devision.job_manager_notification.dto.response.ApiResponse;
import com.devision.job_manager_notification.enums.NotificationStatus;
import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.service.ExternalNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for notification management.
 * Uses ExternalNotificationService for handling validated external API requests.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final ExternalNotificationService externalNotificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ExternalNotificationResponse>> createNotification(
            @Valid @RequestBody ExternalCreateNotificationRequest request) {
        log.info("Creating notification for user: {}, type: {}", request.getUserId(), request.getType());
        ApiResponse<ExternalNotificationResponse> response = externalNotificationService.createNotification(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<ExternalNotificationResponse>> getNotificationById(
            @PathVariable UUID notificationId) {
        log.info("Retrieving notification: {}", notificationId);
        ApiResponse<ExternalNotificationResponse> response = externalNotificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<ExternalNotificationResponse>>> getUserNotifications(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        log.info("Retrieving notifications for user: {}", userId);

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        ApiResponse<Page<ExternalNotificationResponse>> response = externalNotificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<ApiResponse<List<ExternalNotificationResponse>>> getAllUserNotifications(
            @PathVariable UUID userId) {
        log.info("Retrieving all notifications for user: {}", userId);
        ApiResponse<List<ExternalNotificationResponse>> response = externalNotificationService.getAllUserNotifications(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<ApiResponse<Page<ExternalNotificationResponse>>> getUserNotificationsByStatus(
            @PathVariable UUID userId,
            @PathVariable NotificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Retrieving {} notifications for user: {}", status, userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        ApiResponse<Page<ExternalNotificationResponse>> response = externalNotificationService.getUserNotificationsByStatus(userId, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<ApiResponse<Page<ExternalNotificationResponse>>> getUserNotificationsByType(
            @PathVariable UUID userId,
            @PathVariable NotificationType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Retrieving {} type notifications for user: {}", type, userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        ApiResponse<Page<ExternalNotificationResponse>> response = externalNotificationService.getUserNotificationsByType(userId, type, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<ApiResponse<ExternalNotificationSummaryResponse>> getUserNotificationSummary(
            @PathVariable UUID userId) {
        log.info("Retrieving notification summary for user: {}", userId);
        ApiResponse<ExternalNotificationSummaryResponse> response = externalNotificationService.getUserNotificationSummary(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<ExternalNotificationResponse>> markAsRead(
            @PathVariable UUID notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        ApiResponse<ExternalNotificationResponse> response = externalNotificationService.markAsRead(notificationId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @PathVariable UUID userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        ApiResponse<String> response = externalNotificationService.markAllAsRead(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(
            @PathVariable UUID notificationId) {
        log.info("Deleting notification: {}", notificationId);
        ApiResponse<String> response = externalNotificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteAllUserNotifications(
            @PathVariable UUID userId) {
        log.info("Deleting all notifications for user: {}", userId);
        ApiResponse<String> response = externalNotificationService.deleteAllUserNotifications(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<ApiResponse<String>> cleanupOldNotifications(
            @RequestParam(defaultValue = "30") int daysOld) {
        log.info("Cleaning up notifications older than {} days", daysOld);
        ApiResponse<String> response = externalNotificationService.cleanupOldNotifications(daysOld);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Notification Service is running");
    }
}
