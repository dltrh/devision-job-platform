package com.devision.job_manager_jobpost.api.external.impl;

import com.devision.job_manager_jobpost.api.external.JobPostExternalApi;
import com.devision.job_manager_jobpost.dto.external.*;
import com.devision.job_manager_jobpost.model.EmploymentType;
import com.devision.job_manager_jobpost.model.JobPost;
import com.devision.job_manager_jobpost.model.JobPostEmploymentType;
import com.devision.job_manager_jobpost.model.JobPostSkill;
import com.devision.job_manager_jobpost.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobPostExternalApiImpl implements JobPostExternalApi {
    
    private final JobPostRepository jobPostRepository;
    
    @Override
    public Optional<JobPostBasicInfoDto> getJobPostBasicInfo(UUID jobPostId) {
        log.debug("External API: Getting basic info for job post ID: {}", jobPostId);
        return jobPostRepository.findById(jobPostId)
                .map(this::mapToBasicInfo);
    }
    
    @Override
    public Optional<JobPostStatusDto> getJobPostStatus(UUID jobPostId) {
        log.debug("External API: Getting status for job post ID: {}", jobPostId);
        return jobPostRepository.findById(jobPostId)
                .map(jobPost -> JobPostStatusDto.builder()
                        .id(jobPost.getJobPostId())
                        .companyId(jobPost.getCompanyId())
                        .isPublished(jobPost.isPublished())
                        .isExpired(isExpired(jobPost))
                        .isActive(jobPost.isPublished() && !isExpired(jobPost))
                        .build());
    }

    @Override public Optional<JobPostSummaryDto> getJobPostSummary(UUID jobPostId) {
        log.debug("External API: Getting summary for job post ID: {}", jobPostId);
        return jobPostRepository.findById(jobPostId)
                .map(this::mapToSummary);
    }
    
    @Override

    public Optional<Page<JobPostSummaryDto>> getPublishedJobPostsByCompany(UUID companyId, Pageable pageable) {
    Page<JobPost> page = jobPostRepository.findByPublishedTrueAndCompanyId(companyId, pageable);
    Page<JobPostSummaryDto> dtoPage = page.map(this::mapToSummary);
     return Optional.ofNullable(dtoPage);
    }
    
    @Override
    public boolean isJobPostPublished(UUID jobPostId) {
        return jobPostRepository.findById(jobPostId)
                .map(JobPost::isPublished)
                .orElse(false);
    }
    
    @Override
    public boolean isJobPostExpired(UUID jobPostId) {
        return jobPostRepository.findById(jobPostId)
                .map(this::isExpired)
                .orElse(true);
    }
    
    @Override
    public long getPublishedJobPostCount(UUID companyId) {
        return jobPostRepository.countByPublishedTrueAndCompanyId(companyId);
    }
    
    // Helper methods
    private JobPostBasicInfoDto mapToBasicInfo(JobPost jobPost) {
        return JobPostBasicInfoDto.builder()
                .id(jobPost.getJobPostId())
                .companyId(jobPost.getCompanyId())
                .title(jobPost.getTitle())
                .description(jobPost.getDescription())
                .isPublished(jobPost.isPublished())
                .isFresher(jobPost.isFresher())
                .locationCity(jobPost.getLocationCity())
                .build();
    }
    
    private JobPostSummaryDto mapToSummary(JobPost jobPost) {
        return JobPostSummaryDto.builder()
                .id(jobPost.getJobPostId())
                .companyId(jobPost.getCompanyId())
                .title(jobPost.getTitle())
                .locationCity(jobPost.getLocationCity())
                // .countryId(jobPost.getCountryId())
                .isFresher(jobPost.isFresher())
                .postedAt(jobPost.getPostedAt())
                .salary(JobPostSummaryDto.SalaryInfoDto.builder()
                        .type(jobPost.getSalaryType() != null ? jobPost.getSalaryType().name() : null)
                        .min(jobPost.getSalaryMin())
                        .max(jobPost.getSalaryMax())
                        .note(jobPost.getSalaryNote())
                        .build())
                .build();
    }
    
    private boolean isExpired(JobPost jobPost) {
        return jobPost.getExpiryAt() != null && 
               jobPost.getExpiryAt().isBefore(LocalDateTime.now());
    }

    @Override
    public Page<JobSearchResultDto> searchJobPosts(JobSearchRequest request) {
        log.info("Searching job posts with criteria: title={}, employmentTypes={}, city={}, minSalary={}, maxSalary={}, fresher={}, countryCode={}",
                request.getTitle(), request.getEmploymentTypes(),
                request.getLocationCity(), request.getMinSalary(),
                request.getMaxSalary(), request.getFresher(),
                request.getCountryCode());

        // Create pageable from the request
        Pageable pageable = PageRequest.of(
                request.getPage() != null ? request.getPage() : 0,
                request.getSize() != null ? request.getSize() : 10
        );

        // Normalize empty list to null
        List<EmploymentType> employmentTypes = request.getEmploymentTypes();
        if (employmentTypes != null && employmentTypes.isEmpty()) {
            employmentTypes = null;
        }

        // Preprocess string params for case-insensitive matching
        String titlePattern = prepareTitle(request.getTitle());
        String locationCity = prepareLocationCity(request.getLocationCity());
        String countryCode = prepareCountryCode(request.getCountryCode());

        // Query from the database
        Page<JobPost> jobPosts;
        if (employmentTypes == null) {
            // No employment type filter
            jobPosts = jobPostRepository.searchJobPostsWithoutEmploymentType(
                    titlePattern,
                    locationCity,
                    countryCode,
                    request.getMinSalary(),
                    request.getMaxSalary(),
                    request.getFresher(),
                    pageable
            );
        } else {
            // Employment type filter specified
            jobPosts = jobPostRepository.searchJobPostsWithEmploymentType(
                    titlePattern,
                    employmentTypes,
                    locationCity,
                    countryCode,
                    request.getMinSalary(),
                    request.getMaxSalary(),
                    request.getFresher(),
                    pageable
            );
        }

        return jobPosts.map(this::mapToSearchResultDto);
    }

    private JobSearchResultDto mapToSearchResultDto(JobPost jobPost) {
        // Extract employment types
        List<EmploymentType> employmentTypes = jobPost.getEmploymentTypes().stream()
                .map(JobPostEmploymentType::getType)
                .collect(Collectors.toList());

        // Extract skill IDs
        List<UUID> skillIds = jobPost.getSkills().stream()
                .map(JobPostSkill::getSkillId)
                .collect(Collectors.toList());

        // Calculate if job is active
        boolean isActive = jobPost.getExpiryAt() == null ||
                jobPost.getExpiryAt().isAfter(LocalDateTime.now());

        return JobSearchResultDto.builder()
                .id(jobPost.getJobPostId())
                .companyId(jobPost.getCompanyId())
                .title(jobPost.getTitle())
                .description(jobPost.getDescription())
                .locationCity(jobPost.getLocationCity())
                .countryCode(jobPost.getCountryCode())
                .salaryType(jobPost.getSalaryType())
                .salaryMin(jobPost.getSalaryMin())
                .salaryMax(jobPost.getSalaryMax())
                .salaryNote(jobPost.getSalaryNote())
                .employmentTypes(employmentTypes)
                .isFresher(jobPost.isFresher())
                .skillIds(skillIds)
                .postedAt(jobPost.getPostedAt())
                .expiryAt(jobPost.getExpiryAt())
                .isActive(isActive)
                .build();
    }

    private String prepareTitle(String title) {
        if (title == null || title.isBlank()) {
            return null;
        }
        return "%" + title.toLowerCase().trim() + "%";
    }

    private String prepareLocationCity(String locationCity) {
        if (locationCity == null || locationCity.isBlank()) {
            return null;
        }
        return locationCity.toLowerCase().trim();
    }

    private String prepareCountryCode(String countryCode) {
        if (countryCode == null || countryCode.isBlank()) {
            return null;
        }
        return countryCode.toLowerCase().trim();
    }

}
