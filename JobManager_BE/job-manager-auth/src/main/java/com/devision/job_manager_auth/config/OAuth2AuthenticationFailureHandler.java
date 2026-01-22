package com.devision.job_manager_auth.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage(), exception);

        String errorMessage = exception.getMessage() != null ? exception.getMessage() : "Authentication failed";

        // Redirect to frontend with error
        String redirectUrl = String.format(
                "%s/login?sso=google&success=false&error=%s",
                frontendUrl,
                java.net.URLEncoder.encode(errorMessage, "UTF-8")
        );

        log.info("Redirecting to frontend with OAuth2 error: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}
