package com.devision.job_manager_subscription.kafka;


import com.devision.job_manager_subscription.dto.internal.event.PaymentCompletedEvent;
import com.devision.job_manager_subscription.dto.internal.request.CreateSubscriptionRequest;
import com.devision.job_manager_subscription.dto.internal.request.UpdateSubscriptionRequest;
import com.devision.job_manager_subscription.model.PayerType;
import com.devision.job_manager_subscription.model.SubscriptionStatus;
import com.devision.job_manager_subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final SubscriptionService subscriptionService;

    @KafkaListener(
            topics = "payment.completed",
            groupId = "subscription-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePaymentCompleted(PaymentCompletedEvent event, Acknowledgment acknowledgment) {
        log.info("Received payment completed event for payer: {} ({})",
                event.getPayerId(), event.getPayerType());

        try {
            // Only process COMPANY payments
            if (event.getPayerType() != PayerType.COMPANY) {
                log.info("Ignoring payment event - not a company payment (type: {})", event.getPayerType());
                acknowledgment.acknowledge();
                return;
            }

            // Check if subscription already exists for this company
            var existingSubscription = subscriptionService.getByCompanyId(event.getPayerId());

            if (existingSubscription != null) {
                // Subscription exists - RENEW it
                log.info("Found existing subscription (ID: {}) for company: {}. Renewing...",
                        existingSubscription.getId(), event.getPayerId());

                // Extend subscription by 30 days from now
                LocalDateTime newEndDate = LocalDateTime.now().plusDays(30);

                UpdateSubscriptionRequest updateRequest = UpdateSubscriptionRequest.builder()
                        .status(SubscriptionStatus.ACTIVE)
                        .endAt(newEndDate)
                        .build();

                subscriptionService.update(existingSubscription.getId(), updateRequest);

                log.info("Subscription renewed for company: {}. New expiry: {}",
                        event.getPayerId(), newEndDate);

            } else {
                // No subscription exists - CREATE new one
                log.info("No existing subscription found for company: {}. Creating new subscription...",
                        event.getPayerId());

                CreateSubscriptionRequest createRequest = CreateSubscriptionRequest.builder()
                        .companyId(event.getPayerId())
                        .status(SubscriptionStatus.ACTIVE)
                        .startAt(LocalDateTime.now())
                        .endAt(LocalDateTime.now().plusDays(30))
                        .build();

                subscriptionService.create(createRequest);

                log.info("New subscription created for company: {}. Expires: {}",
                        event.getPayerId(), LocalDateTime.now().plusDays(30));
            }

            log.info("Successfully processed payment completed event for company: {}", event.getPayerId());

            // Acknowledge message after successful processing
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("Error processing payment completed event for payer: {}. Error: {}",
                    event.getPayerId(), e.getMessage(), e);
        }
    }

    @KafkaListener(
            topics = "payment.failed",
            groupId = "subscription-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePaymentFailed(Object event, Acknowledgment acknowledgment) {
        log.warn("Payment failed event received: {}", event);

        acknowledgment.acknowledge();
    }

    @KafkaListener(
            topics = "payment.cancelled",
            groupId = "subscription-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePaymentCancelled(Object event, Acknowledgment acknowledgment) {
        log.info("Payment cancelled event received: {}", event);

        acknowledgment.acknowledge();
    }
}
