// package com.devision.job_manager_gateway.config;

// import org.springframework.cloud.gateway.route.RouteLocator;
// import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class GatewayConfig {

//     @Bean
//     public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
//         return builder.routes()
//                 .route("auth-service", r -> r.path("/api/auth/**")
//                         .uri("lb://job-manager-auth"))
//                 .route("company-service", r -> r.path("/api/companies/**")
//                         .uri("lb://job-manager-company"))
//                 .route("jobpost-service", r -> r.path("/api/job-posts/**")
//                         .uri("lb://job-manager-jobpost"))
//                 .route("applicant-search-service", r -> r.path("/api/search/**")
//                         .uri("lb://job-manager-applicant-search"))
//                 .route("premium-service", r -> r.path("/api/premium/**")
//                         .uri("lb://job-manager-subscription"))
//                 .route("payment-service", r -> r.path("/api/payments/**")
//                         .uri("lb://job-manager-payment"))
//                 .route("notification-service", r -> r.path("/api/notifications/**")
//                         .uri("lb://job-manager-notification"))
//                 .build();
//     }
// }
