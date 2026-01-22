package com.devision.job_manager_applicant_search.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${subscription.service.url:http://localhost:8085}")
    private String subscriptionServiceUrl;

    @Value("${applicant.service.url:http://localhost:8080}")
    private String applicantServiceUrl;

    @Value("${applicant.service.auth.token:}")
    private String applicantServiceAuthToken;

    @Bean
    public WebClient subscriptionWebClient() {
        return WebClient.builder()
                .baseUrl(subscriptionServiceUrl)
                .build();
    }

    @Bean
    public WebClient applicantWebClient() {
        WebClient.Builder builder = WebClient.builder()
                .baseUrl(applicantServiceUrl);

        // Add Bearer token if configured
        if (applicantServiceAuthToken != null && !applicantServiceAuthToken.isEmpty()) {
            builder.defaultHeader("Authorization", "Bearer " + applicantServiceAuthToken);
        }

        return builder.build();
    }
}
