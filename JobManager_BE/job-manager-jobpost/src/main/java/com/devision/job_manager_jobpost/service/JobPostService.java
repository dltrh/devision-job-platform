package com.devision.job_manager_jobpost.service;

import com.devision.job_manager_jobpost.model.JobPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobPostService {

    JobPost createJobPost(JobPost jobPost);

    Optional<JobPost> getJobPostById(UUID id);

    Page<JobPost> getCompanyJobPosts(UUID companyId, Pageable pageable);

    Page<JobPost> getPublishedCompanyJobPosts(UUID companyId, Pageable pageable);

    Page<JobPost> getPublishedJobPosts(Pageable pageable);

    Page<JobPost> getAllJobPosts(Pageable pageable);

    JobPost updateJobPost(UUID id, JobPost updatedJobPost);

    JobPost publishJobPost(UUID id);

    JobPost unpublishJobPost(UUID id);

    void deleteJobPost(UUID id);

    /**
     * Update job post skills and publish Kafka event for Ultimo 4.3.1
     * @param jobPostId The job post ID
     * @param newSkillIds The new list of skill IDs
     * @return Updated job post
     */
    JobPost updateJobPostSkills(UUID jobPostId, List<UUID> newSkillIds);
}


