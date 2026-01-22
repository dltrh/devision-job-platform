package com.devision.job_manager_company.repository;

import com.devision.job_manager_company.model.CompanyMedia;
import com.devision.job_manager_company.model.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyMediaRepository extends JpaRepository<CompanyMedia, UUID> {

    // Find all media for a company (non-paginated, for reordering)
    List<CompanyMedia> findByCompanyIdOrderByDisplayOrderAsc(UUID companyId);

    // Find all media for a company with pagination
    Page<CompanyMedia> findByCompanyId(UUID companyId, Pageable pageable);

    // Find media by company and type (non-paginated)
    List<CompanyMedia> findByCompanyIdAndTypeOrderByDisplayOrderAsc(UUID companyId, MediaType type);

    // Find media by company and type with pagination
    Page<CompanyMedia> findByCompanyIdAndType(UUID companyId, MediaType type, Pageable pageable);

    // Delete all media for a company
    void deleteByCompanyId(UUID companyId);

    // Count media for a company
    long countByCompanyId(UUID companyId);

    // Find media by ID and company ID (for validation)
    @Query("SELECT m FROM CompanyMedia m WHERE m.id = :mediaId AND m.company.id = :companyId")
    Optional<CompanyMedia> findByIdAndCompanyId(@Param("mediaId") UUID mediaId, @Param("companyId") UUID companyId);

    // Find all media IDs for a company (for bulk reorder validation)
    @Query("SELECT m.id FROM CompanyMedia m WHERE m.company.id = :companyId ORDER BY m.displayOrder ASC")
    List<UUID> findIdsByCompanyId(@Param("companyId") UUID companyId);

    // Update display order for a specific media
    @Modifying
    @Query("UPDATE CompanyMedia m SET m.displayOrder = :displayOrder WHERE m.company.id = :companyId AND m.id = :mediaId")
    void updateDisplayOrder(@Param("companyId") UUID companyId, @Param("mediaId") UUID mediaId, @Param("displayOrder") int displayOrder);
}
