package com.devision.job_manager_jobpost.repository;

import com.devision.job_manager_jobpost.model.EmploymentType;
import com.devision.job_manager_jobpost.model.JobPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, UUID> {

    Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable);

    List<JobPost> findByCompanyId(UUID companyId);

    Page<JobPost> findByPublishedTrue(Pageable pageable);

    Page<JobPost> findByPublishedTrueAndCompanyId(UUID companyId, Pageable pageable);

    Page<JobPost> findByPublishedTrueAndExpiryAtAfter(LocalDateTime now, Pageable pageable);

    long countByPublishedTrueAndCompanyId(UUID companyId);

    /**
     * Search job posts WITHOUT employment type filter
     * Used when employmentTypes parameter is null
     */
    @Query("SELECT DISTINCT j FROM JobPost j " +
            "LEFT JOIN FETCH j.skills s " +
            "WHERE j.published = true " +
            "AND j.aPrivate = false " +
            "AND (:title IS NULL OR LOWER(j.title) LIKE :title) " +
            "AND (:locationCity IS NULL OR LOWER(j.locationCity) = :locationCity) " +
            "AND (:countryCode IS NULL OR LOWER(j.countryCode) = :countryCode) " +
            "AND (:minSalary IS NULL OR j.salaryMin >= :minSalary OR j.salaryMax >= :minSalary OR j.salaryType = 'NEGOTIABLE') " +
            "AND (:maxSalary IS NULL OR j.salaryMax <= :maxSalary OR j.salaryType = 'NEGOTIABLE') " +
            "AND (:fresher IS NULL OR j.fresher = :fresher) " +
            "AND (j.expiryAt IS NULL OR j.expiryAt > CURRENT_TIMESTAMP)")
    Page<JobPost> searchJobPostsWithoutEmploymentType(
            @Param("title") String title,
            @Param("locationCity") String locationCity,
            @Param("countryCode") String countryCode,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            @Param("fresher") Boolean fresher,
            Pageable pageable
    );

    /**
     * Search job posts WITH employment type filter
     * Used when employmentTypes parameter is provided
     */
    @Query("SELECT DISTINCT j FROM JobPost j " +
            "JOIN j.employmentTypes et " +
            "LEFT JOIN FETCH j.skills s " +
            "WHERE j.published = true " +
            "AND j.aPrivate = false " +
            "AND et.type IN :employmentTypes " +
            "AND (:title IS NULL OR LOWER(j.title) LIKE :title) " +
            "AND (:locationCity IS NULL OR LOWER(j.locationCity) = :locationCity) " +
            "AND (:countryCode IS NULL OR LOWER(j.countryCode) = :countryCode) " +
            "AND (:minSalary IS NULL OR j.salaryMin >= :minSalary OR j.salaryMax >= :minSalary OR j.salaryType = 'NEGOTIABLE') " +
            "AND (:maxSalary IS NULL OR j.salaryMax <= :maxSalary OR j.salaryType = 'NEGOTIABLE') " +
            "AND (:fresher IS NULL OR j.fresher = :fresher) " +
            "AND (j.expiryAt IS NULL OR j.expiryAt > CURRENT_TIMESTAMP)")
    Page<JobPost> searchJobPostsWithEmploymentType(
            @Param("title") String title,
            @Param("employmentTypes") List<EmploymentType> employmentTypes,
            @Param("locationCity") String locationCity,
            @Param("countryCode") String countryCode,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            @Param("fresher") Boolean fresher,
            Pageable pageable
    );
}
