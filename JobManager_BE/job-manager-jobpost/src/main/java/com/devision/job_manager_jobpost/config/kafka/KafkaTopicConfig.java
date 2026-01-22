package com.devision.job_manager_jobpost.config.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    // JobPost Events
    public static final String JOB_POST_CREATED_TOPIC = "jobpost.created";
    public static final String JOB_POST_UPDATED_TOPIC = "jobpost.updated";
    public static final String JOB_POST_PUBLISHED_TOPIC = "jobpost.published";
    public static final String JOB_POST_UNPUBLISHED_TOPIC = "jobpost.unpublished";
    public static final String JOB_POST_DELETED_TOPIC = "jobpost.deleted";
    public static final String JOB_POST_EXPIRED_TOPIC = "jobpost.expired";

    // CRITICAL for Ultimo 4.3.1: Matching criteria changes for instant applicant notifications
    public static final String JOB_POST_SKILLS_CHANGED_TOPIC = "jobpost.skills.changed";
    public static final String JOB_POST_COUNTRY_CHANGED_TOPIC = "jobpost.country.changed";

    @Bean
    public NewTopic jobPostCreatedTopic() {
        return TopicBuilder.name(JOB_POST_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic jobPostUpdatedTopic() {
        return TopicBuilder.name(JOB_POST_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic jobPostPublishedTopic() {
        return TopicBuilder.name(JOB_POST_PUBLISHED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic jobPostUnpublishedTopic() {
        return TopicBuilder.name(JOB_POST_UNPUBLISHED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic jobPostDeletedTopic() {
        return TopicBuilder.name(JOB_POST_DELETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic jobPostExpiredTopic() {
        return TopicBuilder.name(JOB_POST_EXPIRED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic jobPostSkillsChangedTopic() {
        return TopicBuilder.name(JOB_POST_SKILLS_CHANGED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic jobPostCountryChangedTopic() {
        return TopicBuilder.name(JOB_POST_COUNTRY_CHANGED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
