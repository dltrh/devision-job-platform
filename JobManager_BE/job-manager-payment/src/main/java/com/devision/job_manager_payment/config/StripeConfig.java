package com.devision.job_manager_payment.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class StripeConfig {
    @Value("${stripe.api-key}")
    private String apiKey;

    // Runs after dependency injection, initializing Stripe SDK with api key
    @PostConstruct
    public void init() {
        Stripe.apiKey = apiKey;
        log.info("Stripe API key set successfully");
    }
}
