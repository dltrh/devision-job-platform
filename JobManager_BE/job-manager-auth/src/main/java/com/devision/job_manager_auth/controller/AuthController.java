package com.devision.job_manager_auth.controller;

import com.devision.job_manager_auth.config.sharding.ShardContext;
import com.devision.job_manager_auth.dto.internal.*;
import com.devision.job_manager_auth.entity.Country;
import com.devision.job_manager_auth.service.internal.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {

        log.info("Registration request received for email: {}", request.getEmail());
        String shardKey = request.getCountry().getShardKey();
        ShardContext.setShardKey(shardKey);
        log.info("Shard context set to '{}' for country '{}'", shardKey, request.getCountry().getDisplayName());

        try {
            ApiResponse<String> response = authenticationService.registerCompany(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } finally {
            ShardContext.clear();
        }

    }

    @PostMapping("/activate")
    public ResponseEntity<ApiResponse<String>> activate(@Valid @RequestBody ActivationRequest request) {
        log.info("Activation request received for token: {}", request.getToken().substring(0, 10) + "...");
        ApiResponse<String> response = authenticationService.activateAccount(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-activation")
    public ResponseEntity<ApiResponse<String>> resendActivation(@RequestParam String email) {
        log.info("Resend activation email requested for: {}", email);
        ApiResponse<String> response = authenticationService.resendActivationEmail(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for: {}", request.getEmail());
        ApiResponse<AuthResponse> response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@RequestHeader("Authorization") String token) {
        log.info("Logout request received for token: {}", token);
        ApiResponse<String> response = authenticationService.logout(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request received");
        ApiResponse<AuthResponse> response = authenticationService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth Service is running");
    }

    @GetMapping("/countries")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getCountries() {
        List<Map<String, String>> countries = Arrays.stream(Country.values())
            .map(c -> Map.of("code", c.getCode(), "displayName", c.getDisplayName()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Country list", countries));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request received for email: {}", request.getEmail());
        ApiResponse<String> response = authenticationService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Reset password request received");
        ApiResponse<String> response = authenticationService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestParam String companyId,
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("Change password request received for company: {}", companyId);
        ApiResponse<String> response = authenticationService.changePassword(companyId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-email")
    public ResponseEntity<ApiResponse<String>> changeEmail(
            @RequestParam String companyId,
            @Valid @RequestBody ChangeEmailRequest request) {
        log.info("Change email request received for company: {}", companyId);
        ApiResponse<String> response = authenticationService.changeEmail(companyId, request);
        return ResponseEntity.ok(response);
    }
}
