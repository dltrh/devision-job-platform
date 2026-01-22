package com.devision.job_manager_auth.config;

import com.devision.job_manager_auth.dto.internal.ApiResponse;
import com.devision.job_manager_auth.dto.internal.AuthResponse;
import com.devision.job_manager_auth.dto.internal.PendingSsoRegistration;
import com.devision.job_manager_auth.entity.AuthProvider;
import com.devision.job_manager_auth.repository.CompanyAccountRepository;
import com.devision.job_manager_auth.service.internal.AuthenticationService;
import com.devision.job_manager_auth.service.internal.SsoRegistrationCacheService;
import com.devision.job_manager_auth.service.internal.impl.ShardDirectQueryService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final SsoRegistrationCacheService ssoRegistrationCacheService;
    private final CompanyAccountRepository companyAccountRepository;
    private final AuthenticationService authenticationService;
    private final ShardDirectQueryService shardDirectQueryService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        // Extract Google user info
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String ssoProviderId = oauth2User.getAttribute("sub"); // Google's unique user ID

        log.info("OAuth2 authentication successful for email: {}", email);

        // Check if user already exists with this SSO provider across all shards
        boolean existingUser = shardDirectQueryService.ssoProviderIdExistsInAnyShard(AuthProvider.GOOGLE, ssoProviderId);

        if (existingUser) {
            // Log the user in
            handleExistingLogin(response, ssoProviderId, email);
        } else {
            // Store pending registration in Redis Cache
            handleNewUserRegistration(response, email, name, ssoProviderId);
        }
    }

    private void handleExistingLogin(HttpServletResponse response, String ssoProviderId, String email)
            throws IOException {
        log.info("Already have SSO account, performing login: {}", email);

        ApiResponse<AuthResponse> loginResponse = authenticationService.loginViaSso(ssoProviderId);

        if (loginResponse.isSuccess() && loginResponse.getData() != null) {
            AuthResponse authData = loginResponse.getData();

            // Redirect to frontend with JWT token and user data
            String redirectUrl = String.format(
                    "%s/login?sso=google&success=true&accessToken=%s&refreshToken=%s&companyId=%s&email=%s&role=%s&authProvider=%s",
                    frontendUrl,
                    authData.getAccessToken(),
                    authData.getRefreshToken(),
                    authData.getCompanyId(),
                    java.net.URLEncoder.encode(authData.getEmail(), "UTF-8"),
                    authData.getRole(),
                    authData.getAuthProvider()
            );

            log.info("Redirecting existing SSO user to frontend with tokens and user data");
            log.info("Redirect URL: {}", redirectUrl);
            response.sendRedirect(redirectUrl);
        } else {
            // Login failed
            String errorMessage = loginResponse.getMessage() != null ? loginResponse.getMessage() : "SSO Login failed";

            String redirectUrl = String.format(
                    "%s/login?sso=google&success=false&error=%s",
                    frontendUrl,
                    java.net.URLEncoder.encode(errorMessage, "UTF-8")
            );

            log.warn("SSO login failed for user: {} - {}", email, errorMessage);
            response.sendRedirect(redirectUrl);
        }
    }

    private void handleNewUserRegistration(HttpServletResponse response, String email, String name, String ssoProviderId)
            throws IOException {
        log.info("New SSO user, creating PENDING registration: {}", email);

        // Check if email is already used with local registration
        if (companyAccountRepository.existsByEmail(email)) {
            String redirectUrl = String.format(
                    "%s/register?sso=google&success=false&error=%s",
                    frontendUrl,
                    java.net.URLEncoder.encode("Email already registered with password login", "UTF-8")
            );

            log.warn("SSO registration failed: Email already used with local registration - {}", email);
            response.sendRedirect(redirectUrl);
            return;
        }

        // Create a pending registration in Redis
        PendingSsoRegistration pendingRegistration = PendingSsoRegistration.builder()
                .email(email)
                .name(name)
                .ssoProviderId(ssoProviderId)
                .authProvider(AuthProvider.GOOGLE)
                .createdAt(LocalDateTime.now())
                .build();

        String token = ssoRegistrationCacheService.storePendingRegistration(pendingRegistration);

        // Redirect to frontend signup with token
        String redirectUrl = String.format(
                "%s/register?sso=google&token=%s&email=%s&name=%s",
                frontendUrl,
                token,
                java.net.URLEncoder.encode(email, "UTF-8"),
                java.net.URLEncoder.encode(name != null ? name : "", "UTF-8")
        );

        log.info("Redirecting new SSO user to frontend signup with token");
        response.sendRedirect(redirectUrl);

    }
}
