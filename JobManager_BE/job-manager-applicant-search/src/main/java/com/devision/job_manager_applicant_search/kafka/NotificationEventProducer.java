package com.devision.job_manager_applicant_search.kafka;

import com.devision.job_manager_applicant_search.event.CompanyNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka producer for publishing notification events when applicants match search profiles.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventProducer {

    private static final String TOPIC_COMPANY_NOTIFICATION = "company.notification";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publishes a company notification event.
     * The company ID is used as the key for partition ordering.
     */
    public void publishNotification(CompanyNotificationEvent event) {
        log.info("Publishing notification event for company: {} - type: {}", 
                event.getCompanyId(), event.getType());
        kafkaTemplate.send(TOPIC_COMPANY_NOTIFICATION, event.getCompanyId().toString(), event);
    }
}
