package com.devision.job_manager_auth.security;

import com.devision.job_manager_auth.config.security.AuthenticatedUser;
import com.devision.job_manager_auth.config.sharding.ShardContext;
import com.devision.job_manager_auth.entity.Country;
import com.devision.job_manager_auth.service.internal.JweTokenService;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JweTokenService jweTokenService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            // Extract token from Authorization header
            String token = extractTokenFromRequest(request);

            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Validate and decrypt access token
                JWTClaimsSet claims = jweTokenService.validateAndDecryptToken(token);

                if (claims != null) {
                    // Get user information
                    UUID userId = jweTokenService.extractUserId(claims);
                    String email = jweTokenService.extractEmail(claims);
                    String role = jweTokenService.extractRole(claims);
                    String countryCode = jweTokenService.extractCountryCode(claims);

                    // Set shard context
                    setShardContext(countryCode);

                    // Create authorities from role
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority(role)
                    );

                    // Create auth token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            new AuthenticatedUser(userId, email, role, countryCode),
                            null,
                            authorities
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set auth in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("Authenticated user: {} with role: {}", email, role);
                } else {
                    log.debug("Invalid or expired token");
                }
            }
        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }

    private void setShardContext(String countryCode) {
        if (countryCode != null) {
            Country country = Country.fromCode(countryCode);
            if (country != null) {
                ShardContext.setShardKey(country.getShardKey());
                log.debug("Shard context set to: {}", country.getShardKey());

            }
        }
    }

    // Determin which requests to not be filtered
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        return path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/activate") ||
                path.startsWith("/api/auth/resend-activation") ||
                path.startsWith("/api/auth/forgot-password") ||
                path.startsWith("/api/auth/reset-password") ||
                path.startsWith("/api/auth/countries") ||
                path.startsWith("/api/auth/oauth2") ||
                path.startsWith("/api/auth/health") ||
                path.startsWith("/oauth2") ||
                path.startsWith("/login/oauth2") ||
                path.startsWith("/api/external") ||
                path.startsWith("/api/auth/logout") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/auth/complete") ||
                path.startsWith("/api/auth/diagnostics") ||
                path.startsWith("/actuator") ||
                path.startsWith("/health");
    }
}
