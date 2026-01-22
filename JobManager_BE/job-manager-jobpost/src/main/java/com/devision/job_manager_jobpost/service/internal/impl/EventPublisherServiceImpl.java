package com.devision.job_manager_jobpost.service.internal.impl;

import com.devision.job_manager_jobpost.config.kafka.KafkaTopicConfig;
import com.devision.job_manager_jobpost.event.*;
import com.devision.job_manager_jobpost.service.internal.EventPublisherService;
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
    public void publishJobPostCreated(JobPostCreatedEvent event) {
        log.info("Publishing JobPostCreatedEvent for job post ID: {}", event.getJobPostId());
        kafkaTemplate.send(KafkaTopicConfig.JOB_POST_CREATED_TOPIC,
                String.valueOf(event.getJobPostId()), event);
    }

    @Override
    public void publishJobPostUpdated(JobPostUpdatedEvent event) {
        log.info("Publishing JobPostUpdatedEvent for job post ID: {}", event.getJobPostId());
        kafkaTemplate.send(KafkaTopicConfig.JOB_POST_UPDATED_TOPIC,
                String.valueOf(event.getJobPostId()), event);
    }

    @Override
    public void publishJobPostPublished(JobPostPublishedEvent event) {
        try {
            log.info("Publishing JobPostPublishedEvent for job post ID: {} ({})",
                    event.getJobPostId(), event.getTitle());

            kafkaTemplate.send("jobpost.published", event.getJobPostId().toString(), event);

            log.info("Successfully published JobPostPublishedEvent for job post ID: {}",
                    event.getJobPostId());
        } catch (Exception e) {
            log.error("Failed to publish JobPostPublishedEvent for job post ID: {}. Error: {}",
                    event.getJobPostId(), e.getMessage(), e);
        }
    }

    @Override
    public void publishJobPostUnpublished(JobPostUnpublishedEvent event) {
        log.info("Publishing JobPostUnpublishedEvent for job post ID: {}", event.getJobPostId());
        kafkaTemplate.send(KafkaTopicConfig.JOB_POST_UNPUBLISHED_TOPIC,
                String.valueOf(event.getJobPostId()), event);
    }

    @Override
    public void publishJobPostDeleted(JobPostDeletedEvent event) {
        log.info("Publishing JobPostDeletedEvent for job post ID: {}", event.getJobPostId());
        kafkaTemplate.send(KafkaTopicConfig.JOB_POST_DELETED_TOPIC,
                String.valueOf(event.getJobPostId()), event);
    }

    @Override
    public void publishJobPostExpired(JobPostExpiredEvent event) {
        log.info("Publishing JobPostExpiredEvent for job post ID: {}", event.getJobPostId());
        kafkaTemplate.send(KafkaTopicConfig.JOB_POST_EXPIRED_TOPIC,
                String.valueOf(event.getJobPostId()), event);
    }

    @Override
    public void publishJobPostSkillsChanged(JobPostSkillsChangedEvent event) {
        log.info("Publishing JobPostSkillsChangedEvent for job post ID: {}. Added: {}, Removed: {}",
                event.getJobPostId(),
                event.getAddedSkills() != null ? event.getAddedSkills().size() : 0,
                event.getRemovedSkills() != null ? event.getRemovedSkills().size() : 0);
        kafkaTemplate.send(KafkaTopicConfig.JOB_POST_SKILLS_CHANGED_TOPIC,
                String.valueOf(event.getJobPostId()), event);
    }

    @Override
    public void publishJobPostCountryChanged(JobPostCountryChangedEvent event) {
        log.info("Publishing JobPostCountryChangedEvent for job post ID: {}. From: {} To: {}",
                event.getJobPostId(),
                event.getPreviousCountryCode(),
                event.getNewCountryCode());
        kafkaTemplate.send(KafkaTopicConfig.JOB_POST_COUNTRY_CHANGED_TOPIC,
                String.valueOf(event.getJobPostId()), event);
    }
}
