package com.devision.job_manager_auth.consumer;

import com.devision.job_manager_auth.event.CompanyCountryChangedEvent;
import com.devision.job_manager_auth.service.internal.ShardMigrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CountryChangeEventConsumer {

    private final ShardMigrationService shardMigrationService;

    @KafkaListener(
            topics = "company.country.changed",
            groupId = "${spring.kafka.consumer.group-id:job-manager-auth}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleCompanyCountryChanged(
            @Payload(required = false) CompanyCountryChangedEvent event,
            @Header(value = KafkaHeaders.RECEIVED_TOPIC, required = false) String topic,
            @Header(value = KafkaHeaders.OFFSET, required = false) Long offset,
            Acknowledgment acknowledgment) {
        
        if (event == null) {
            log.error("Received null event from topic: {}, offset: {}. Skipping message.", topic, offset);
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
            return;
        }
        
        log.info("Received CompanyCountryChangedEvent for company ID: {} (country: {} -> {}) from topic: {}, offset: {}", 
                event.getCompanyId(), event.getPreviousCountryCode(), event.getNewCountryCode(), topic, offset);
        
        try {
            shardMigrationService.migrateCompanyAccount(
                    event.getCompanyId(),
                    event.getPreviousCountryCode(),
                    event.getNewCountryCode()
            );
            log.info("Successfully processed CompanyCountryChangedEvent for company ID: {}", event.getCompanyId());
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
        } catch (Exception e) {
            log.error("Failed to process CompanyCountryChangedEvent for company ID: {}. Error: {}", 
                    event.getCompanyId(), e.getMessage(), e);
            // Acknowledge to skip the bad message
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
        }
    }
}
