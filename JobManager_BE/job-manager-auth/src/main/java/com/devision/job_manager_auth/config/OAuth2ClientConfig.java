package com.devision.job_manager_auth.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

@Slf4j
@Configuration
public class OAuth2ClientConfig {

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    @Value("${GOOGLE_CLIENT_SECRET:}")
    private String googleClientSecret;

    @Value("${OAUTH2_REDIRECT_URI:http://localhost:8081/login/oauth2/code/google}")
    private String oauth2RedirectUri;

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        log.info("=== Creating ClientRegistrationRepository ===");
        log.info("Google Client ID configured: {}", googleClientId != null && !googleClientId.isBlank());
        log.info("Google Client Secret configured: {}", googleClientSecret != null && !googleClientSecret.isBlank());
        log.info("OAuth2 Redirect URI: {}", oauth2RedirectUri);

        if (googleClientId == null || googleClientId.isBlank() ||
                googleClientSecret == null || googleClientSecret.isBlank()) {
            log.warn("OAuth2 credentials not configured properly");
            return new InMemoryClientRegistrationRepository();
        }

        ClientRegistration googleRegistration = ClientRegistration
                .withRegistrationId("google")
                .clientId(googleClientId)
                .clientSecret(googleClientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(oauth2RedirectUri)
                .scope("openid", "profile", "email")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .clientName("Google")
                .build();

        log.info("Google OAuth2 client registration created successfully");
        return new InMemoryClientRegistrationRepository(googleRegistration);
    }
}
