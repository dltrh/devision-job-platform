package com.devision.job_manager_applicant_search.repository;

import com.devision.job_manager_applicant_search.model.ApplicantSearchProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicantSearchProfileRepository extends JpaRepository<ApplicantSearchProfile, UUID> {

    // Find all search profiles for a company
    List<ApplicantSearchProfile> findAllByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    // Find all active search profiles for a company
    List<ApplicantSearchProfile> findAllByCompanyIdAndIsActiveOrderByCreatedAtDesc(UUID companyId, Boolean isActive);

    /**
     * Find all active search profiles across all companies.
     * Used for batch matching when an applicant updates their profile.
     */
    List<ApplicantSearchProfile> findAllByIsActiveTrue();

    /**
     * Find all active search profiles for a list of premium companies.
     * Used for matching only with companies that have active subscriptions.
     */
    @Query("SELECT p FROM ApplicantSearchProfile p WHERE p.isActive = true AND p.companyId IN :companyIds")
    List<ApplicantSearchProfile> findAllActiveByCompanyIds(@Param("companyIds") List<UUID> companyIds);

    // Count profiles for a company
    long countByCompanyId(UUID companyId);

    // Check if a company has any profiles
    boolean existsByCompanyId(UUID companyId);

    // Check if a profile with the same name exists for a company
    boolean existsByCompanyIdAndProfileName(UUID companyId, String profileName);

    // Check if a profile with the same name exists for a company, excluding a specific profile (for updates)
    boolean existsByCompanyIdAndProfileNameAndIdNot(UUID companyId, String profileName, UUID id);
}
