package com.devision.job_manager_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    private static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:5173",          // Development frontend
            "http://localhost",               // Docker frontend (port 80)
            "http://localhost:80",            // Docker frontend (explicit port)
            "http://52.76.250.138:5173",      // EC2 Frontend deployment
            "http://52.76.250.138",           // EC2 Frontend (port 80)
            "http://52.76.250.138:80",        // EC2 Frontend (explicit port 80)
            "https://52.76.250.138:443",
            "https://mulan-jm.online",        // Production domain
            "https://www.mulan-jm.online"     // Production domain with www
    );

    /**
     * High-priority WebFilter to handle CORS preflight (OPTIONS) requests
     * This runs BEFORE all other filters including gateway filters
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public WebFilter corsPreflightFilter() {
        return (ServerWebExchange exchange, WebFilterChain chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();
            
            String origin = request.getHeaders().getOrigin();
            
            // Check if origin is allowed
            if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
                HttpHeaders headers = response.getHeaders();
                headers.setAccessControlAllowOrigin(origin);
                headers.setAccessControlAllowCredentials(true);
                headers.setAccessControlAllowMethods(Arrays.asList(
                        HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, 
                        HttpMethod.DELETE, HttpMethod.PATCH, HttpMethod.OPTIONS
                ));
                headers.setAccessControlAllowHeaders(List.of(
                        "Authorization", "Content-Type", "Accept", "Origin",
                        "X-Requested-With", "Access-Control-Request-Method",
                        "Access-Control-Request-Headers"
                ));
                headers.setAccessControlExposeHeaders(List.of("Authorization"));
                headers.setAccessControlMaxAge(3600L);
                
                // Handle preflight OPTIONS request immediately
                if (request.getMethod() == HttpMethod.OPTIONS) {
                    response.setStatusCode(HttpStatus.OK);
                    return response.setComplete();
                }
            }
            
            return chain.filter(exchange);
        };
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Allow your frontend origins
        corsConfig.setAllowedOrigins(ALLOWED_ORIGINS);

        // Allow all HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allow all headers
        corsConfig.setAllowedHeaders(List.of("*"));

        // Allow credentials (cookies, authorization headers)
        corsConfig.setAllowCredentials(true);

        // Expose Authorization header to frontend
        corsConfig.setExposedHeaders(List.of("Authorization"));

        // Cache preflight response for 1 hour
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
