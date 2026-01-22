package com.devision.job_manager_company.repository;

import com.devision.job_manager_company.model.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    // Find companies by country
    List<Company> findByCountryCode(String countryCode);

    Page<Company> findByCountryCode(String countryCode, Pageable pageable);

    // Find companies by city
    List<Company> findByCity(String city);

    // Search companies by name (case-insensitive)
    @Query("SELECT c FROM Company c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Company> searchByName(@Param("name") String name);

    @Query("SELECT c FROM Company c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Company> searchByName(@Param("name") String name, Pageable pageable);

    // Find company with profile eagerly loaded
    @Query("SELECT c FROM Company c LEFT JOIN FETCH c.profile WHERE c.id = :id")
    Optional<Company> findByIdWithProfile(@Param("id") UUID id);

    // Find all companies with profile (for list view)
    @Query(value = "SELECT c FROM Company c LEFT JOIN FETCH c.profile",
           countQuery = "SELECT COUNT(c) FROM Company c")
    Page<Company> findAllWithProfile(Pageable pageable);

    // Check if company exists by ID
    boolean existsById(UUID id);
}
