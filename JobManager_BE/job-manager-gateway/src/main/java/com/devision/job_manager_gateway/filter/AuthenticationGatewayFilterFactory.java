package com.devision.job_manager_gateway.filter;

import com.devision.job_manager_gateway.config.GatewayAuthPropertiesConfig;
import com.devision.job_manager_gateway.dto.TokenValidationResponse;
import com.devision.job_manager_gateway.service.AuthTokenValidatorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class AuthenticationGatewayFilterFactory
        extends AbstractGatewayFilterFactory<AuthenticationGatewayFilterFactory.Config> {

    private final AuthTokenValidatorService tokenValidator;
    private final GatewayAuthPropertiesConfig authProperties;

    public AuthenticationGatewayFilterFactory(
            AuthTokenValidatorService tokenValidator,
            GatewayAuthPropertiesConfig authProperties
    ) {
        super(Config.class);
        this.tokenValidator = tokenValidator;
        this.authProperties = authProperties;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            log.debug("Authentication filter processing request: {}", path);

            // Check if authentication is enabled
            if (!authProperties.isEnabled()) {
                log.debug("Authentication is disabled, skipping validation");
                return chain.filter(exchange);
            }

            // Check if path is public (doesn't require authentication)
            if (authProperties.isPublicPath(path)) {
                log.debug("Path is public, skipping authentication: {}", path);
                return chain.filter(exchange);
            }

            // Extract JWT token from Authorization header
            String token = extractToken(request);
            if (token == null) {
                log.warn("No token found in Authorization header for path: {}", path);
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            // Validate token with Auth Service
            return tokenValidator.validateToken(token)
                    .flatMap(validationResponse -> {
                        if (!validationResponse.isValid()) {
                            log.warn("Token validation failed for path: {}", path);
                            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                            return exchange.getResponse().setComplete();
                        }

                        log.debug("Token validated successfully for user: {}", validationResponse.getEmail());

                        // Add user info to request headers for downstream services
                        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                .header("X-User-Id", validationResponse.getUserId())
                                .header("X-User-Email", validationResponse.getEmail())
                                .header("X-User-Role", validationResponse.getRole())
                                .header("X-User-Country", validationResponse.getCountryCode())
                                .build();

                        // Continue the filter chain with mutated request
                        return chain.filter(exchange.mutate().request(mutatedRequest).build());
                    });
        };
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String extractToken(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Configuration class for the filter (empty for now, but required by framework)
     */
    public static class Config {
        // Configuration properties can be added here if needed
    }
}
