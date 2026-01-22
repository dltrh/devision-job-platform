package com.devision.job_manager_auth.config.sharding;


import com.devision.job_manager_auth.entity.Country;
import com.devision.job_manager_auth.service.internal.JweTokenService;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Extracts the country from the JWT token and sets a shard before the request reaches the controllers
 */

@Slf4j
@Component
@RequiredArgsConstructor
public class ShardInterceptor implements HandlerInterceptor {
    private final JweTokenService jweTokenService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);

                JWTClaimsSet claims = jweTokenService.validateAndDecryptToken(token);

                if (claims != null) {

                    // Extract country from JWT claims
                    String countryCode = jweTokenService.extractCountryCode(claims);

                    if (countryCode != null) {
                        Country country = Country.fromCode(countryCode);
                        if (country != null) {
                            String shardKey = country.getShardKey();
                            ShardContext.setShardKey(shardKey);
                            log.debug("Shard context set to '{}' for country '{}'", shardKey, countryCode);
                        } else {
                            log.debug("Unknown country code '{}', using default shard", countryCode);
                            ShardContext.setShardKey(ShardContext.DEFAULT_SHARD);
                        }
                    } else {
                        log.debug("No country in JWE claims, using default shard");
                        ShardContext.setShardKey(ShardContext.DEFAULT_SHARD);
                    }
                }
            } catch (Exception e) {
                log.debug("Could not extract shard info from token: {}", e.getMessage());

                ShardContext.setShardKey(ShardContext.DEFAULT_SHARD);
            }
        } else {
            // No auth header - this might be a public endpoint (login, register)
            // Shard will be set explicitly in the service layer for these cases
            log.debug("No Authorization header, shard will be set by service layer");
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) throws Exception {
        ShardContext.clear();
    }
}
