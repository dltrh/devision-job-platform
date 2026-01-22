package com.devision.job_manager_auth.service.internal;

import com.devision.job_manager_auth.entity.CompanyAccount;
import com.nimbusds.jwt.JWTClaimsSet;

import java.util.UUID;

public interface JweTokenService {
    // Claim keys
    String CLAIM_USER_ID = "userId";
    String CLAIM_EMAIL = "email";
    String CLAIM_ROLE = "role";
    String CLAIM_COUNTRY_CODE = "countryCode";
    String CLAIM_TOKEN_TYPE = "tokenType";

    String generateAccessToken(CompanyAccount account);
    String generateRefreshToken(CompanyAccount account);
    JWTClaimsSet validateAndDecryptToken(String token);
    UUID extractUserId(JWTClaimsSet claims);
    String extractEmail(JWTClaimsSet claims);
    String extractRole(JWTClaimsSet claims);
    String extractCountryCode(JWTClaimsSet claims);
    String extractTokenType(JWTClaimsSet claims);
    String extractTokenId(JWTClaimsSet claims); // need the token ID for redis storage and revocation
    JWTClaimsSet isValidAccessToken(String token);
    JWTClaimsSet isValidRefreshToken(String token);
    void revokeToken(String token);
    boolean isTokenRevoked(String token);
}
