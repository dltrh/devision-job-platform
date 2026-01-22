package com.devision.job_manager_auth.service.internal.impl;

import com.devision.job_manager_auth.config.jwe.JweProperties;
import com.devision.job_manager_auth.entity.CompanyAccount;
import com.devision.job_manager_auth.service.internal.JweTokenService;
import com.nimbusds.jose.EncryptionMethod;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWEAlgorithm;
import com.nimbusds.jose.JWEHeader;
import com.nimbusds.jose.crypto.RSADecrypter;
import com.nimbusds.jose.crypto.RSAEncrypter;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class JweTokenServiceImpl implements JweTokenService {
    private final JweProperties jweProperties;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String REVOKED_TOKEN_PREFIX = "revoked-token:";

    public JweTokenServiceImpl(
            JweProperties jweProperties,
            RedisTemplate<String, String> redisTemplate,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration
    ) {
        this.jweProperties = jweProperties;
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public String generateAccessToken(CompanyAccount account) {
        return generateToken(account, accessTokenExpiration, "ACCESS");
    }

    @Override
    public String generateRefreshToken(CompanyAccount account) {
        return generateToken(account, refreshTokenExpiration, "REFRESH");
    }

    @Override
    public JWTClaimsSet validateAndDecryptToken(String token) {
        try {
            EncryptedJWT encryptedJWT = EncryptedJWT.parse(token);

            // Decrypt
            RSADecrypter decrypter = new RSADecrypter(jweProperties.getPrivateKey());
            encryptedJWT.decrypt(decrypter);

            // Get the claims
            JWTClaimsSet claims = encryptedJWT.getJWTClaimsSet();

            // Check expiration
            if (claims.getExpirationTime().before(new Date())) {
                log.info("Token expired.");
                return null;
            }

            return claims;
        } catch (ParseException | JOSEException e) {
            // Token is invalid, tampered with, or cannot be decrypted
            log.warn("Error while decrypting token: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public UUID extractUserId(JWTClaimsSet claims) {
        try {
            return UUID.fromString(claims.getStringClaim(CLAIM_USER_ID));
        } catch (ParseException e) {
            throw new RuntimeException("Failed to extract user ID from claims", e);
        }
    }

    @Override
    public String extractEmail(JWTClaimsSet claims) {
        try {
            return claims.getStringClaim(CLAIM_EMAIL);
        } catch (ParseException e) {
            throw new RuntimeException("Failed to extract email from claims", e);
        }
    }

    @Override
    public String extractRole(JWTClaimsSet claims) {
        try {
            return claims.getStringClaim(CLAIM_ROLE);
        } catch (ParseException e) {
            throw new RuntimeException("Failed to extract role of the user from claims", e);
        }
    }

    @Override
    public String extractCountryCode(JWTClaimsSet claims) {
        try {
            return claims.getStringClaim(CLAIM_COUNTRY_CODE);
        } catch (ParseException e) {
            throw new RuntimeException("Failed to extract country code from claims", e);
        }
    }

    @Override
    public String extractTokenType(JWTClaimsSet claims) {
        try {
            return claims.getStringClaim(CLAIM_TOKEN_TYPE);
        } catch (ParseException e) {
            throw new RuntimeException("Failed to extract type of the token from claims", e);
        }
    }

    @Override
    public String extractTokenId(JWTClaimsSet claims) {

        return claims.getJWTID();
    }

    @Override
    public JWTClaimsSet isValidAccessToken(String token) {
        JWTClaimsSet claims = validateAndDecryptToken(token);
        if (claims == null) return null;

        if (!"ACCESS".equals(extractTokenType(claims))) {
            return null;
        }

        if (isTokenRevoked(token)) {
            log.warn("ACCESS Token has been revoked, user ID: {}", extractUserId(claims));
            return null;
        }

        log.info("Access token is valid for user ID: {}", extractUserId(claims));
        return claims;
    }

    @Override
    public JWTClaimsSet isValidRefreshToken(String token) {
        JWTClaimsSet claims = validateAndDecryptToken(token);
        if (claims == null) return null;

        if (!"REFRESH".equals(extractTokenType(claims))) {
            return null;
        }

        if (isTokenRevoked(token)) {
            log.warn("REFRESH Token has been revoked, user ID: {}", extractUserId(claims));
            return null;
        }

        log.info("Refresh token is valid for user ID: {}", extractUserId(claims));
        return claims;
    }

    @Override
    public void revokeToken(String token) {
        JWTClaimsSet claims = validateAndDecryptToken(token);
        if (claims == null) {
            log.warn("Token is invalid or expired, cannot revoke it: {}", token);
            return;
        }

        String tokenId = extractTokenId(claims);
        String tokenType = extractTokenType(claims);

        // Calculate remaining time for the token
        long expirationTime = claims.getExpirationTime().getTime();
        long currentTime = System.currentTimeMillis();
        long ttlMillis = expirationTime - currentTime;

        if (ttlMillis > 0) {
            // Store in redis with ttl matching token expiration
            String redisKey = REVOKED_TOKEN_PREFIX + tokenId;
            redisTemplate.opsForValue().set(redisKey, tokenType,ttlMillis, TimeUnit.MILLISECONDS);
        }

    }

    @Override
    public boolean isTokenRevoked(String token) {
        JWTClaimsSet claims = validateAndDecryptToken(token);
        if (claims == null) {
            return true; // Invalid token is treated as revoked
        }

        String tokenId = extractTokenId(claims);
        String redisKey = REVOKED_TOKEN_PREFIX + tokenId;

        return Boolean.TRUE.equals(redisTemplate.hasKey(redisKey));
    }

    private String generateToken(CompanyAccount account, long expirationMs, String tokenType) {
        try {
            Date now = new Date();
            Date expiration = new Date(now.getTime() + expirationMs);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .jwtID(UUID.randomUUID().toString())
                    .subject(account.getId().toString())
                    .issuer("job-manager-auth")
                    .issueTime(now)
                    .expirationTime(expiration)
                    .claim(CLAIM_USER_ID, account.getId().toString())
                    .claim(CLAIM_EMAIL, account.getEmail())
                    .claim(CLAIM_ROLE, account.getRole().name())
                    .claim(CLAIM_COUNTRY_CODE, account.getCountry().getCode())
                    .claim(CLAIM_TOKEN_TYPE, tokenType)
                    .build();

            // Create the JWE header
            JWEHeader header = new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)
                    .contentType("JWT")
                    .build();

            // Create encrypted JWT
            EncryptedJWT encryptedJWT = new EncryptedJWT(header, claimsSet);

            // Encrypt with the public key
            RSAEncrypter encrypter = new RSAEncrypter(jweProperties.getPublicKey());
            encryptedJWT.encrypt(encrypter);

            return encryptedJWT.serialize();

        } catch (JOSEException e) {
            throw new RuntimeException("Failed to generate JWE token", e);
        }
    }
}
