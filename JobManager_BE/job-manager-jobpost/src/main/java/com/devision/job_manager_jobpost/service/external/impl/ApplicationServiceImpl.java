package com.devision.job_manager_jobpost.service.external.impl;

import com.devision.job_manager_jobpost.dto.external.ApplicationResponseDto;
import com.devision.job_manager_jobpost.dto.external.ApplicationServiceResponseDto;
import com.devision.job_manager_jobpost.dto.external.PageableResponseDto;
import com.devision.job_manager_jobpost.model.ApplicationArchive;
import com.devision.job_manager_jobpost.repository.ApplicationArchiveRepository;
import com.devision.job_manager_jobpost.service.external.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Profile("!mock")
@RequiredArgsConstructor
@Slf4j
public class ApplicationServiceImpl implements ApplicationService {

    private final RestTemplate restTemplate;

    @Qualifier("applicationServiceBaseUrl")
    private final String baseUrl;

    private final ApplicationArchiveRepository archiveRepository;

    @Override
    public PageableResponseDto<ApplicationResponseDto> getApplicationsByJobPost(
            UUID jobPostId,
            UUID companyId,
            int page,
            int size,
            Boolean archived) {

        log.info("Fetching applications for jobPostId: {}, page: {}, size: {}, archived: {}",
                jobPostId, page, size, archived);

        // Build URL with query parameters
        String url = String.format("%s/api/v1/internal/job-posts/%s/applications?page=%d&size=%d",
                baseUrl, jobPostId, page, size);

        // If filtering by archived status
        if (archived != null) {
            if (archived) {
                // Get list of archived application IDs
                List<UUID> archivedIds = archiveRepository
                        .findArchivedApplicationIdsByJobPostAndCompany(jobPostId, companyId);

                if (archivedIds.isEmpty()) {
                    // No archived applications, return empty page
                    return createEmptyPage(page, size);
                }

                // For archived: we need to fetch all and filter client-side
                // This is a limitation since Application Service doesn't support filtering by IDs
                url = String.format("%s/api/v1/internal/job-posts/%s/applications?page=0&size=1000",
                        baseUrl, jobPostId);
            } else {
                // For pending: fetch all and filter out archived ones client-side
                url = String.format("%s/api/v1/internal/job-posts/%s/applications?page=0&size=1000",
                        baseUrl, jobPostId);
            }
        }

        try {
            // Make REST API call
            ResponseEntity<ApplicationServiceResponseDto<PageableResponseDto<ApplicationResponseDto>>> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            null,
                            new ParameterizedTypeReference<ApplicationServiceResponseDto<PageableResponseDto<ApplicationResponseDto>>>() {}
                    );

            if (response.getBody() != null && response.getBody().isSuccess()) {
                PageableResponseDto<ApplicationResponseDto> pageData = response.getBody().getData();

                // If filtering is required, apply it
                if (archived != null) {
                    return filterAndPaginateApplications(pageData, jobPostId, companyId, archived, page, size);
                }

                return pageData;
            } else {
                log.error("Failed to fetch applications: {}",
                        response.getBody() != null ? response.getBody().getMessage() : "Unknown error");
                return createEmptyPage(page, size);
            }
        } catch (Exception e) {
            log.error("Error calling Application Service: ", e);
            throw new RuntimeException("Failed to fetch applications from Application Service", e);
        }
    }

    @Override
    @Transactional
    public void archiveApplication(UUID applicationId, UUID companyId, UUID jobPostId) {
        log.info("Archiving application: {} for company: {}", applicationId, companyId);

        // Check if already archived
        if (archiveRepository.existsByApplicationIdAndCompanyId(applicationId, companyId)) {
            log.warn("Application {} is already archived by company {}", applicationId, companyId);
            return;
        }

        // Create archive record
        ApplicationArchive archive = ApplicationArchive.builder()
                .applicationId(applicationId)
                .companyId(companyId)
                .jobPostId(jobPostId)
                .build();

        archiveRepository.save(archive);
        log.info("Application {} archived successfully", applicationId);
    }

    @Override
    @Transactional
    public void unarchiveApplication(UUID applicationId, UUID companyId) {
        log.info("Unarchiving application: {} for company: {}", applicationId, companyId);

        archiveRepository.deleteByApplicationIdAndCompanyId(applicationId, companyId);
        log.info("Application {} unarchived successfully", applicationId);
    }

    @Override
    public byte[] downloadApplicationFile(UUID applicationId, String docType) {
        log.info("Downloading file for application: {}, docType: {}", applicationId, docType);

        // Validate docType
        if (!docType.equals("RESUME") && !docType.equals("COVER_LETTER")) {
            throw new IllegalArgumentException("Invalid document type. Must be RESUME or COVER_LETTER");
        }

        String url = String.format("%s/api/v1/internal/job-posts/applications/%s/files/%s",
                baseUrl, applicationId, docType);

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    byte[].class
            );

            if (response.getBody() != null) {
                log.info("File downloaded successfully, size: {} bytes", response.getBody().length);
                return response.getBody();
            } else {
                log.error("Empty response when downloading file");
                throw new RuntimeException("Failed to download file");
            }
        } catch (Exception e) {
            log.error("Error downloading application file: ", e);
            throw new RuntimeException("Failed to download application file", e);
        }
    }

    @Override
    public long[] getApplicationCounts(UUID jobPostId, UUID companyId) {
        log.info("Getting application counts for jobPostId: {}, companyId: {}", jobPostId, companyId);

        try {
            // Get total count from Application Service
            String url = String.format("%s/api/v1/internal/job-posts/%s/applications?page=0&size=1",
                    baseUrl, jobPostId);

            ResponseEntity<ApplicationServiceResponseDto<PageableResponseDto<ApplicationResponseDto>>> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            null,
                            new ParameterizedTypeReference<ApplicationServiceResponseDto<PageableResponseDto<ApplicationResponseDto>>>() {}
                    );

            long totalCount = 0;
            if (response.getBody() != null && response.getBody().isSuccess()) {
                totalCount = response.getBody().getData().getTotalElements();
            }

            // Get archived count from our database
            long archivedCount = archiveRepository.countByJobPostIdAndCompanyId(jobPostId, companyId);
            long pendingCount = totalCount - archivedCount;

            return new long[]{pendingCount, archivedCount};
        } catch (Exception e) {
            log.error("Error getting application counts: ", e);
            return new long[]{0, 0};
        }
    }

    // Helper method to filter and paginate applications based on archive status
    private PageableResponseDto<ApplicationResponseDto> filterAndPaginateApplications(
            PageableResponseDto<ApplicationResponseDto> pageData,
            UUID jobPostId,
            UUID companyId,
            boolean archived,
            int page,
            int size) {

        List<UUID> archivedIds = archiveRepository
                .findArchivedApplicationIdsByJobPostAndCompany(jobPostId, companyId);

        List<ApplicationResponseDto> filtered = pageData.getContent().stream()
                .filter(app -> archived == archivedIds.contains(app.getId()))
                .collect(Collectors.toList());

        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, filtered.size());
        List<ApplicationResponseDto> paginatedContent = filtered.subList(
                Math.min(start, filtered.size()),
                Math.min(end, filtered.size())
        );

        PageableResponseDto<ApplicationResponseDto> result = new PageableResponseDto<>();
        result.setContent(paginatedContent);
        result.setPageNumber(page);
        result.setPageSize(size);
        result.setTotalElements(filtered.size());
        result.setTotalPages((int) Math.ceil((double) filtered.size() / size));
        result.setFirst(page == 0);
        result.setLast(end >= filtered.size());

        return result;
    }

    // Helper method to create empty page
    private PageableResponseDto<ApplicationResponseDto> createEmptyPage(int page, int size) {
        PageableResponseDto<ApplicationResponseDto> emptyPage = new PageableResponseDto<>();
        emptyPage.setContent(List.of());
        emptyPage.setPageNumber(page);
        emptyPage.setPageSize(size);
        emptyPage.setTotalElements(0);
        emptyPage.setTotalPages(0);
        emptyPage.setFirst(true);
        emptyPage.setLast(true);
        return emptyPage;
    }
}


