package com.devision.job_manager_gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "gateway.auth")
public class GatewayAuthPropertiesConfig {

    /**
     * Enable/disable authentication at the gateway level
     */
    private boolean enabled = true;

    /**
     * List of paths that don't require authentication
     */
    private List<String> publicPaths = new ArrayList<>();

    /**
     * Auth service configuration
     */
    private AuthService authService = new AuthService();

    @Data
    public static class AuthService {
        /**
         * Base URL of the Auth Service
         */
        private String url = "http://localhost:8081";

        /**
         * Token validation endpoint path
         */
        private String validateEndpoint = "/api/auth/validate-token";

        /**
         * Request timeout in milliseconds
         */
        private int timeoutMs = 3000;
    }

    /**
     * Check if a given path is public
     */
    public boolean isPublicPath(String path) {
        return publicPaths.stream()
                .anyMatch(pattern -> pathMatches(path, pattern));
    }

    /**
     * Simple wildcard path matching
     * Supports: /exact/path and /path/**
     */
    private boolean pathMatches(String actualPath, String pattern) {
        if (pattern.endsWith("/**")) {
            // Wildcard pattern: /api/auth/**
            String basePattern = pattern.substring(0, pattern.length() - 3);
            return actualPath.startsWith(basePattern);
        }
        // Exact match
        return actualPath.equals(pattern);
    }
}
