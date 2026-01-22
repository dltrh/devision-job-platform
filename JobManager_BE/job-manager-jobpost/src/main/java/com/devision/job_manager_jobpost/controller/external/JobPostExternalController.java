package com.devision.job_manager_jobpost.controller.external;

import com.devision.job_manager_jobpost.api.external.JobPostExternalApi;
import com.devision.job_manager_jobpost.dto.external.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;

/**
 * External API controller for other microservices
 * Accessible via: /api/external/job-posts
 */
@RestController
@RequestMapping("/api/external/job-posts")
@RequiredArgsConstructor
@Slf4j
public class JobPostExternalController {
    
    private final JobPostExternalApi jobPostExternalApi;
    
    @GetMapping("/{id}")
    public ResponseEntity<JobPostBasicInfoDto> getJobPostBasicInfo(@PathVariable UUID id) {
        log.info("External request: Get job post basic info for ID: {}", id);
        return jobPostExternalApi.getJobPostBasicInfo(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/status")
    public ResponseEntity<JobPostStatusDto> getJobPostStatus(@PathVariable UUID id) {
        log.info("External request: Get job post status for ID: {}", id);
        return jobPostExternalApi.getJobPostStatus(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/company/{companyId}")
    public ResponseEntity<Page<JobPostSummaryDto>> getPublishedJobPostsByCompany(@PathVariable UUID companyId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        log.info("External request: Get published job posts for company ID: {}", companyId);
        return jobPostExternalApi.getPublishedJobPostsByCompany(companyId, pageable)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/is-published")
    public ResponseEntity<Boolean> isJobPostPublished(@PathVariable UUID id) {
        log.info("External request: Check if job post is published: {}", id);
        return ResponseEntity.ok(jobPostExternalApi.isJobPostPublished(id));
    }
    
    @GetMapping("/{id}/is-expired")
    public ResponseEntity<Boolean> isJobPostExpired(@PathVariable UUID id) {
        log.info("External request: Check if job post is expired: {}", id);
        return ResponseEntity.ok(jobPostExternalApi.isJobPostExpired(id));
    }
    
    @GetMapping("/company/{companyId}/count")
    public ResponseEntity<Long> getPublishedJobPostCount(@PathVariable UUID companyId) {
        log.info("External request: Get published job post count for company ID: {}", companyId);
        return ResponseEntity.ok(jobPostExternalApi.getPublishedJobPostCount(companyId));
    }

    /**
     * Search job posts with criteria
     * This search endpoint is for JA team
     *
     * Supports:
     * Case-insensitive title search
     * Multiple employment type filtering
     * Location filtering by city or country
     * Salary range filtering
     * Fresher status
     */
    @PostMapping("/search")
    public ResponseEntity<Page<JobSearchResultDto>> searchJobPosts(
            @Valid @RequestBody JobSearchRequest request) {
        log.info("Request from JA: Search job posts - title={}, employmentTypes={}, locationCity={}, countryCode={}, minSalary={}, maxSalary={}, fresher={}, page={}, size={}",
                request.getTitle(),
                request.getEmploymentTypes(),
                request.getLocationCity(),
                request.getCountryCode(),
                request.getMinSalary(),
                request.getMaxSalary(),
                request.getFresher(),
                request.getPage(),
                request.getSize());

        Page<JobSearchResultDto> results = jobPostExternalApi.searchJobPosts(request);

        log.info("Search returned {} results out of {} total",
                results.getNumberOfElements(),
                results.getTotalElements());

        return ResponseEntity.ok(results);
    }
}
