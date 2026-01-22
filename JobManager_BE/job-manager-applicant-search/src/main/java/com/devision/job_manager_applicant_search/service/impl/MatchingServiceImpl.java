package com.devision.job_manager_applicant_search.service.impl;

import com.devision.job_manager_applicant_search.client.SubscriptionClient;
import com.devision.job_manager_applicant_search.event.ApplicantProfileUpdatedEvent;
import com.devision.job_manager_applicant_search.event.CompanyNotificationEvent;
import com.devision.job_manager_applicant_search.kafka.NotificationEventProducer;
import com.devision.job_manager_applicant_search.model.ApplicantSearchProfile;
import com.devision.job_manager_applicant_search.model.EducationDegree;
import com.devision.job_manager_applicant_search.model.EmploymentType;
import com.devision.job_manager_applicant_search.repository.ApplicantSearchProfileRepository;
import com.devision.job_manager_applicant_search.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for matching applicants with saved search profiles.
 * TODO: Applicant Data Dependency
 * 
 * Implements the matching algorithm:
 * - Rule-based, deterministic filtering
 * - Country, salary, employment type, education degree, and skill matching
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MatchingServiceImpl implements MatchingService {

    private final ApplicantSearchProfileRepository profileRepository;
    private final SubscriptionClient subscriptionClient;
    private final NotificationEventProducer notificationProducer;

    /**
     * Processes an applicant profile update and finds matching search profiles.
     * Sends notifications to companies with matching active profiles.
     *
     * @param event the applicant profile updated event
     */
    @Override
    public void processApplicantUpdate(ApplicantProfileUpdatedEvent event) {
        log.info("Processing applicant update for: {}", event.getApplicantId());

        // Get all active search profiles
        List<ApplicantSearchProfile> activeProfiles = profileRepository.findAllByIsActiveTrue();
        
        if (activeProfiles.isEmpty()) {
            log.debug("No active search profiles found");
            return;
        }

        // Filter profiles by premium companies and match criteria
        List<ApplicantSearchProfile> matchingProfiles = activeProfiles.stream()
                .filter(profile -> subscriptionClient.isPremium(profile.getCompanyId()))
                .filter(profile -> matches(profile, event))
                .collect(Collectors.toList());

        log.info("Found {} matching profiles for applicant: {}", 
                matchingProfiles.size(), event.getApplicantId());

        // Send notifications for each match
        for (ApplicantSearchProfile profile : matchingProfiles) {
            sendMatchNotification(profile, event.getApplicantId());
        }
    }

    /**
     * Finds all search profiles that match the given applicant criteria.
     * Used for manual search API.
     *
     * @param event the applicant data (can be used as search criteria)
     * @return list of matching profile IDs
     */
    @Override
    public List<UUID> findMatchingProfiles(ApplicantProfileUpdatedEvent event) {
        List<ApplicantSearchProfile> activeProfiles = profileRepository.findAllByIsActiveTrue();
        
        return activeProfiles.stream()
                .filter(profile -> subscriptionClient.isPremium(profile.getCompanyId()))
                .filter(profile -> matches(profile, event))
                .map(ApplicantSearchProfile::getId)
                .collect(Collectors.toList());
    }

    /**
     * Checks if an applicant matches a search profile using the matching algorithm.
     *
     * Matching rules:
     * 1. Country filter - exact match or profile has no country specified
     * 2. Salary filter - applicant salary within profile's min/max range
     * 3. Employment type filter - at least one type intersects (OR semantics)
     * 4. Education degree filter - applicant degree >= profile requirement
     * 5. Skill matching - at least one skill intersects (OR semantics)
     *
     * @param profile the search profile
     * @param applicant the applicant data
     * @return true if the applicant matches the profile
     */
    @Override
    public boolean matches(ApplicantSearchProfile profile, ApplicantProfileUpdatedEvent applicant) {
        // 1. Country filter
        if (!matchesCountry(profile, applicant)) {
            return false;
        }

        // 2. Salary filter
        if (!matchesSalary(profile, applicant)) {
            return false;
        }

        // 3. Employment type filter
        if (!matchesEmploymentTypes(profile, applicant)) {
            return false;
        }

        // 4. Education degree filter
        if (!matchesEducation(profile, applicant)) {
            return false;
        }

        // 5. Skill matching
        if (!matchesSkills(profile, applicant)) {
            return false;
        }

        return true;
    }

    /**
     * Country filter: If profile.countryCode is not null, applicant country must match.
     */
    private boolean matchesCountry(ApplicantSearchProfile profile, ApplicantProfileUpdatedEvent applicant) {
        if (profile.getCountryCode() == null || profile.getCountryCode().isEmpty()) {
            return true; // No country requirement
        }
        if (applicant.getCountryCode() == null || applicant.getCountryCode().isEmpty()) {
            return false; // Profile requires country but applicant has none
        }
        return profile.getCountryCode().equalsIgnoreCase(applicant.getCountryCode());
    }

    /**
     * Salary filter - compares salary ranges.
     * 
     * Profile has (minSalary, maxSalary) - the range the company is willing to pay.
     * Applicant has (minSalary, maxSalary) - the range the applicant expects.
     * 
     * Match condition: The ranges must overlap.
     * - If profile.maxSalary < applicant.minSalary → reject (company can't afford applicant)
     * - If profile.minSalary > applicant.maxSalary → reject (applicant expects more)
     */
    private boolean matchesSalary(ApplicantSearchProfile profile, ApplicantProfileUpdatedEvent applicant) {
        BigDecimal profileMin = profile.getMinSalary();
        BigDecimal profileMax = profile.getMaxSalary();
        BigDecimal applicantMin = applicant.getMinSalary();
        BigDecimal applicantMax = applicant.getMaxSalary();

        // If profile has no salary requirements, match
        if (profileMin == null && profileMax == null) {
            return true;
        }

        // If applicant has no salary expectations, match if profile has no strict requirements
        if (applicantMin == null && applicantMax == null) {
            return true; // Flexible applicant matches any range
        }

        // Check for range overlap
        // Profile's max must be >= applicant's min (if both exist)
        if (profileMax != null && applicantMin != null && profileMax.compareTo(applicantMin) < 0) {
            return false; // Company's max is below applicant's minimum expectation
        }

        // Profile's min must be <= applicant's max (if both exist)
        if (profileMin != null && applicantMax != null && profileMin.compareTo(applicantMax) > 0) {
            return false; // Company's min is above applicant's maximum expectation
        }

        return true;
    }

    /**
     * Employment type filter:
     * At least one applicant employment type must intersect with profile employment types.
     */
    private boolean matchesEmploymentTypes(ApplicantSearchProfile profile, ApplicantProfileUpdatedEvent applicant) {
        Set<EmploymentType> profileTypes = profile.getEmploymentTypeValues();
        Set<EmploymentType> applicantTypes = applicant.getEmploymentTypes();

        // If profile has no employment type requirements, match
        if (profileTypes == null || profileTypes.isEmpty()) {
            return true;
        }

        // If applicant has no employment types, no match
        if (applicantTypes == null || applicantTypes.isEmpty()) {
            return false;
        }

        // Check for intersection (OR semantics)
        return profileTypes.stream().anyMatch(applicantTypes::contains);
    }

    /**
     * Education degree filter:
     * Applicant degree must be equal to or higher than profile requirement.
     */
    private boolean matchesEducation(ApplicantSearchProfile profile, ApplicantProfileUpdatedEvent applicant) {
        EducationDegree requiredDegree = profile.getEducation();
        EducationDegree applicantDegree = applicant.getHighestDegree();

        // If no degree requirement, match
        if (requiredDegree == null) {
            return true;
        }

        // If profile requires degree but applicant has none, no match
        if (applicantDegree == null) {
            return false;
        }

        // Use degree hierarchy comparison
        return applicantDegree.meetsRequirement(requiredDegree);
    }

    /**
     * Skill matching:
     * At least one skill must intersect (OR semantics).
     */
    private boolean matchesSkills(ApplicantSearchProfile profile, ApplicantProfileUpdatedEvent applicant) {
        Set<UUID> profileSkills = profile.getSkillIds();
        Set<UUID> applicantSkills = applicant.getSkillIds();

        // If profile has no skill requirements, match
        if (profileSkills == null || profileSkills.isEmpty()) {
            return true;
        }

        // If applicant has no skills, no match
        if (applicantSkills == null || applicantSkills.isEmpty()) {
            return false;
        }

        // Check for intersection (OR semantics)
        return profileSkills.stream().anyMatch(applicantSkills::contains);
    }

    /**
     * Sends a notification to a company about an applicant match.
     */
    private void sendMatchNotification(ApplicantSearchProfile profile, UUID applicantId) {
        CompanyNotificationEvent event = CompanyNotificationEvent.applicantMatch(
                profile.getCompanyId(),
                applicantId,
                profile.getId(),
                profile.getProfileName()
        );
        notificationProducer.publishNotification(event);
        log.debug("Sent match notification to company {} for profile {}", 
                profile.getCompanyId(), profile.getId());
    }
}
