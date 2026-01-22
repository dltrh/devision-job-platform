package com.devision.job_manager_auth.service.internal.impl;

import com.devision.job_manager_auth.config.KafkaTopicConfig;
import com.devision.job_manager_auth.event.CompanyAccountLockedEvent;
import com.devision.job_manager_auth.event.CompanyActivatedEvent;
import com.devision.job_manager_auth.event.CompanyRegisteredEvent;
import com.devision.job_manager_auth.service.internal.EventPublisherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisherServiceImpl implements EventPublisherService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publishCompanyRegistered(CompanyRegisteredEvent event) {
        log.info("Publishing CompanyRegisteredEvent for company ID: {}", event.getCompanyId());
        kafkaTemplate.send(KafkaTopicConfig.COMPANY_REGISTERED_TOPIC, 
                String.valueOf(event.getCompanyId()), event);
    }

    @Override
    public void publishCompanyActivated(CompanyActivatedEvent event) {
        log.info("Publishing CompanyActivatedEvent for company ID: {}", event.getCompanyId());
        kafkaTemplate.send(KafkaTopicConfig.COMPANY_ACTIVATED_TOPIC, 
                String.valueOf(event.getCompanyId()), event);
    }

    @Override
    public void publishCompanyAccountLocked(CompanyAccountLockedEvent event) {
        log.info("Publishing CompanyAccountLockedEvent for company ID: {}", event.getCompanyId());
        kafkaTemplate.send(KafkaTopicConfig.COMPANY_ACCOUNT_LOCKED_TOPIC, 
                String.valueOf(event.getCompanyId()), event);
    }
}
