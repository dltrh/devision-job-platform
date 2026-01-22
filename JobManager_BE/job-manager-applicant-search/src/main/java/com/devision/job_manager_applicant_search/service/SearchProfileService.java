package com.devision.job_manager_applicant_search.service;

import com.devision.job_manager_applicant_search.dto.internal.request.CreateSearchProfileRequest;
import com.devision.job_manager_applicant_search.dto.internal.response.SearchProfileResponse;
import com.devision.job_manager_applicant_search.dto.internal.request.UpdateSearchProfileRequest;
import com.devision.job_manager_applicant_search.model.ApplicantSearchProfile;

import java.util.List;
import java.util.UUID;

public interface SearchProfileService {

    /**
     * Creates a new search profile for a company.
     * Requires premium subscription.
     *
     * @param request the create request
     * @return the created profile response
     */
    SearchProfileResponse create(CreateSearchProfileRequest request);

    /**
     * Gets a search profile by ID.
     *
     * @param id the profile UUID
     * @return the profile response
     */
    SearchProfileResponse getById(UUID id);

    /**
     * Gets all search profiles for a company.
     *
     * @param companyId the company UUID
     * @return list of profile responses
     */
    List<SearchProfileResponse> getByCompanyId(UUID companyId);

    /**
     * Gets all active search profiles for a company.
     *
     * @param companyId the company UUID
     * @return list of active profile responses
     */
    List<SearchProfileResponse> getActiveByCompanyId(UUID companyId);

    /**
     * Updates an existing search profile.
     *
     * @param id the profile UUID
     * @param request the update request
     * @return the updated profile response
     */
    SearchProfileResponse update(UUID id, UpdateSearchProfileRequest request);

    /**
     * Updates the active status of a search profile.
     *
     * @param id the profile UUID
     * @param isActive the new active status
     * @return the updated profile response
     */
    SearchProfileResponse updateStatus(UUID id, Boolean isActive);

    /**
     * Deletes a search profile.
     *
     * @param id the profile UUID
     */
    void delete(UUID id);

    /**
     * Gets all active search profiles (for external API).
     *
     * @return list of all active profiles
     */
    List<ApplicantSearchProfile> getAllActive();

    /**
     * Gets all active search profiles for premium companies.
     *
     * @param premiumCompanyIds list of premium company UUIDs
     * @return list of active profiles for premium companies
     */
    List<ApplicantSearchProfile> getActiveForPremiumCompanies(List<UUID> premiumCompanyIds);
}
