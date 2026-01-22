package com.devision.job_manager_company.consumer;

import com.devision.job_manager_company.event.CompanyRegisteredEvent;
import com.devision.job_manager_company.service.CompanyService;
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
public class CompanyEventConsumer {

    private final CompanyService companyService;

    @KafkaListener(
            topics = "company.registered",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleCompanyRegistered(
            @Payload(required = false) CompanyRegisteredEvent event,
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
        
        log.info("Received CompanyRegisteredEvent for company ID: {} from topic: {}, offset: {}", 
                event.getCompanyId(), topic, offset);
        try {
            companyService.createCompanyFromEvent(event);
            log.info("Successfully processed CompanyRegisteredEvent for company ID: {}", event.getCompanyId());
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
        } catch (Exception e) {
            log.error("Failed to process CompanyRegisteredEvent for company ID: {}. Error: {}", 
                    event.getCompanyId(), e.getMessage(), e);
            if (acknowledgment != null) {
                acknowledgment.acknowledge(); // Acknowledge to skip the bad message
            }
        }
    }
}
