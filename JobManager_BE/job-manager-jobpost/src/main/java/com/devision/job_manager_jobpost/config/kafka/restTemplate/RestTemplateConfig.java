package com.devision.job_manager_jobpost.config.kafka.restTemplate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Value("https://03ca3e0ae418.ngrok-free.app")
    private String applicationServiceBaseUrl;

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(5))  // Connection timeout
                .readTimeout(Duration.ofSeconds(10))     // Read timeout
                .build();
    }

    @Bean
    public String applicationServiceBaseUrl() {
        return applicationServiceBaseUrl;
    }
}
