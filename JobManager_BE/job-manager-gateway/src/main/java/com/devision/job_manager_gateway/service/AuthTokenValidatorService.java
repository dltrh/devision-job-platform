package com.devision.job_manager_gateway.service;

import com.devision.job_manager_gateway.config.GatewayAuthPropertiesConfig;
import com.devision.job_manager_gateway.dto.TokenValidationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthTokenValidatorService {

    private final WebClient.Builder webClientBuilder;
    private final GatewayAuthPropertiesConfig authProperties;

    /**
     * Validate JWT token by calling the Auth Service
     *
     * @param token The JWT token to validate
     * @return Mono<TokenValidationResponse> containing validation result
     */
    public Mono<TokenValidationResponse> validateToken(String token) {
        String authServiceUrl = authProperties.getAuthService().getUrl();
        String validateEndpoint = authProperties.getAuthService().getValidateEndpoint();
        int timeoutMs = authProperties.getAuthService().getTimeoutMs();

        log.debug("Validating token with Auth Service at: {}{}", authServiceUrl, validateEndpoint);

        return webClientBuilder.build()
                .post()
                .uri(authServiceUrl + validateEndpoint)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .onStatus(
                        status -> status.equals(HttpStatus.UNAUTHORIZED),
                        response -> {
                            log.warn("Token validation failed: Unauthorized");
                            return Mono.just(new RuntimeException("Invalid token"));
                        }
                )
                .bodyToMono(TokenValidationResponse.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .doOnSuccess(response -> {
                    if (response.isValid()) {
                        log.debug("Token validated successfully for user: {}", response.getEmail());
                    } else {
                        log.warn("Token validation failed");
                    }
                })
                .onErrorResume(error -> {
                    log.error("Error calling Auth Service: {}", error.getMessage());
                    return Mono.just(TokenValidationResponse.invalid());
                });
    }
}
