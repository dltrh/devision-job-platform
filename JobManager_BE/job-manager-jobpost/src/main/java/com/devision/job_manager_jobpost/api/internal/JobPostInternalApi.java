package com.devision.job_manager_jobpost.api.internal;

import com.devision.job_manager_jobpost.dto.JobPostDto;

import java.util.Optional;


public interface JobPostInternalApi {

    JobPostDto createJobPost(JobPostDto jobPostDto);

    Optional<JobPostDto> getJobPostById(Long id);

    JobPostDto updateJobPost(Long id, JobPostDto jobPostDto);

    JobPostDto publishJobPost(Long id);

    
}