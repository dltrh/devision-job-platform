package com.devision.job_manager_auth.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String COMPANY_REGISTERED_TOPIC = "company.registered";
    public static final String COMPANY_ACTIVATED_TOPIC = "company.activated";
    public static final String COMPANY_ACCOUNT_LOCKED_TOPIC = "company.account.locked";

    @Bean
    public NewTopic companyRegisteredTopic() {
        return TopicBuilder.name(COMPANY_REGISTERED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic companyActivatedTopic() {
        return TopicBuilder.name(COMPANY_ACTIVATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic companyAccountLockedTopic() {
        return TopicBuilder.name(COMPANY_ACCOUNT_LOCKED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    public static final String COMPANY_COUNTRY_CHANGED_TOPIC = "company.country.changed";

    @Bean
    public NewTopic companyCountryChangedTopic() {
        return TopicBuilder.name(COMPANY_COUNTRY_CHANGED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
