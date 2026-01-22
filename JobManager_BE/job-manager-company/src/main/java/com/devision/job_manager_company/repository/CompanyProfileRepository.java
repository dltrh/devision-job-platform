package com.devision.job_manager_company.repository;

import com.devision.job_manager_company.model.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, UUID> {

    // Find profile by company ID
    Optional<CompanyProfile> findByCompanyId(UUID companyId);

    // Check if profile exists for company
    boolean existsByCompanyId(UUID companyId);
}
