package com.devision.job_manager_auth.controller;


import com.devision.job_manager_auth.dto.external.TokenValidationResponse;
import com.devision.job_manager_auth.service.internal.JweTokenService;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class TokenValidationController {

    private static final String SESSION_INVALIDATION_PREFIX = "session-invalidated:";

    private final JweTokenService jweTokenService;
    private final RedisTemplate<String, String> redisTemplate;

    @PostMapping("/validate-token")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @RequestHeader("Authorization") String authHeader
    ) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid authorization header format");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(TokenValidationResponse.invalid());
            }

            String token = authHeader.substring(7);

            // Check if token is revoked
            if (jweTokenService.isTokenRevoked(token)) {
                log.warn("Token is revoked");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(TokenValidationResponse.invalid());
            }

            // validate and decrypt
            JWTClaimsSet claims = jweTokenService.validateAndDecryptToken(token);


            if (claims == null) {
                log.warn("Token validation failed - invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(TokenValidationResponse.invalid());
            }

            // Check token type
            String tokenType = jweTokenService.extractTokenType(claims);
            if (!"ACCESS".equals(tokenType)) {
                log.warn("Invalid token type: {}", tokenType);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(TokenValidationResponse.invalid());
            }

            // Extract info
            String userId = jweTokenService.extractUserId(claims).toString();
            String email = jweTokenService.extractEmail(claims);
            String role = jweTokenService.extractRole(claims);
            String countryCode = jweTokenService.extractCountryCode(claims);

            // Check if session has been invalidated (e.g., due to country change)
            if (isSessionInvalidated(userId)) {
                log.warn("Session invalidated for user: {} (likely due to country change)", email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(TokenValidationResponse.invalid());
            }

            // Build response
            TokenValidationResponse response = TokenValidationResponse.builder()
                    .valid(true)
                    .userId(userId)
                    .email(email)
                    .role(role)
                    .countryCode(countryCode)
                    .build();

            log.debug("Token validated successfully for user: {}", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(TokenValidationResponse.invalid());
        }
    }

    /**
     * Check if the user's session has been invalidated (e.g., due to country change).
     * Users with invalidated sessions must re-login to get a new JWT.
     */
    private boolean isSessionInvalidated(String userId) {
        String redisKey = SESSION_INVALIDATION_PREFIX + userId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(redisKey));
    }
}
