package com.devision.job_manager_auth.controller;

import com.devision.job_manager_auth.dto.internal.ApiResponse;
import com.devision.job_manager_auth.dto.internal.AuthResponse;
import com.devision.job_manager_auth.dto.internal.CompleteSsoRegistrationRequest;
import com.devision.job_manager_auth.dto.internal.PendingSsoRegistration;
import com.devision.job_manager_auth.dto.internal.SsoRegisterRequest;
import com.devision.job_manager_auth.entity.AuthProvider;
import com.devision.job_manager_auth.entity.Country;
import com.devision.job_manager_auth.service.internal.AuthenticationService;
import com.devision.job_manager_auth.service.internal.SsoRegistrationCacheService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {
    private final AuthenticationService authenticationService;
    private final SsoRegistrationCacheService ssoRegistrationCacheService;

    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<AuthResponse>> handleOAuth2Callback(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestParam(required = false) String country
    ) {
        log.info("OAuth2 callback received");

        // Extract user info from OAuth2User
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String ssoProviderId = (String) attributes.get("sub"); // Google's user Id

        log.info("OAuth2 user: email={}, name={}, ssoProviderId={}", email, name, ssoProviderId);

        // If user exists --> login, otherwise register
        ApiResponse<AuthResponse> response;

        try {
            response = authenticationService.loginViaSso(ssoProviderId);
            log.info("Existing SSO user logged in: {}", email);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.info("New SSO user registered: {}", email);

            // For SSO registration, country should be provided by frontend
            if (country == null || country.isBlank()) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Country is required for new SSO registration")
                );
            }

            Country countryEnum = null;
            if (country != null && !country.isBlank()) {
                try {
//                    countryEnum = Country.valueOf(country.toUpperCase());
                    countryEnum = Country.fromCode(country);

                } catch (IllegalArgumentException ex) {
                    log.warn("Invalid country code provided during SSO registration: {}", country);
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid country code provided:" + country));
                }
            }

            SsoRegisterRequest ssoRequest = SsoRegisterRequest.builder()
                    .email(email)
                    .country(countryEnum)
                    .provider(AuthProvider.GOOGLE)
                    .ssoProviderId(ssoProviderId)
                    .name(name)
                    .build();

            ApiResponse<String> registrationResponse = authenticationService.registerCompanyViaSso(ssoRequest);

            // After registration, log the user in
            response = authenticationService.loginViaSso(ssoProviderId);
            log.info("New SSO user registered and logged in: {}", email);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
    }

    @GetMapping("/google")
    public void initiateGoogleLogin(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<AuthResponse>> completeSsoRegistration(
            @Valid @RequestBody CompleteSsoRegistrationRequest request
    ) {
        log.info("Completing SSO registration with token: {}", request.getToken());

        Optional<PendingSsoRegistration> pendingRegistration = ssoRegistrationCacheService.retrieveAndDeletePendingRegistration(request.getToken());

        if (pendingRegistration.isEmpty()) {
            log.warn("SSO registration completion failed: Invalid or expired token");
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid or expired SSO registration token. Please try again.")
            );
        }

        PendingSsoRegistration registration = pendingRegistration.get();
        log.info("Found pending registration for email: {}", registration.getEmail());

        // Convert country from String to enum
//        Country countryEnum;
//        try {
//            countryEnum = Country.valueOf(request.getCountry().toUpperCase());
//
//        } catch (IllegalArgumentException e) {
//            log.warn("Invalid country code provided: {}", request.getCountry());
//            return ResponseEntity.badRequest().body(
//                    ApiResponse.error("Invalid country code: " + request.getCountry())
//            );
//        }

        Country countryEnum = Country.fromCode(request.getCountry());

        if (countryEnum == null) {
            log.warn("Invalid country code provided: {}", request.getCountry());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid country code: " + request.getCountry())
            );
        }

        SsoRegisterRequest ssoRequest = SsoRegisterRequest.builder()
                .email(registration.getEmail())
                .country(countryEnum)
                .provider(AuthProvider.GOOGLE)
                .ssoProviderId(registration.getSsoProviderId())
                .name(registration.getName())
                .build();

        ApiResponse<String> registrationResponse = authenticationService.registerCompanyViaSso(ssoRequest);

        if (!registrationResponse.isSuccess()) {
            log.warn("SSO registration failed: {}", registrationResponse.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(registrationResponse.getMessage())
            );
        }

        // Log user in after successful registration
        ApiResponse<AuthResponse> loginResponse = authenticationService.loginViaSso(
                registration.getSsoProviderId()
        );

        if (!loginResponse.isSuccess()) {
            log.warn("SSO login after registration failed: {}", loginResponse.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Registration successful but login failed. Please try logging in.")
            );
        }

        log.info("SSO registration completed successfully for: {}", registration.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(loginResponse);
    }
}
