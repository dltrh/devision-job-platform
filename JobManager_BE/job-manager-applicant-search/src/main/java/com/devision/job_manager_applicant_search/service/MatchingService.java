package com.devision.job_manager_applicant_search.service;

import com.devision.job_manager_applicant_search.event.ApplicantProfileUpdatedEvent;
import com.devision.job_manager_applicant_search.model.ApplicantSearchProfile;

import java.util.List;
import java.util.UUID;

// TODO: Applicant Data Dependency
public interface MatchingService {

    /**
     * Processes an applicant profile update and finds matching search profiles.
     * Sends notifications to companies with matching active profiles.
     *
     * @param event the applicant profile updated event
     */
    void processApplicantUpdate(ApplicantProfileUpdatedEvent event);

    /**
     * Finds all search profiles that match the given applicant criteria.
     * Used for manual search API.
     *
     * @param event the applicant data (can be used as search criteria)
     * @return list of matching profile IDs
     */
    List<UUID> findMatchingProfiles(ApplicantProfileUpdatedEvent event);

    /**
     * Checks if an applicant matches a search profile using the matching algorithm.
     *
     * @param profile the search profile
     * @param applicant the applicant data
     * @return true if the applicant matches the profile
     */
    boolean matches(ApplicantSearchProfile profile, ApplicantProfileUpdatedEvent applicant);
}
