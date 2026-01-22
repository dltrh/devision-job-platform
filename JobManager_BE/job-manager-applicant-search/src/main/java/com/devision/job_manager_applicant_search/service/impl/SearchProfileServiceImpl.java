package com.devision.job_manager_applicant_search.service.impl;

import com.devision.job_manager_applicant_search.client.SubscriptionClient;
import com.devision.job_manager_applicant_search.dto.internal.request.CreateSearchProfileRequest;
import com.devision.job_manager_applicant_search.dto.internal.response.SearchProfileResponse;
import com.devision.job_manager_applicant_search.dto.internal.request.UpdateSearchProfileRequest;
import com.devision.job_manager_applicant_search.exception.DuplicateProfileNameException;
import com.devision.job_manager_applicant_search.exception.PremiumRequiredException;
import com.devision.job_manager_applicant_search.exception.SearchProfileNotFoundException;
import com.devision.job_manager_applicant_search.model.ApplicantSearchProfile;
import com.devision.job_manager_applicant_search.model.EmploymentType;
import com.devision.job_manager_applicant_search.repository.ApplicantSearchProfileRepository;
import com.devision.job_manager_applicant_search.service.SearchProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SearchProfileServiceImpl implements SearchProfileService {

    private final ApplicantSearchProfileRepository profileRepository;
    private final SubscriptionClient subscriptionClient;

    /**
     * Creates a new search profile for a company.
     * Requires premium subscription.
     *
     * @param request the create request
     * @return the created profile response
     * @throws PremiumRequiredException if company is not premium
     * @throws DuplicateProfileNameException if profile name already exists for this company
     */
    @Override
    public SearchProfileResponse create(CreateSearchProfileRequest request) {
        // Validate premium status
        validatePremiumStatus(request.getCompanyId());

        // Validate unique profile name
        validateUniqueProfileName(request.getCompanyId(), request.getProfileName(), null);

        ApplicantSearchProfile profile = ApplicantSearchProfile.builder()
                .companyId(request.getCompanyId())
                .profileName(request.getProfileName())
                .countryCode(request.getCountryCode())
                .city(request.getCity())
                .workExperience(request.getWorkExperience())
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .education(request.getEducation())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        // Add skill IDs
        if (request.getSkillIds() != null) {
            for (UUID skillId : request.getSkillIds()) {
                profile.addSkill(skillId);
            }
        }

        // Add employment types
        if (request.getEmploymentTypes() != null) {
            for (EmploymentType type : request.getEmploymentTypes()) {
                profile.addEmploymentType(type);
            }
        }

        profile = profileRepository.save(profile);
        log.info("Created search profile {} for company {}", profile.getId(), request.getCompanyId());

        return SearchProfileResponse.fromEntity(profile);
    }

    /**
     * Gets a search profile by ID.
     *
     * @param id the profile UUID
     * @return the profile response
     * @throws SearchProfileNotFoundException if not found
     */
    @Override
    @Transactional(readOnly = true)
    public SearchProfileResponse getById(UUID id) {
        ApplicantSearchProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new SearchProfileNotFoundException("Search profile not found: " + id));
        return SearchProfileResponse.fromEntity(profile);
    }

    /**
     * Gets all search profiles for a company.
     *
     * @param companyId the company UUID
     * @return list of profile responses
     */
    @Override
    @Transactional(readOnly = true)
    public List<SearchProfileResponse> getByCompanyId(UUID companyId) {
        return profileRepository.findAllByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(SearchProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Gets all active search profiles for a company.
     *
     * @param companyId the company UUID
     * @return list of active profile responses
     */
    @Override
    @Transactional(readOnly = true)
    public List<SearchProfileResponse> getActiveByCompanyId(UUID companyId) {
        return profileRepository.findAllByCompanyIdAndIsActiveOrderByCreatedAtDesc(companyId, true).stream()
                .map(SearchProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing search profile.
     *
     * @param id the profile UUID
     * @param request the update request
     * @return the updated profile response
     * @throws SearchProfileNotFoundException if not found
     * @throws DuplicateProfileNameException if profile name already exists for this company
     */
    @Override
    public SearchProfileResponse update(UUID id, UpdateSearchProfileRequest request) {
        ApplicantSearchProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new SearchProfileNotFoundException("Search profile not found: " + id));

        // Update fields if provided
        if (request.getProfileName() != null) {
            // Validate unique profile name (excluding current profile)
            validateUniqueProfileName(profile.getCompanyId(), request.getProfileName(), id);
            profile.setProfileName(request.getProfileName());
        }
        if (request.getCountryCode() != null) {
            profile.setCountryCode(request.getCountryCode());
        }
        if (request.getMinSalary() != null) {
            profile.setMinSalary(request.getMinSalary());
        }
        if (request.getMaxSalary() != null) {
            profile.setMaxSalary(request.getMaxSalary());
        }
        if (request.getCity() != null) {
            profile.setCity(request.getCity());
        }
        if (request.getWorkExperience() != null) {
            profile.setWorkExperience(request.getWorkExperience());
        }
        if (request.getEducation() != null) {
            profile.setEducation(request.getEducation());
        }
        if (request.getIsActive() != null) {
            // Validate premium when activating
            if (request.getIsActive() && !profile.getIsActive()) {
                validatePremiumStatus(profile.getCompanyId());
            }
            profile.setIsActive(request.getIsActive());
        }

        // Update skills if provided
        if (request.getSkillIds() != null) {
            profile.clearSkills();
            for (UUID skillId : request.getSkillIds()) {
                profile.addSkill(skillId);
            }
        }

        // Update employment types if provided
        if (request.getEmploymentTypes() != null) {
            profile.clearEmploymentTypes();
            for (EmploymentType type : request.getEmploymentTypes()) {
                profile.addEmploymentType(type);
            }
        }

        profile = profileRepository.save(profile);
        log.info("Updated search profile: {}", id);

        return SearchProfileResponse.fromEntity(profile);
    }

    /**
     * Updates the active status of a search profile.
     *
     * @param id the profile UUID
     * @param isActive the new active status
     * @return the updated profile response
     * @throws SearchProfileNotFoundException if not found
     * @throws PremiumRequiredException if activating and company is not premium
     */
    @Override
    public SearchProfileResponse updateStatus(UUID id, Boolean isActive) {
        ApplicantSearchProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new SearchProfileNotFoundException("Search profile not found: " + id));

        // Validate premium when activating
        if (isActive && !profile.getIsActive()) {
            validatePremiumStatus(profile.getCompanyId());
        }

        profile.setIsActive(isActive);
        profile = profileRepository.save(profile);
        log.info("Updated search profile {} status to: {}", id, isActive);

        return SearchProfileResponse.fromEntity(profile);
    }

    /**
     * Deletes a search profile.
     *
     * @param id the profile UUID
     * @throws SearchProfileNotFoundException if not found
     */
    @Override
    public void delete(UUID id) {
        ApplicantSearchProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new SearchProfileNotFoundException("Search profile not found: " + id));

        profileRepository.delete(profile);
        log.info("Deleted search profile: {}", id);
    }

    /**
     * Gets all active search profiles (for external API).
     *
     * @return list of all active profiles
     */
    @Override
    @Transactional(readOnly = true)
    public List<ApplicantSearchProfile> getAllActive() {
        return profileRepository.findAllByIsActiveTrue();
    }

    /**
     * Gets all active search profiles for premium companies.
     *
     * @param premiumCompanyIds list of premium company UUIDs
     * @return list of active profiles for premium companies
     */
    @Override
    @Transactional(readOnly = true)
    public List<ApplicantSearchProfile> getActiveForPremiumCompanies(List<UUID> premiumCompanyIds) {
        if (premiumCompanyIds == null || premiumCompanyIds.isEmpty()) {
            return List.of();
        }
        return profileRepository.findAllActiveByCompanyIds(premiumCompanyIds);
    }

    /**
     * Validates that a company has premium status.
     *
     * @param companyId the company UUID
     * @throws PremiumRequiredException if company is not premium
     */
    private void validatePremiumStatus(UUID companyId) {
        if (!subscriptionClient.isPremium(companyId)) {
            log.warn("Premium validation failed for company: {}", companyId);
            throw new PremiumRequiredException(
                    "Premium subscription required to manage search profiles. Company: " + companyId);
        }
    }

    /**
     * Validates that the profile name is unique for the company.
     * @param companyId the company UUID
     * @param profileName the profile name to check
     * @param excludeId profile ID to exclude (for updates), or null for create
     */
    private void validateUniqueProfileName(UUID companyId, String profileName, UUID excludeId) {
        boolean exists;
        if (excludeId == null) {
            exists = profileRepository.existsByCompanyIdAndProfileName(companyId, profileName);
        } else {
            exists = profileRepository.existsByCompanyIdAndProfileNameAndIdNot(companyId, profileName, excludeId);
        }
        if (exists) {
            throw new DuplicateProfileNameException("A profile with this name already exists for your company.");
        }
    }
}
