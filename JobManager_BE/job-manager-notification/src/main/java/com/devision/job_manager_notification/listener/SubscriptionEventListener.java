package com.devision.job_manager_notification.listener;

import com.devision.job_manager_notification.dto.internal.InternalCreateNotificationRequest;
import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.event.SubscriptionCancelledEvent;
import com.devision.job_manager_notification.event.SubscriptionCreatedEvent;
import com.devision.job_manager_notification.event.SubscriptionExpiredEvent;
import com.devision.job_manager_notification.event.SubscriptionExpiringSoonEvent;
import com.devision.job_manager_notification.event.SubscriptionRenewedEvent;
import com.devision.job_manager_notification.service.InternalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;


@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionEventListener {

    private final InternalNotificationService internalNotificationService;

    // Date formatter for displaying dates in notifications
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");

    /**
     * Handles SubscriptionCreatedEvent to send a welcome notification.
     *
     * This method is triggered when a company successfully signs up for a premium subscription.
     * It creates a welcome notification congratulating them and outlining the premium features.
     *
     * @param event the subscription created event
     * @param partition the Kafka partition this message came from
     * @param offset the offset of this message in the partition
     */
    @KafkaListener(
            topics = "subscription.created",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleSubscriptionCreated(
            @Payload java.util.Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        SubscriptionCreatedEvent event = null;
        try {
            // Convert Map to SubscriptionCreatedEvent
            event = mapToSubscriptionCreatedEvent(payload);

            log.info("Received SubscriptionCreatedEvent for company: {} from partition: {}, offset: {}",
                    event.getCompanyId(), partition, offset);

            // Validate event data
            if (event.getCompanyId() == null) {
                log.error("SubscriptionCreatedEvent has null companyId, skipping notification creation");
                return;
            }

            // Build welcome message
            String welcomeMessage = buildSubscriptionCreatedMessage(event);

            // Build notification metadata
            String metadata = buildSubscriptionMetadata(
                    event.getSubscriptionId(),
                    event.getPlanType(),
                    event.getPaymentReferenceId()
            );

            // Create notification request
            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.SUBSCRIPTION)
                    .title("🎉 Welcome to Premium!")
                    .message(welcomeMessage)
                    .referenceId(event.getSubscriptionId() != null ? event.getSubscriptionId().toString() : null)
                    .referenceType("SUBSCRIPTION_CREATED")
                    .metadata(metadata)
                    .build();

            // Send notification
            internalNotificationService.createNotification(notification);

            log.info("Successfully created welcome notification for subscription: {} (company: {})",
                    event.getSubscriptionId(), event.getCompanyId());

        } catch (Exception e) {
            log.error("Error processing SubscriptionCreatedEvent for company: {}, subscription: {}, error: {}",
                    event != null ? event.getCompanyId() : "unknown",
                    event != null ? event.getSubscriptionId() : "unknown",
                    e.getMessage(), e);
            // Don't rethrow - we don't want to block the Kafka consumer
            // Consider implementing dead-letter queue for failed events
        }
    }

    /**
     * Handles SubscriptionRenewedEvent to send a renewal confirmation notification.
     *
     * @param event the subscription renewed event
     * @param partition the Kafka partition
     * @param offset the message offset
     */
    @KafkaListener(
            topics = "subscription.renewed",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleSubscriptionRenewed(
            @Payload SubscriptionRenewedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        SubscriptionRenewedEvent validatedEvent = event;
        try {
            // Validate event object
            if (validatedEvent == null) {
                log.error("Received null SubscriptionRenewedEvent - skipping processing");
                return;
            }

            log.info("Received SubscriptionRenewedEvent for company: {} from partition: {}, offset: {}",
                    validatedEvent.getCompanyId(), partition, offset);

            // Validate company ID
            if (validatedEvent.getCompanyId() == null) {
                log.error("SubscriptionRenewedEvent has null companyId, skipping notification creation. Event details - subscriptionId: {}, planType: {}",
                        validatedEvent.getSubscriptionId(), validatedEvent.getPlanType());
                return;
            }

            // Validate subscription ID
            if (event.getSubscriptionId() == null) {
                log.error("SubscriptionRenewedEvent has null subscriptionId for company: {}. Cannot create notification without subscription reference.",
                        event.getCompanyId());
                return;
            }

            // Validate renewal data
            if (event.getRenewalAmount() != null && event.getRenewalAmount() <= 0) {
                log.warn("SubscriptionRenewedEvent has invalid renewal amount: {} for company: {}, subscription: {}",
                        event.getRenewalAmount(), event.getCompanyId(), event.getSubscriptionId());
            }

            if (event.getCurrency() == null || event.getCurrency().trim().isEmpty()) {
                log.warn("SubscriptionRenewedEvent has null/empty currency for company: {}, subscription: {}. Using default.",
                        event.getCompanyId(), event.getSubscriptionId());
            }

            // Validate dates
            if (event.getNewEndAt() == null) {
                log.warn("SubscriptionRenewedEvent has null newEndAt for company: {}, subscription: {}. Subscription may be indefinite.",
                        event.getCompanyId(), event.getSubscriptionId());
            }

            if (event.getPreviousEndAt() != null && event.getNewEndAt() != null) {
                if (event.getNewEndAt().isBefore(event.getPreviousEndAt())) {
                    log.error("SubscriptionRenewedEvent has invalid dates - newEndAt {} is before previousEndAt {} for company: {}, subscription: {}",
                            event.getNewEndAt(), event.getPreviousEndAt(), event.getCompanyId(), event.getSubscriptionId());
                    return;
                }
            }

            log.debug("Building renewal message for subscription: {}, company: {}, amount: {}, currency: {}, autoRenewal: {}",
                    event.getSubscriptionId(), event.getCompanyId(), event.getRenewalAmount(),
                    event.getCurrency(), event.getIsAutoRenewal());

            String renewalMessage = buildSubscriptionRenewedMessage(event);

            if (renewalMessage == null || renewalMessage.trim().isEmpty()) {
                log.error("Failed to build renewal message for subscription: {}, company: {}. Message is null/empty.",
                        event.getSubscriptionId(), event.getCompanyId());
                return;
            }

            log.debug("Building renewal metadata for subscription: {}", event.getSubscriptionId());

            String metadata = buildRenewalMetadata(
                    event.getSubscriptionId(),
                    event.getPlanType(),
                    event.getPaymentReferenceId(),
                    event.getRenewalAmount(),
                    event.getCurrency(),
                    event.getIsAutoRenewal()
            );

            if (metadata == null) {
                log.warn("Metadata is null for subscription renewal: {}, company: {}. Proceeding without metadata.",
                        event.getSubscriptionId(), event.getCompanyId());
            }

            log.debug("Creating notification request for subscription renewal: {}, company: {}",
                    event.getSubscriptionId(), event.getCompanyId());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.SUBSCRIPTION)
                    .title("✅ Subscription Renewed Successfully")
                    .message(renewalMessage)
                    .referenceId(event.getSubscriptionId() != null ? event.getSubscriptionId().toString() : null)
                    .referenceType("SUBSCRIPTION_RENEWED")
                    .metadata(metadata)
                    .build();

            if (notification == null) {
                log.error("Failed to build notification request for subscription renewal: {}, company: {}",
                        event.getSubscriptionId(), event.getCompanyId());
                return;
            }

            log.debug("Persisting renewal notification to database for company: {}", event.getCompanyId());

            internalNotificationService.createNotification(notification);

            log.info("Successfully created renewal notification for subscription: {} (company: {}), amount: {}, autoRenewal: {}",
                    event.getSubscriptionId(), event.getCompanyId(), event.getRenewalAmount(), event.getIsAutoRenewal());

        } catch (NullPointerException e) {
            log.error("Null pointer exception processing SubscriptionRenewedEvent for company: {}, subscription: {}. Missing required field.",
                    event != null ? event.getCompanyId() : "unknown",
                    event != null ? event.getSubscriptionId() : "unknown", e);
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument processing SubscriptionRenewedEvent for company: {}, subscription: {}. Error: {}",
                    event != null ? event.getCompanyId() : "unknown",
                    event != null ? event.getSubscriptionId() : "unknown",
                    e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error processing SubscriptionRenewedEvent for company: {}, subscription: {}, error: {}",
                    event != null ? event.getCompanyId() : "unknown",
                    event != null ? event.getSubscriptionId() : "unknown",
                    e.getMessage(), e);
        }
    }

    /**
     * Handles SubscriptionExpiredEvent to send an expiration alert notification.
     *
     * @param event the subscription expired event
     * @param partition the Kafka partition
     * @param offset the message offset
     */
    @KafkaListener(
            topics = "subscription.expired",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleSubscriptionExpired(
            @Payload SubscriptionExpiredEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        SubscriptionExpiredEvent validatedEvent = event;
        try {
            // Validate event object
            if (validatedEvent == null) {
                log.error("Received null SubscriptionExpiredEvent from partition: {}, offset: {} - skipping processing",
                        partition, offset);
                return;
            }

            log.info("Received SubscriptionExpiredEvent for company: {} from partition: {}, offset: {}",
                    validatedEvent.getCompanyId(), partition, offset);

            // Validate company ID
            if (validatedEvent.getCompanyId() == null) {
                log.error("SubscriptionExpiredEvent has null companyId, skipping notification creation. SubscriptionId: {}, planType: {}, expirationReason: {}",
                        validatedEvent.getSubscriptionId(), validatedEvent.getPlanType(), validatedEvent.getExpirationReason());
                return;
            }

            // Validate subscription ID
            if (validatedEvent.getSubscriptionId() == null) {
                log.error("SubscriptionExpiredEvent has null subscriptionId for company: {}. Cannot track expiration without subscription ID.",
                        validatedEvent.getCompanyId());
                return;
            }

            // Validate expiration date
            if (validatedEvent.getExpiredAt() == null) {
                log.warn("SubscriptionExpiredEvent has null expiredAt for company: {}, subscription: {}. Using current timestamp.",
                        validatedEvent.getCompanyId(), validatedEvent.getSubscriptionId());
            }

            // Validate expiration reason
            if (validatedEvent.getExpirationReason() == null || validatedEvent.getExpirationReason().trim().isEmpty()) {
                log.warn("SubscriptionExpiredEvent has null/empty expirationReason for company: {}, subscription: {}. Using default reason.",
                        validatedEvent.getCompanyId(), validatedEvent.getSubscriptionId());
            }

            // Log additional context
            log.debug("Processing subscription expiration for company: {}, subscription: {}, planType: {}, reason: {}, hadAutoRenewal: {}",
                    validatedEvent.getCompanyId(), validatedEvent.getSubscriptionId(), validatedEvent.getPlanType(),
                    validatedEvent.getExpirationReason(), validatedEvent.getHadAutoRenewal());

            log.debug("Building expiration message for subscription: {}", validatedEvent.getSubscriptionId());

            String expirationMessage = buildSubscriptionExpiredMessage(validatedEvent);

            if (expirationMessage == null || expirationMessage.trim().isEmpty()) {
                log.error("Failed to build expiration message for subscription: {}, company: {}. Message is null/empty.",
                        validatedEvent.getSubscriptionId(), validatedEvent.getCompanyId());
                return;
            }

            log.debug("Building expiration metadata for subscription: {}", validatedEvent.getSubscriptionId());

            String metadata = buildExpirationMetadata(
                    validatedEvent.getSubscriptionId(),
                    validatedEvent.getPlanType(),
                    validatedEvent.getExpirationReason(),
                    validatedEvent.getHadAutoRenewal()
            );

            if (metadata == null) {
                log.warn("Metadata is null for subscription expiration: {}, company: {}. Proceeding without metadata.",
                        validatedEvent.getSubscriptionId(), validatedEvent.getCompanyId());
            }

            log.debug("Creating expiration notification request for company: {}", validatedEvent.getCompanyId());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(validatedEvent.getCompanyId())
                    .type(NotificationType.ALERT)
                    .title("⚠️ Subscription Expired")
                    .message(expirationMessage)
                    .referenceId(validatedEvent.getSubscriptionId() != null ? validatedEvent.getSubscriptionId().toString() : null)
                    .referenceType("SUBSCRIPTION_EXPIRED")
                    .metadata(metadata)
                    .build();

            if (notification == null) {
                log.error("Failed to build notification request for subscription expiration: {}, company: {}",
                        validatedEvent.getSubscriptionId(), validatedEvent.getCompanyId());
                return;
            }

            log.debug("Persisting expiration notification to database for company: {}", validatedEvent.getCompanyId());

            internalNotificationService.createNotification(notification);

            log.info("Successfully created expiration notification for subscription: {} (company: {}), reason: {}, hadAutoRenewal: {}",
                    validatedEvent.getSubscriptionId(), validatedEvent.getCompanyId(),
                    validatedEvent.getExpirationReason(), validatedEvent.getHadAutoRenewal());

        } catch (NullPointerException e) {
            log.error("Null pointer exception processing SubscriptionExpiredEvent for company: {}, subscription: {}. Missing required field in event data.",
                    validatedEvent != null ? validatedEvent.getCompanyId() : "unknown",
                    validatedEvent != null ? validatedEvent.getSubscriptionId() : "unknown", e);
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument processing SubscriptionExpiredEvent for company: {}, subscription: {}. Invalid data in event: {}",
                    validatedEvent != null ? validatedEvent.getCompanyId() : "unknown",
                    validatedEvent != null ? validatedEvent.getSubscriptionId() : "unknown",
                    e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error processing SubscriptionExpiredEvent for company: {}, subscription: {}, error: {}. Stack trace: ",
                    validatedEvent != null ? validatedEvent.getCompanyId() : "unknown",
                    validatedEvent != null ? validatedEvent.getSubscriptionId() : "unknown",
                    e.getMessage(), e);
        }
    }

    /**
     * Handles SubscriptionCancelledEvent to send a cancellation confirmation notification.
     *
     * @param event the subscription cancelled event
     * @param partition the Kafka partition
     * @param offset the message offset
     */
    @KafkaListener(
            topics = "subscription.cancelled",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleSubscriptionCancelled(
            @Payload SubscriptionCancelledEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            log.info("Received SubscriptionCancelledEvent for company: {} from partition: {}, offset: {}",
                    event.getCompanyId(), partition, offset);

            if (event.getCompanyId() == null) {
                log.error("SubscriptionCancelledEvent has null companyId, skipping notification creation");
                return;
            }

            String cancellationMessage = buildSubscriptionCancelledMessage(event);

            String metadata = buildCancellationMetadata(
                    event.getSubscriptionId(),
                    event.getPlanType(),
                    event.getCancellationReason(),
                    event.getIsImmediateCancellation(),
                    event.getCancelledByType()
            );

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.SUBSCRIPTION)
                    .title("Subscription Cancelled")
                    .message(cancellationMessage)
                    .referenceId(event.getSubscriptionId() != null ? event.getSubscriptionId().toString() : null)
                    .referenceType("SUBSCRIPTION_CANCELLED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);

            log.info("Successfully created cancellation notification for subscription: {} (company: {})",
                    event.getSubscriptionId(), event.getCompanyId());

        } catch (Exception e) {
            log.error("Error processing SubscriptionCancelledEvent for company: {}, subscription: {}",
                    event.getCompanyId(), event.getSubscriptionId(), e);
        }
    }

    /**
     * Handles subscription updated events (including cancellations).
     * This listener monitors the company.subscription.updated topic to detect status changes.
     *
     * @param payload the event payload as Map
     * @param partition the Kafka partition
     * @param offset the message offset
     */
    @KafkaListener(
            topics = "company.subscription.updated",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleSubscriptionUpdated(
            @Payload java.util.Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            log.info("Received subscription updated event from partition: {}, offset: {}", partition, offset);
            log.debug("Payload: {}", payload);

            if (payload == null || payload.isEmpty()) {
                log.error("Received null or empty payload for subscription updated event");
                return;
            }

            java.util.UUID companyId = null;
            String status = null;
            Boolean isPremium = null;

            try {
                if (payload.get("companyId") != null) {
                    companyId = java.util.UUID.fromString(payload.get("companyId").toString());
                }
                if (payload.get("status") != null) {
                    status = payload.get("status").toString();
                }
                if (payload.get("isPremium") != null) {
                    isPremium = (Boolean) payload.get("isPremium");
                }
            } catch (Exception e) {
                log.error("Error parsing subscription updated event fields", e);
                return;
            }

            if (companyId == null) {
                log.error("Subscription updated event has null companyId, skipping notification");
                return;
            }

            if (status == null) {
                log.warn("Subscription updated event has null status for company: {}", companyId);
                return;
            }

            log.info("Processing subscription update for company: {}, new status: {}, isPremium: {}",
                    companyId, status, isPremium);

            // Check if subscription was cancelled
            if ("CANCELLED".equals(status)) {
                log.info("Detected subscription cancellation for company: {}", companyId);
                createCancellationNotification(companyId, payload);
            } else if ("ACTIVE".equals(status) && Boolean.TRUE.equals(isPremium)) {
                log.info("Detected subscription renewal for company: {}", companyId);
                createRenewalNotification(companyId, payload);
            } else if ("EXPIRED".equals(status)) {
                log.info("Subscription expired for company: {}", companyId);
            }

        } catch (Exception e) {
            log.error("Error processing subscription updated event from partition: {}, offset: {}",
                    partition, offset, e);
        }
    }

    private void createCancellationNotification(java.util.UUID companyId, java.util.Map<String, Object> payload) {
        try {
            String cancellationMessage = buildCancellationMessage(companyId);

            String metadata = String.format("{\"companyId\":\"%s\",\"status\":\"CANCELLED\",\"cancelledAt\":\"%s\"}",
                    companyId, java.time.LocalDateTime.now());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SUBSCRIPTION)
                    .title("⚠️ Subscription Cancelled")
                    .message(cancellationMessage)
                    .referenceId(companyId.toString())
                    .referenceType("SUBSCRIPTION_CANCELLED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);

            log.info("Successfully created cancellation notification for company: {}", companyId);

        } catch (Exception e) {
            log.error("Error creating cancellation notification for company: {}", companyId, e);
        }
    }

    private void createRenewalNotification(java.util.UUID companyId, java.util.Map<String, Object> payload) {
        try {
            String renewalMessage = buildRenewalMessage(companyId, payload);

            String metadata = String.format("{\"companyId\":\"%s\",\"status\":\"ACTIVE\",\"renewedAt\":\"%s\"}",
                    companyId, java.time.LocalDateTime.now());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SUBSCRIPTION)
                    .title("✅ Subscription Renewed Successfully")
                    .message(renewalMessage)
                    .referenceId(companyId.toString())
                    .referenceType("SUBSCRIPTION_RENEWED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);

            log.info("Successfully created renewal notification for company: {}", companyId);

        } catch (Exception e) {
            log.error("Error creating renewal notification for company: {}", companyId, e);
        }
    }

    private String buildRenewalMessage(java.util.UUID companyId, java.util.Map<String, Object> payload) {
        StringBuilder message = new StringBuilder();
        message.append("Great news! Your premium subscription has been renewed successfully.\n\n");

        Object endAtObj = payload.get("endAt");
        if (endAtObj != null) {
            java.time.LocalDateTime endAt = parseLocalDateTime(endAtObj);
            if (endAt != null) {
                message.append("Your subscription is now active until: ");
                message.append(endAt.format(DATE_FORMATTER));
                message.append("\n\n");
            }
        }

        message.append("You can continue enjoying all premium features:\n");
        message.append("✓ Real-time applicant matching\n");
        message.append("✓ Advanced search filters\n");
        message.append("✓ Priority support\n\n");
        message.append("Thank you for your continued support!");

        return message.toString();
    }

    private String buildCancellationMessage(java.util.UUID companyId) {
        StringBuilder message = new StringBuilder();
        message.append("Your premium subscription has been cancelled. ");
        message.append("\n\n");
        message.append("Premium features will remain active until the end of your current billing period. ");
        message.append("After that, your account will revert to the free plan.\n\n");
        message.append("What happens next:\n");
        message.append("• Job postings will be limited to free tier\n");
        message.append("• Advanced search features will be disabled\n");
        message.append("• Priority support will no longer be available\n");
        message.append("\n");
        message.append("You can reactivate your subscription at any time to regain access to premium features.\n\n");
        message.append("If you cancelled by mistake or have questions, please contact our support team.");

        return message.toString();
    }

    /**
     * Handles SubscriptionExpiringSoonEvent to send a renewal reminder notification.
     *
     * @param event the subscription expiring soon event
     * @param partition the Kafka partition
     * @param offset the message offset
     */
    @KafkaListener(
            topics = "subscription.expiring-soon",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleSubscriptionExpiringSoon(
            @Payload SubscriptionExpiringSoonEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            log.info("Received SubscriptionExpiringSoonEvent for company: {} (days remaining: {}) from partition: {}, offset: {}",
                    event.getCompanyId(), event.getDaysRemaining(), partition, offset);

            if (event.getCompanyId() == null) {
                log.error("SubscriptionExpiringSoonEvent has null companyId, skipping notification creation");
                return;
            }

            String reminderMessage = buildSubscriptionExpiringSoonMessage(event);

            String metadata = buildExpiringMetadata(
                    event.getSubscriptionId(),
                    event.getPlanType(),
                    event.getDaysRemaining(),
                    event.getUrgencyLevel(),
                    event.getReminderCount()
            );

            // Determine notification type based on urgency
            NotificationType notificationType = "CRITICAL".equals(event.getUrgencyLevel()) ||
                    "URGENT".equals(event.getUrgencyLevel())
                    ? NotificationType.ALERT
                    : NotificationType.SUBSCRIPTION;

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(notificationType)
                    .title(buildExpiringTitle(event.getDaysRemaining(), event.getUrgencyLevel()))
                    .message(reminderMessage)
                    .referenceId(event.getSubscriptionId() != null ? event.getSubscriptionId().toString() : null)
                    .referenceType("SUBSCRIPTION_EXPIRING_SOON")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);

            log.info("Successfully created expiring reminder notification for subscription: {} (company: {}, reminder #{})",
                    event.getSubscriptionId(), event.getCompanyId(), event.getReminderCount());

        } catch (Exception e) {
            log.error("Error processing SubscriptionExpiringSoonEvent for company: {}, subscription: {}",
                    event.getCompanyId(), event.getSubscriptionId(), e);
        }
    }

    // ========== Message Building Helper Methods ==========

    /**
     * Builds a welcome message for subscription creation.
     */
    private String buildSubscriptionCreatedMessage(SubscriptionCreatedEvent event) {
        StringBuilder message = new StringBuilder();
        message.append("Congratulations! Your premium subscription has been activated successfully. ");

        if (event.getPlanType() != null) {
            message.append("You are now on the ").append(event.getPlanType()).append(" plan. ");
        }

        message.append("\n\nPremium Features Unlocked:\n");
        message.append("• Unlimited job postings\n");
        message.append("• Advanced applicant search and filtering\n");
        message.append("• Priority customer support\n");
        message.append("• Detailed analytics and insights\n");
        message.append("• Featured company profile\n");

        if (event.getEndAt() != null) {
            message.append("\n\nYour subscription is active until ")
                    .append(event.getEndAt().format(DATE_FORMATTER))
                    .append(".");
        } else {
            message.append("\n\nYou have lifetime access to all premium features!");
        }

        message.append("\n\nThank you for choosing our premium service. We're excited to help you find the perfect candidates!");

        return message.toString();
    }

    /**
     * Builds a renewal confirmation message.
     */
    private String buildSubscriptionRenewedMessage(SubscriptionRenewedEvent event) {
        StringBuilder message = new StringBuilder();

        if (Boolean.TRUE.equals(event.getIsAutoRenewal())) {
            message.append("Your premium subscription has been automatically renewed. ");
        } else {
            message.append("Your premium subscription has been successfully renewed. ");
        }

        message.append("Thank you for continuing with us!\n\n");

        if (event.getNewEndAt() != null) {
            message.append("Your subscription is now active until ")
                    .append(event.getNewEndAt().format(DATE_FORMATTER))
                    .append(".\n\n");
        }

        if (event.getRenewalAmount() != null && event.getCurrency() != null) {
            message.append(String.format("Amount charged: %.2f %s\n", event.getRenewalAmount(), event.getCurrency()));
        }

        if (event.getPaymentReferenceId() != null) {
            message.append("Payment reference: ").append(event.getPaymentReferenceId()).append("\n");
        }

        message.append("\nYou continue to have access to all premium features. Happy recruiting!");

        return message.toString();
    }

    /**
     * Builds an expiration alert message.
     */
    private String buildSubscriptionExpiredMessage(SubscriptionExpiredEvent event) {
        StringBuilder message = new StringBuilder();
        message.append("Your premium subscription has expired. ");

        // Provide context based on expiration reason
        if (event.isPaymentFailure()) {
            message.append("We were unable to process your payment for renewal. ");
            message.append("Please update your payment information to reactivate your premium subscription.\n\n");
        } else if (event.wasCancelled()) {
            message.append("Your subscription was previously cancelled and has now ended.\n\n");
        } else {
            message.append("Your subscription period has ended.\n\n");
        }

        message.append("What this means:\n");
        message.append("• Your job postings may be limited or unpublished\n");
        message.append("• Access to advanced features is restricted\n");
        message.append("• Premium support is no longer available\n\n");

        message.append("Don't let great candidates slip away! Renew your subscription now to:");
        message.append("\n• Regain access to all premium features");
        message.append("\n• Continue receiving quality applications");
        message.append("\n• Maintain your competitive edge in hiring");

        message.append("\n\nClick here to renew and get back to finding top talent!");

        return message.toString();
    }

    /**
     * Builds a cancellation confirmation message.
     */
    private String buildSubscriptionCancelledMessage(SubscriptionCancelledEvent event) {
        StringBuilder message = new StringBuilder();

        message.append("We've received your subscription cancellation request");

        if (event.wasCancelledByAdmin()) {
            message.append(" (processed by admin)");
        } else if (event.wasCancelledBySystem()) {
            message.append(" (automated cancellation)");
        }

        message.append(".\n\n");

        message.append(event.getCancellationMessage());

        message.append("\n\nYou can reactivate your premium subscription at any time.");
        message.append("\n\nWe're sorry to see you go. If you have any feedback about your experience, please let us know so we can improve our service.");

        if (Boolean.TRUE.equals(event.getWillProcessRefund()) && event.getRefundAmount() != null) {
            message.append(String.format("\n\nA refund of %.2f %s will be processed within 5-7 business days.",
                    event.getRefundAmount(), event.getCurrency()));
        }

        return message.toString();
    }

    /**
     * Builds an expiring soon reminder message.
     */
    private String buildSubscriptionExpiringSoonMessage(SubscriptionExpiringSoonEvent event) {
        StringBuilder message = new StringBuilder();

        message.append(event.getUrgencyMessage());
        message.append("\n\n");

        if (event.getExpiresAt() != null) {
            message.append("Expiration date: ").append(event.getExpiresAt().format(DATETIME_FORMATTER)).append("\n\n");
        }

        if (Boolean.FALSE.equals(event.getHasAutoRenewal())) {
            message.append("⚠️ Auto-renewal is NOT enabled. You must renew manually to avoid service interruption.\n\n");
        } else {
            message.append("✅ Auto-renewal is enabled. Your subscription will renew automatically if your payment method is valid.\n\n");
        }

        message.append(event.getRenewalCallToAction());

        if (event.hasSpecialOffer()) {
            message.append("\n\n").append(event.getSpecialOfferMessage());
        }

        if (event.getRenewalPrice() != null && event.getCurrency() != null) {
            message.append(String.format("\n\nRenewal price: %.2f %s", event.getRenewalPrice(), event.getCurrency()));
        }

        return message.toString();
    }

    /**
     * Builds a title for expiring subscription notification.
     */
    private String buildExpiringTitle(Integer daysRemaining, String urgencyLevel) {
        if (daysRemaining == null) {
            return "Subscription Expiring Soon";
        }

        if (daysRemaining == 0) {
            return "⚠️ Subscription Expires TODAY!";
        } else if (daysRemaining == 1) {
            return "⚠️ Subscription Expires Tomorrow!";
        } else if ("URGENT".equals(urgencyLevel) || "CRITICAL".equals(urgencyLevel)) {
            return String.format("⚠️ Subscription Expires in %d Days", daysRemaining);
        } else {
            return String.format("Subscription Reminder: %d Days Remaining", daysRemaining);
        }
    }

    // ========== Metadata Building Helper Methods ==========

    private String buildSubscriptionMetadata(Object subscriptionId, String planType, String paymentRef) {
        return String.format("{\"subscriptionId\":\"%s\",\"planType\":\"%s\",\"paymentReference\":\"%s\"}",
                subscriptionId, planType, paymentRef);
    }

    private String buildRenewalMetadata(Object subscriptionId, String planType, String paymentRef,
                                        Double amount, String currency, Boolean isAutoRenewal) {
        return String.format("{\"subscriptionId\":\"%s\",\"planType\":\"%s\",\"paymentReference\":\"%s\"," +
                        "\"amount\":%.2f,\"currency\":\"%s\",\"isAutoRenewal\":%b}",
                subscriptionId, planType, paymentRef, amount != null ? amount : 0.0, currency, isAutoRenewal);
    }

    private String buildExpirationMetadata(Object subscriptionId, String planType, String reason, Boolean hadAutoRenewal) {
        return String.format("{\"subscriptionId\":\"%s\",\"planType\":\"%s\",\"expirationReason\":\"%s\"," +
                        "\"hadAutoRenewal\":%b}",
                subscriptionId, planType, reason, hadAutoRenewal);
    }

    private String buildCancellationMetadata(Object subscriptionId, String planType, String reason,
                                             Boolean isImmediate, String cancelledBy) {
        return String.format("{\"subscriptionId\":\"%s\",\"planType\":\"%s\",\"cancellationReason\":\"%s\"," +
                        "\"isImmediate\":%b,\"cancelledBy\":\"%s\"}",
                subscriptionId, planType, reason, isImmediate, cancelledBy);
    }

    private String buildExpiringMetadata(Object subscriptionId, String planType, Integer daysRemaining,
                                         String urgency, Integer reminderCount) {
        return String.format("{\"subscriptionId\":\"%s\",\"planType\":\"%s\",\"daysRemaining\":%d," +
                        "\"urgencyLevel\":\"%s\",\"reminderCount\":%d}",
                subscriptionId, planType, daysRemaining, urgency, reminderCount);
    }

    /**
     * Helper method to convert Map payload to SubscriptionCreatedEvent.
     * Handles LocalDateTime deserialization from array format.
     */
    private SubscriptionCreatedEvent mapToSubscriptionCreatedEvent(java.util.Map<String, Object> payload) {
        return SubscriptionCreatedEvent.builder()
                .subscriptionId(java.util.UUID.fromString(payload.get("subscriptionId").toString()))
                .companyId(java.util.UUID.fromString(payload.get("companyId").toString()))
                .planType((String) payload.get("planType"))
                .startAt(parseLocalDateTime(payload.get("startAt")))
                .endAt(parseLocalDateTime(payload.get("endAt")))
                .paymentReferenceId((String) payload.get("paymentReferenceId"))
                .eventTimestamp(parseLocalDateTime(payload.get("eventTimestamp")))
                .eventSource((String) payload.get("eventSource"))
                .build();
    }

    /**
     * Parse LocalDateTime from either array format or string format.
     */
    @SuppressWarnings("unchecked")
    private java.time.LocalDateTime parseLocalDateTime(Object dateTimeObj) {
        if (dateTimeObj == null) {
            return null;
        }
        if (dateTimeObj instanceof java.util.List) {
            java.util.List<Integer> dateTimeParts = (java.util.List<Integer>) dateTimeObj;

            if (dateTimeParts.size() < 3) {
                log.error("Invalid date array format. Expected at least [year, month, day], got: {}", dateTimeParts);
                return null;
            }

            int year = dateTimeParts.get(0);
            int month = dateTimeParts.get(1);
            int day = dateTimeParts.get(2);
            int hour = dateTimeParts.size() > 3 ? dateTimeParts.get(3) : 0;
            int minute = dateTimeParts.size() > 4 ? dateTimeParts.get(4) : 0;
            int second = dateTimeParts.size() > 5 ? dateTimeParts.get(5) : 0;
            int nano = dateTimeParts.size() > 6 ? dateTimeParts.get(6) : 0;

            return java.time.LocalDateTime.of(year, month, day, hour, minute, second, nano);
        } else if (dateTimeObj instanceof String) {
            return java.time.LocalDateTime.parse((String) dateTimeObj);
        }
        return null;
    }
}
