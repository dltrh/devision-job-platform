package com.devision.job_manager_payment.service.external.impl;

import com.devision.job_manager_payment.dto.external.PaymentCancelledEvent;
import com.devision.job_manager_payment.dto.external.PaymentCompletedEvent;
import com.devision.job_manager_payment.dto.external.PaymentFailedEvent;
import com.devision.job_manager_payment.service.external.PaymentEventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducerImpl implements PaymentEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.payment-completed:payment.completed}")
    private String paymentCompletedTopic;

    @Value("${kafka.topic.payment-failed:payment.failed}")
    private String paymentFailedTopic;

    @Value("${kafka.topic.payment-cancelled:payment.cancelled}")
    private String paymentCancelledTopic;

    @Override
    public void publishPaymentCompleted(PaymentCompletedEvent event) {
//        try {
//            log.info("Publishing payment completed event for payment: {} to topic: {}",
//                    event.getPaymentId(), paymentCompletedTopic);
//
//            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(paymentCompletedTopic, event.getPaymentId().toString(), event);
//
//            future.whenComplete((result, ex) -> {
//                if (ex == null) {
//                    log.info("Successfully published payment completed event for payment: {} to partition: {}",
//                            event.getPaymentId(), result.getRecordMetadata().partition());
//                } else {
//                    log.error("Failed to publish payment completed event for payment: {}",
//                            event.getPaymentId(), ex);
//                }
//            });
//        } catch (Exception e) {
//            log.error("Error publishing payment completed event for payment: {}",
//                    event.getPaymentId(), e);
//        }

        publishEvent(paymentCompletedTopic, event.getPaymentId().toString(), event, "completed");
    }

    @Override
    public void publishPaymentFailed(PaymentFailedEvent event) {
        publishEvent(paymentFailedTopic, event.getPaymentId().toString(), event, "failed");
    }

    @Override
    public void publishPaymentCancelled(PaymentCancelledEvent event) {
        publishEvent(paymentCancelledTopic, event.getPaymentId().toString(), event, "cancelled");
    }

    private void publishEvent(String topic, String key, Object event, String eventType) {
        try {
            log.info("Publishing payment {} event to topic: {}", eventType, topic);

            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, event);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Successfully published payment {} event to partition: {}", eventType, result.getRecordMetadata().partition());
                } else {
                    log.error("Failed to publish payment {} event for payment to partition: {}",
                            eventType, result.getRecordMetadata().partition());
                }
            });
        } catch (Exception e) {
            log.error("Error publishing payment {} event", eventType, e);
        }
    }
}
