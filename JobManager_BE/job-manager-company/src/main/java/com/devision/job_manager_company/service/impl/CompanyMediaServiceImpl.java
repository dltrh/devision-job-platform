package com.devision.job_manager_company.service.impl;

import com.devision.job_manager_company.model.Company;
import com.devision.job_manager_company.model.CompanyMedia;
import com.devision.job_manager_company.model.MediaType;
import com.devision.job_manager_company.repository.CompanyMediaRepository;
import com.devision.job_manager_company.repository.CompanyRepository;
import com.devision.job_manager_company.service.CompanyMediaService;
import com.devision.job_manager_company.service.CompanyService;
import com.devision.job_manager_company.service.MediaStorageService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class CompanyMediaServiceImpl implements CompanyMediaService {

    private final CompanyMediaRepository companyMediaRepository;
    private final CompanyRepository companyRepository;
    private final CompanyService companyService;
    private final Optional<MediaStorageService> mediaStorageService;

    public CompanyMediaServiceImpl(
            CompanyMediaRepository companyMediaRepository,
            CompanyRepository companyRepository,
            CompanyService companyService,
            @Autowired(required = false) MediaStorageService mediaStorageService) {
        this.companyMediaRepository = companyMediaRepository;
        this.companyRepository = companyRepository;
        this.companyService = companyService;
        this.mediaStorageService = Optional.ofNullable(mediaStorageService);
    }

    private MediaStorageService getMediaStorageServiceOrThrow() {
        return mediaStorageService.orElseThrow(() -> new UnsupportedOperationException(
                "Media storage is not configured. Please enable Firebase by setting firebase.enabled=true and providing credentials."));
    }

    @Override
    @Transactional
    public CompanyMedia uploadLogo(UUID companyId, MultipartFile file) throws IOException {
        log.info("Uploading logo for company ID: {}", companyId);

        MediaStorageService storage = getMediaStorageServiceOrThrow();

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with ID: " + companyId));

        // Delete old logo if exists
        List<CompanyMedia> existingLogos = companyMediaRepository
                .findByCompanyIdAndTypeOrderByDisplayOrderAsc(companyId, MediaType.LOGO);

        for (CompanyMedia oldLogo : existingLogos) {
            storage.deleteFile(oldLogo.getUrl());
            companyMediaRepository.delete(oldLogo);
        }

        // Upload to Firebase Storage
        String url = storage.uploadCompanyLogo(companyId, file);

        // Save new logo
        CompanyMedia logo = CompanyMedia.builder()
                .company(company)
                .type(MediaType.LOGO)
                .url(url)
                .title("Company Logo")
                .displayOrder(0)
                .build();

        CompanyMedia savedLogo = companyMediaRepository.save(logo);

        companyService.updateProfileLogoUrl(companyId, url);

        return savedLogo;
    }

    @Override
    @Transactional
    public CompanyMedia uploadBanner(UUID companyId, MultipartFile file) throws IOException {
        log.info("Uploading banner for company ID: {}", companyId);

        MediaStorageService storage = getMediaStorageServiceOrThrow();

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with ID: " + companyId));

        // Delete old banner if exists
        List<CompanyMedia> existingBanners = companyMediaRepository
                .findByCompanyIdAndTypeOrderByDisplayOrderAsc(companyId, MediaType.BANNER);

        for (CompanyMedia oldBanner : existingBanners) {
            storage.deleteFile(oldBanner.getUrl());
            companyMediaRepository.delete(oldBanner);
        }

        // Upload to Firebase Storage
        String url = storage.uploadCompanyBanner(companyId, file);

        // Save new banner
        CompanyMedia banner = CompanyMedia.builder()
                .company(company)
                .type(MediaType.BANNER)
                .url(url)
                .title("Company Banner")
                .displayOrder(0)
                .build();

        CompanyMedia savedBanner = companyMediaRepository.save(banner);

        companyService.updateProfileBannerUrl(companyId, url);

        return savedBanner;
    }

    @Override
    @Transactional
    public CompanyMedia uploadMedia(UUID companyId, MediaType type, MultipartFile file,
            String title, String description) throws IOException {
        log.info("Uploading media for company ID: {}, type: {}", companyId, type);

        MediaStorageService storage = getMediaStorageServiceOrThrow();

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with ID: " + companyId));

        // Upload to Firebase Storage
        String url = storage.uploadCompanyMedia(companyId, file);

        // Get next display order
        long count = companyMediaRepository.countByCompanyId(companyId);

        // Save media
        CompanyMedia media = CompanyMedia.builder()
                .company(company)
                .type(type)
                .url(url)
                .title(title)
                .description(description)
                .displayOrder((int) count)
                .build();

        return companyMediaRepository.save(media);
    }

    @Override
    public List<CompanyMedia> getCompanyMedia(UUID companyId) {
        log.info("Getting all media for company ID: {}", companyId);
        return companyMediaRepository.findByCompanyIdOrderByDisplayOrderAsc(companyId);
    }

    @Override
    public Page<CompanyMedia> getCompanyMediaPaginated(UUID companyId, Pageable pageable) {
        log.info("Getting paginated media for company ID: {}, page: {}, size: {}",
                companyId, pageable.getPageNumber(), pageable.getPageSize());
        return companyMediaRepository.findByCompanyId(companyId, pageable);
    }

    @Override
    public List<CompanyMedia> getCompanyMediaByType(UUID companyId, MediaType type) {
        log.info("Getting media for company ID: {}, type: {}", companyId, type);
        return companyMediaRepository.findByCompanyIdAndTypeOrderByDisplayOrderAsc(companyId, type);
    }

    @Override
    public Page<CompanyMedia> getCompanyMediaByTypePaginated(UUID companyId, MediaType type, Pageable pageable) {
        log.info("Getting paginated media for company ID: {}, type: {}, page: {}, size: {}",
                companyId, type, pageable.getPageNumber(), pageable.getPageSize());
        return companyMediaRepository.findByCompanyIdAndType(companyId, type, pageable);
    }

    @Override
    @Transactional
    public void deleteMedia(UUID mediaId) {
        log.info("Deleting media with ID: {}", mediaId);

        CompanyMedia media = companyMediaRepository.findById(mediaId)
                .orElseThrow(() -> new IllegalArgumentException("Media not found with ID: " + mediaId));

        // Delete from Firebase Storage if available
        mediaStorageService.ifPresent(storage -> storage.deleteFile(media.getUrl()));

        // Delete from database
        companyMediaRepository.delete(media);

        if (media.getType() == MediaType.LOGO) {
            companyService.updateProfileLogoUrl(media.getCompany().getId(), null);
        } else if (media.getType() == MediaType.BANNER) {
            companyService.updateProfileBannerUrl(media.getCompany().getId(), null);
        }
    }

    @Override
    @Transactional
    public void updateDisplayOrder(UUID companyId, UUID mediaId, Integer displayOrder) {
        log.info("Updating display order for media ID: {} to {} for company ID: {}", mediaId, displayOrder, companyId);

        CompanyMedia media = companyMediaRepository.findByIdAndCompanyId(mediaId, companyId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Media not found with ID: " + mediaId + " for company ID: " + companyId));

        if (displayOrder < 0) {
            throw new IllegalArgumentException("Display order must be >= 0");
        }

        media.setDisplayOrder(displayOrder);
        companyMediaRepository.save(media);
    }

    @Override
    @Transactional
    public void reorderMedia(UUID companyId, List<UUID> orderedMediaIds) {
        log.info("Reordering media for company ID: {}, new order: {}", companyId, orderedMediaIds);

        if (orderedMediaIds == null || orderedMediaIds.isEmpty()) {
            throw new IllegalArgumentException("orderedMediaIds must not be empty");
        }

        // Validate that all IDs belong to this company
        List<UUID> existingIds = companyMediaRepository.findIdsByCompanyId(companyId);

        if (!existingIds.containsAll(orderedMediaIds)) {
            throw new IllegalArgumentException("Some media IDs do not belong to this company");
        }

        // Update display order for each media in the new order
        int order = 0;
        for (UUID mediaId : orderedMediaIds) {
            companyMediaRepository.updateDisplayOrder(companyId, mediaId, order++);
        }

        log.info("Successfully reordered {} media items for company ID: {}", orderedMediaIds.size(), companyId);
    }
}
