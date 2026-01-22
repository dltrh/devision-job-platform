package com.devision.job_manager_jobpost.api.external;

import com.devision.job_manager_jobpost.dto.external.*;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;


public interface JobPostExternalApi {
    
    Optional<JobPostBasicInfoDto> getJobPostBasicInfo(UUID id);

    Optional<JobPostStatusDto> getJobPostStatus(UUID id);

    Optional<JobPostSummaryDto> getJobPostSummary(UUID id);

    Optional<Page<JobPostSummaryDto>> getPublishedJobPostsByCompany(UUID companyId, Pageable pageable);

    
    boolean isJobPostPublished(UUID id);

    boolean isJobPostExpired(UUID id);

    long getPublishedJobPostCount(UUID companyId);

    Page<JobSearchResultDto> searchJobPosts(JobSearchRequest request);
}
