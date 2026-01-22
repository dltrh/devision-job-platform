package com.devision.job_manager_notification.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration for the notification service.
 * Note: CORS is handled by the API Gateway, so we don't configure it here
 * to avoid duplicate Access-Control-Allow-Origin headers.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration removed - handled by API Gateway
}
