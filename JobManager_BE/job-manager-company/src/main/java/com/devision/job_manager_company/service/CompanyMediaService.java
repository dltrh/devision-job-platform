package com.devision.job_manager_company.service;

import com.devision.job_manager_company.model.CompanyMedia;
import com.devision.job_manager_company.model.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface CompanyMediaService {

    CompanyMedia uploadLogo(UUID companyId, MultipartFile file) throws IOException;

    CompanyMedia uploadBanner(UUID companyId, MultipartFile file) throws IOException;

    CompanyMedia uploadMedia(UUID companyId, MediaType type, MultipartFile file, String title, String description) throws IOException;

    List<CompanyMedia> getCompanyMedia(UUID companyId);

    Page<CompanyMedia> getCompanyMediaPaginated(UUID companyId, Pageable pageable);

    List<CompanyMedia> getCompanyMediaByType(UUID companyId, MediaType type);

    Page<CompanyMedia> getCompanyMediaByTypePaginated(UUID companyId, MediaType type, Pageable pageable);

    void deleteMedia(UUID mediaId);

    void updateDisplayOrder(UUID companyId, UUID mediaId, Integer displayOrder);

    void reorderMedia(UUID companyId, List<UUID> orderedMediaIds);
}
