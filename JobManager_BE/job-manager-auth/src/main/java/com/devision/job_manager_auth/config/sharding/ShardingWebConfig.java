package com.devision.job_manager_auth.config.sharding;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Register the sharding interceptor
 */

@Configuration
@RequiredArgsConstructor
public class ShardingWebConfig implements WebMvcConfigurer {
    private final ShardInterceptor shardInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(shardInterceptor)
                .addPathPatterns("/api/**")  // Apply to all API endpoints
                .excludePathPatterns(
                        "/api/auth/register",    // Registration sets shard explicitly
                        "/api/auth/login",       // Login needs scatter-gather
                        "/api/auth/oauth2/**",   // OAuth handles shard separately
                        "/actuator/**"
                );
    }
}
