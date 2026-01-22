package com.devision.job_manager_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class JobManagerGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobManagerGatewayApplication.class, args);
	}

    @Bean
    public RouteLocator routerBuilder(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("job-manager-auth", r -> r.path("/api/auth")
                        .uri("http://localhost:8081/"))
                .route("job-manager-company", r -> r.path("/api/companies")
                        .uri("http://localhost:8082/"))
                .build();
    }

}
