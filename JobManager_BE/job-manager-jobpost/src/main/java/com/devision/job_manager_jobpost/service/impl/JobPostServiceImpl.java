package com.devision.job_manager_jobpost.service.impl;

import com.devision.job_manager_jobpost.client.CompanyServiceClient;
import com.devision.job_manager_jobpost.event.JobPostCountryChangedEvent;
import com.devision.job_manager_jobpost.event.JobPostPublishedEvent;
import com.devision.job_manager_jobpost.event.JobPostSkillsChangedEvent;
import com.devision.job_manager_jobpost.event.JobPostUpdatedEvent;
import com.devision.job_manager_jobpost.model.EmploymentType;
import com.devision.job_manager_jobpost.model.JobPost;
import com.devision.job_manager_jobpost.model.JobPostEmploymentType;
import com.devision.job_manager_jobpost.model.JobPostSkill;
import com.devision.job_manager_jobpost.repository.JobPostRepository;
import com.devision.job_manager_jobpost.service.JobPostService;
import com.devision.job_manager_jobpost.service.internal.EventPublisherService;
import feign.FeignException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobPostServiceImpl implements JobPostService {

    private final JobPostRepository jobPostRepository;
    private final EventPublisherService eventPublisher;
    private final CompanyServiceClient companyServiceClient;

    @Override
    @Transactional
    public JobPost createJobPost(JobPost jobPost) {
        log.info("Creating job post for company: {}", jobPost.getCompanyId());

        // Set initial state
        jobPost.setPublished(false);

        // Save to database
        JobPost saved = jobPostRepository.save(jobPost);

        log.info("Job post created with ID: {} for location: {}, {}",
                saved.getJobPostId(), saved.getLocationCity(), saved.getCountryCode());
        return saved;
    }

    @Override
    public Optional<JobPost> getJobPostById(UUID id) {
        return jobPostRepository.findById(id);
    }

    @Override
    public Page<JobPost> getCompanyJobPosts(UUID companyId, Pageable pageable) {
        return jobPostRepository.findByCompanyId(companyId, pageable);
    }

    @Override
    public Page<JobPost> getPublishedCompanyJobPosts(UUID companyId, Pageable pageable) {
        return jobPostRepository.findByPublishedTrueAndCompanyId(companyId, pageable);
    }

    @Override
    public Page<JobPost> getPublishedJobPosts(Pageable pageable) {
        return jobPostRepository.findByPublishedTrueAndExpiryAtAfter(LocalDateTime.now(), pageable);
    }

    @Override
    public Page<JobPost> getAllJobPosts(Pageable pageable) {
        return jobPostRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public JobPost updateJobPost(UUID id, JobPost updatedJobPost) {
        log.info("Updating job post: {}", id);
        JobPost existing = jobPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job post not found with ID: " + id));

        // Remember the old country before update
        String oldCountryCode = existing.getCountryCode();

        // Update fields
        existing.setTitle(updatedJobPost.getTitle());
        existing.setDescription(updatedJobPost.getDescription());
        existing.setSalaryType(updatedJobPost.getSalaryType());
        existing.setSalaryMin(updatedJobPost.getSalaryMin());
        existing.setSalaryMax(updatedJobPost.getSalaryMax());
        existing.setSalaryNote(updatedJobPost.getSalaryNote());
        existing.setLocationCity(updatedJobPost.getLocationCity());
        existing.setCountryCode(updatedJobPost.getCountryCode()); // From request, not Company service
        existing.setFresher(updatedJobPost.isFresher());
        existing.setAPrivate(updatedJobPost.isAPrivate());
        existing.setExpiryAt(updatedJobPost.getExpiryAt());


        JobPost saved = jobPostRepository.save(existing);

        // Publish country change to Kafka
        String newCountryCode = saved.getCountryCode();
        if (oldCountryCode != null && newCountryCode != null
        && !oldCountryCode.equalsIgnoreCase(newCountryCode)) {
            log.info("Job post country changed from {} to {}. Publishing event...",
                    oldCountryCode, newCountryCode);

            // Extract current skills for applicant matching
            List<UUID> currentSkills = saved.getSkills().stream()
                    .map(JobPostSkill::getSkillId)
                    .toList();

            JobPostCountryChangedEvent event = JobPostCountryChangedEvent.builder()
                    .jobPostId(saved.getJobPostId())
                    .companyId(saved.getCompanyId())
                    .title(saved.getTitle())
                    .locationCity(saved.getLocationCity())
                    .previousCountryCode(oldCountryCode)
                    .newCountryCode(newCountryCode)
                    .currentSkills(currentSkills)
                    .changedAt(LocalDateTime.now())
                    .build();

            eventPublisher.publishJobPostCountryChanged(event);
        }

        // Publish general update event to Kafka
        log.info("Publishing general update event for job post ID: {}", id);
        JobPostUpdatedEvent updateEvent = JobPostUpdatedEvent.builder()
                .jobPostId(saved.getJobPostId())
                .companyId(saved.getCompanyId())
                .title(saved.getTitle())
                .location(saved.getLocationCity())
                .updatedAt(LocalDateTime.now())
                .build();

        eventPublisher.publishJobPostUpdated(updateEvent);

        log.info("Job post updated: {} with location: {}, {}",
                id, saved.getLocationCity(), saved.getCountryCode());
        return saved;
    }

    @Override
    @Transactional
    public JobPost publishJobPost(UUID id) {
        log.info("Publishing job post with ID: {}", id);

        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job post not found with ID: " + id));

        // Check if already published
        if (jobPost.isPublished()) {
            log.warn("Job post {} is already published", id);
            return jobPost;
        }

        // Publish the job post
        jobPost.setPublished(true);
        jobPost.setPostedAt(LocalDateTime.now());

        JobPost savedJobPost = jobPostRepository.save(jobPost);

        // Publish Kafka event AFTER db commit
        log.info("Publishing Kafka event for newly published job post ID: {}", id);

        // Extract employment types
        List<EmploymentType> employmentTypes = savedJobPost.getEmploymentTypes().stream()
                .map(JobPostEmploymentType::getType)
                .toList();

        // Extract skill IDs
        List<UUID> skillIds = savedJobPost.getSkills().stream()
                .map(JobPostSkill::getSkillId)
                .toList();

        // Build and publish event
        JobPostPublishedEvent event = JobPostPublishedEvent.builder()
                .jobPostId(savedJobPost.getJobPostId())
                .companyId(savedJobPost.getCompanyId())
                .title(savedJobPost.getTitle())
                .description(savedJobPost.getDescription())
                .locationCity(savedJobPost.getLocationCity())
                .countryCode(savedJobPost.getCountryCode())
                .salaryType(savedJobPost.getSalaryType())
                .salaryMin(savedJobPost.getSalaryMin())
                .salaryMax(savedJobPost.getSalaryMax())
                .employmentTypes(employmentTypes)
                .fresher(savedJobPost.isFresher())
                .skillIds(skillIds)
                .publishedAt(savedJobPost.getPostedAt())
                .expiryAt(savedJobPost.getExpiryAt())
                .build();

        eventPublisher.publishJobPostPublished(event);

        log.info("Job post published successfully: {} with {} skills in country: {}",
                id, skillIds.size(), savedJobPost.getCountryCode());

        return jobPostRepository.save(jobPost);
    }

    @Override
    @Transactional
    public JobPost unpublishJobPost(UUID id) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job post not found with ID: " + id));

        jobPost.setPublished(false);

        return jobPostRepository.save(jobPost);
    }

    @Override
    @Transactional
    public void deleteJobPost(UUID id) {
        if (!jobPostRepository.existsById(id)) {
            throw new IllegalArgumentException("Job post not found with ID: " + id);
        }
        jobPostRepository.deleteById(id);
    }

    /**
     * Update job post skills and publish Kafka event for Ultimo 4.3.1
     * CRITICAL: This enables instant notifications to matching applicants
     */
    @Override
    @Transactional
    public JobPost updateJobPostSkills(UUID jobPostId, List<UUID> newSkillIds) {
        log.info("Updating skills for job post ID: {}", jobPostId);

        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new IllegalArgumentException("Job post not found with ID: " + jobPostId));

        // Get current skills before update
        List<UUID> currentSkillIds = jobPost.getSkills().stream()
                .map(JobPostSkill::getSkillId)
                .toList();

        // Calculate what changed
        List<UUID> addedSkills = newSkillIds.stream()
                .filter(skillId -> !currentSkillIds.contains(skillId))
                .toList();

        List<UUID> removedSkills = currentSkillIds.stream()
                .filter(skillId -> !newSkillIds.contains(skillId))
                .toList();

        // Update the database
        jobPost.getSkills().clear();
        newSkillIds.forEach(skillId -> {
            JobPostSkill jobPostSkill = new JobPostSkill();
            jobPostSkill.setId(UUID.randomUUID());
            jobPostSkill.setJobPost(jobPost);
            jobPostSkill.setSkillId(skillId);
            jobPost.getSkills().add(jobPostSkill);
        });

        JobPost savedJobPost = jobPostRepository.save(jobPost);

        // CRITICAL: Publish Kafka event AFTER database commit for Ultimo 4.3.1
        if (!addedSkills.isEmpty() || !removedSkills.isEmpty()) {
            log.info("Publishing skills changed event. Added: {}, Removed: {}",
                    addedSkills.size(), removedSkills.size());

            // Extract employment types (same as JobPostPublished event)
            List<EmploymentType> employmentTypes = savedJobPost.getEmploymentTypes().stream()
                    .map(JobPostEmploymentType::getType)
                    .toList();

            // Build comprehensive event matching JobPostPublishedEvent structure
            JobPostSkillsChangedEvent event = JobPostSkillsChangedEvent.builder()
                    // Core identifiers
                    .jobPostId(savedJobPost.getJobPostId())
                    .companyId(savedJobPost.getCompanyId())
                    .title(savedJobPost.getTitle())
                    .description(savedJobPost.getDescription())
                    .locationCity(savedJobPost.getLocationCity())
                    .countryCode(savedJobPost.getCountryCode())
                    // Salary information
                    .salaryType(savedJobPost.getSalaryType())
                    .salaryMin(savedJobPost.getSalaryMin())
                    .salaryMax(savedJobPost.getSalaryMax())
                    // Job type and status
                    .employmentTypes(employmentTypes)
                    .fresher(savedJobPost.isFresher())
                    // Publishing timestamps
                    .publishedAt(savedJobPost.getPostedAt())
                    .expiryAt(savedJobPost.getExpiryAt())
                    // Skill change tracking
                    .addedSkills(addedSkills)
                    .removedSkills(removedSkills)
                    .currentSkills(newSkillIds)
                    .changedAt(LocalDateTime.now())
                    .build();

            eventPublisher.publishJobPostSkillsChanged(event);
        } else {
            log.info("No skills changed for job post ID: {}", jobPostId);
        }

        return savedJobPost;
    }

    /**
     * Get company country code with caching (Ultimo 4.3.1 requirement).
     * Cached for 1 hour to minimize calls to Company service.
     *
     * @param companyId The company UUID
     * @return Country code (e.g., "VN", "AUS", "USA") or null if not found/unavailable
     */
    @Cacheable(value = "companyCountry", key = "#companyId")
    public String getCompanyCountry(UUID companyId) {
        try {
            log.debug("Fetching country code for company ID: {} from Company service", companyId);
            String countryCode = companyServiceClient.getCompanyCountry(companyId);
            log.debug("Retrieved country code: {} for company ID: {}", countryCode, companyId);
            return countryCode;
        } catch (FeignException.NotFound e) {
            log.warn("Company not found: {}", companyId);
            return null;
        } catch (Exception e) {
            log.error("Failed to fetch country for company {}: {}", companyId, e.getMessage());
            return null; // Graceful degradation
        }
    }
}


