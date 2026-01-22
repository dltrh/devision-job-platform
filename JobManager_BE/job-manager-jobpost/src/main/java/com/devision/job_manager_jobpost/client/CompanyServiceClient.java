package com.devision.job_manager_jobpost.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

/**
 * Feign client for Company Service integration.
 * Used to fetch company country code for Kafka events (Ultimo 4.3.1 requirement).
 *
 * Configuration:
 * - Uses Eureka service discovery (name = "company-service")
 * - Fallback to manual URL if Eureka unavailable (url property in application.yaml)
 * - Caching is handled at service layer to minimize calls
 */
@FeignClient(
    name = "company-service",
    url = "${company.service.url:}"  // Empty default allows Eureka discovery
)
public interface CompanyServiceClient {

    /**
     * Get country code for a company.
     * Lightweight endpoint that returns only the country code string.
     *
     * @param companyId The company UUID
     * @return Country code (e.g., "VN", "AUS", "USA")
     */
    @GetMapping("/api/companies/{companyId}/country")
    String getCompanyCountry(@PathVariable("companyId") UUID companyId);
}
