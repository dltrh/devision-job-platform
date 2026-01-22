package com.devision.job_manager_jobpost.controller.external;

import com.devision.job_manager_jobpost.dto.ApiResponse;
import com.devision.job_manager_jobpost.dto.external.ApplicationResponseDto;
import com.devision.job_manager_jobpost.dto.external.PageableResponseDto;
import com.devision.job_manager_jobpost.service.external.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")  // Changed from /api/v1/internal/job-posts
@RequiredArgsConstructor
@Slf4j
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * Get applications for a specific job post
     * GET /applications/job-posts/{jobPostId}
     */
    @GetMapping("/job-posts/{jobPostId}")  // Changed path
    public ResponseEntity<ApiResponse<PageableResponseDto<ApplicationResponseDto>>> getApplications(
            @PathVariable UUID jobPostId,
            @RequestParam UUID companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean archived) {

        log.info("Fetching applications for jobPostId={}, companyId={}, page={}, size={}, archived={}",
                jobPostId, companyId, page, size, archived);

        try {
            PageableResponseDto<ApplicationResponseDto> applications =
                    applicationService.getApplicationsByJobPost(jobPostId, companyId, page, size, archived);

            return ResponseEntity.ok(ApiResponse.success("Applications fetched successfully", applications));
        } catch (Exception e) {
            log.error("Error fetching applications: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch applications: " + e.getMessage()));
        }
    }

    /**
     * Get application counts (pending vs archived)
     * GET /applications/job-posts/{jobPostId}/counts
     */
    @GetMapping("/job-posts/{jobPostId}/counts")  // Changed path (added 's' to match frontend)
    public ResponseEntity<ApiResponse<Map<String, Long>>> getApplicationCounts(
            @PathVariable UUID jobPostId,
            @RequestParam UUID companyId) {

        log.info("Fetching application counts for jobPostId={}, companyId={}", jobPostId, companyId);

        try {
            long[] counts = applicationService.getApplicationCounts(jobPostId, companyId);

            Map<String, Long> countMap = new HashMap<>();
            countMap.put("pending", counts[0]);
            countMap.put("archived", counts[1]);
            countMap.put("total", counts[0] + counts[1]);

            return ResponseEntity.ok(ApiResponse.success("Application counts retrieved", countMap));
        } catch (Exception e) {
            log.error("Error fetching application counts: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch counts: " + e.getMessage()));
        }
    }

    /**
     * Archive an application
     * POST /applications/{applicationId}/archive
     */
    @PostMapping("/{applicationId}/archive")  // Changed path
    public ResponseEntity<ApiResponse<Void>> archiveApplication(
            @PathVariable UUID applicationId,
            @RequestParam UUID companyId,
            @RequestParam UUID jobPostId) {

        log.info("Archiving application={} for company={}", applicationId, companyId);

        try {
            applicationService.archiveApplication(applicationId, companyId, jobPostId);
            return ResponseEntity.ok(ApiResponse.success("Application archived successfully", null));
        } catch (Exception e) {
            log.error("Error archiving application: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to archive application: " + e.getMessage()));
        }
    }

    /**
     * Unarchive an application
     * POST /applications/{applicationId}/unarchive
     */
    @PostMapping("/{applicationId}/unarchive")  // Changed path
    public ResponseEntity<ApiResponse<Void>> unarchiveApplication(
            @PathVariable UUID applicationId,
            @RequestParam UUID companyId) {

        log.info("Unarchiving application={} for company={}", applicationId, companyId);

        try {
            applicationService.unarchiveApplication(applicationId, companyId);
            return ResponseEntity.ok(ApiResponse.success("Application unarchived successfully", null));
        } catch (Exception e) {
            log.error("Error unarchiving application: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to unarchive application: " + e.getMessage()));
        }
    }

    /**
     * Download application file (Resume or Cover Letter)
     * GET /applications/{applicationId}/files/{docType}
     */
    @GetMapping("/{applicationId}/files/{docType}")  // Changed path
    public ResponseEntity<byte[]> downloadApplicationFile(
            @PathVariable UUID applicationId,
            @PathVariable String docType) {

        log.info("Downloading file for application={}, docType={}", applicationId, docType);

        try {
            byte[] fileContent = applicationService.downloadApplicationFile(applicationId, docType);

            // Determine content type and filename
            String contentType = "application/pdf";
            String filename = docType.equals("RESUME") ? "resume.pdf" : "cover_letter.pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(fileContent);
        } catch (Exception e) {
            log.error("Error downloading file: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
