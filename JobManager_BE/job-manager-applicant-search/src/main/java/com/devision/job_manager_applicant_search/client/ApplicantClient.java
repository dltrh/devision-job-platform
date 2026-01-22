package com.devision.job_manager_applicant_search.client;

import com.devision.job_manager_applicant_search.dto.ApiResponse;
import com.devision.job_manager_applicant_search.dto.PageResponse;
import com.devision.job_manager_applicant_search.dto.internal.response.ApplicantResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

/**
 * Client for calling Job Applicant service's user search endpoints.
 * 
 * Aligned with JA's /api/v1/users/search endpoint as of 2026-01-04.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicantClient {

    private static final Duration TIMEOUT = Duration.ofSeconds(10);
    
    private final WebClient applicantWebClient;

    /**
     * Search for applicants using JA service's search endpoint.
     * 
     * @param skills Comma-separated list of skill names
     * @param country Two-letter country code
     * @param city City name
     * @param education Education level (HIGH_SCHOOL, ASSOCIATE, BACHELOR, MASTER, DOCTORATE)
     * @param workExperience Comma-separated work experience keywords
     * @param employmentTypes Comma-separated employment types
     * @param username Name search (firstName, lastName)
     * @param ftsQuery Full-Text Search query for Work Experience, Objective Summary, and Technical Skills
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return Paginated response of matching applicants
     */
    public PageResponse<ApplicantResponse> searchApplicants(
            String skills,
            String country,
            String city,
            String education,
            String workExperience,
            String employmentTypes,
            String username,
            String ftsQuery,
            int page,
            int size) {
        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder
                    .fromPath("/api/v1/users/search");

            if (skills != null && !skills.isEmpty()) {
                uriBuilder.queryParam("skills", skills);
            }
            if (country != null && !country.isEmpty()) {
                uriBuilder.queryParam("country", country);
            }
            if (city != null && !city.isEmpty()) {
                uriBuilder.queryParam("city", city);
            }
            if (education != null && !education.isEmpty()) {
                uriBuilder.queryParam("education", education);
            }
            if (workExperience != null && !workExperience.isEmpty()) {
                uriBuilder.queryParam("workExperience", workExperience);
            }
            if (employmentTypes != null && !employmentTypes.isEmpty()) {
                uriBuilder.queryParam("employmentTypes", employmentTypes);
            }
            if (username != null && !username.isEmpty()) {
                uriBuilder.queryParam("username", username);
            }
            // FTS Query - Full-Text Search across Work Experience, Objective Summary, and Technical Skills
            if (ftsQuery != null && !ftsQuery.isEmpty()) {
                uriBuilder.queryParam("ftsQuery", ftsQuery);
            }
            uriBuilder.queryParam("page", page);
            uriBuilder.queryParam("size", size);

            String uri = uriBuilder.build().toUriString();
            log.debug("Calling JA search endpoint: {}", uri);

            ApiResponse<PageResponse<ApplicantResponse>> response = applicantWebClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<PageResponse<ApplicantResponse>>>() {})
                    .timeout(TIMEOUT)
                    .block();

            if (response != null && response.isSuccess() && response.getData() != null) {
                PageResponse<ApplicantResponse> data = response.getData();
                log.info("Received {} applicants from JA service (page {} of {})", 
                        data.getContent().size(), data.getPage(), data.getTotalPages());
                return data;
            }

            log.warn("JA search returned empty or unsuccessful response");
            return PageResponse.empty();
        } catch (Exception e) {
            log.error("Failed to search applicants from JA service: {}", e.getMessage(), e);
            return PageResponse.empty();
        }
    }

    /**
     * Get all active users from JA service (paginated).
     * 
     * @param page Page number
     * @param size Page size
     * @return Paginated response of applicants
     */
    public PageResponse<ApplicantResponse> getAllApplicants(int page, int size) {
        try {
            String uri = UriComponentsBuilder
                    .fromPath("/api/v1/users")
                    .queryParam("page", page)
                    .queryParam("size", size)
                    .build()
                    .toUriString();

            ApiResponse<PageResponse<ApplicantResponse>> response = applicantWebClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<PageResponse<ApplicantResponse>>>() {})
                    .timeout(TIMEOUT)
                    .block();

            if (response != null && response.isSuccess() && response.getData() != null) {
                log.info("Received {} applicants from JA service", response.getData().getContent().size());
                return response.getData();
            }

            log.warn("JA get all users returned empty or unsuccessful response");
            return PageResponse.empty();
        } catch (Exception e) {
            log.error("Failed to get all applicants from JA service: {}", e.getMessage(), e);
            return PageResponse.empty();
        }
    }

    /**
     * Get all skills from JA service.
     * 
     * @return List of all available skills
     */
    public List<ApplicantResponse.SkillDto> getAllSkills() {
        try {
            ApiResponse<List<ApplicantResponse.SkillDto>> response = applicantWebClient.get()
                    .uri("/api/v1/skills")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<ApplicantResponse.SkillDto>>>() {})
                    .timeout(TIMEOUT)
                    .block();

            if (response != null && response.isSuccess() && response.getData() != null) {
                log.debug("Received {} skills from JA service", response.getData().size());
                return response.getData();
            }

            log.warn("JA get all skills returned empty or unsuccessful response");
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get skills from JA service: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Search skills by name from JA service.
     * 
     * @param query Search query
     * @return List of matching skills
     */
    public List<ApplicantResponse.SkillDto> searchSkills(String query) {
        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder
                    .fromPath("/api/v1/skills/search");
            
            if (query != null && !query.isEmpty()) {
                uriBuilder.queryParam("q", query);
            }

            ApiResponse<List<ApplicantResponse.SkillDto>> response = applicantWebClient.get()
                    .uri(uriBuilder.build().toUriString())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<ApplicantResponse.SkillDto>>>() {})
                    .timeout(TIMEOUT)
                    .block();

            if (response != null && response.isSuccess() && response.getData() != null) {
                return response.getData();
            }

            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to search skills from JA service: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
