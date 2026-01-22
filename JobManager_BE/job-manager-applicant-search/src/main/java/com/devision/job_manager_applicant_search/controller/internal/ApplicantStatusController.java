package com.devision.job_manager_applicant_search.controller.internal;

import com.devision.job_manager_applicant_search.dto.ApiResponse;
import com.devision.job_manager_applicant_search.dto.internal.request.SetApplicantStatusRequest;
import com.devision.job_manager_applicant_search.dto.internal.response.ApplicantStatusResponse;
import com.devision.job_manager_applicant_search.model.ApplicantStatusType;
import com.devision.job_manager_applicant_search.model.CompanyApplicantStatus;
import com.devision.job_manager_applicant_search.service.ApplicantStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing applicant status (Warning/Favorite).
 */
@RestController
@RequestMapping("/api/internal/applicants")
@RequiredArgsConstructor
public class ApplicantStatusController {

    private final ApplicantStatusService applicantStatusService;

    /**
     * Set or update status for an applicant.
     * 
     * @param applicantId The applicant to mark
     * @param companyId The company making the request (from auth header in production)
     * @param request The status to set
     */
    @PutMapping("/{applicantId}/status")
    public ResponseEntity<ApiResponse<ApplicantStatusResponse>> setStatus(
            @PathVariable UUID applicantId,
            @RequestHeader("X-Company-Id") UUID companyId,
            @Valid @RequestBody SetApplicantStatusRequest request) {
        
        CompanyApplicantStatus status = applicantStatusService.setStatus(
                companyId, applicantId, request.getStatus(), request.getNote());
        
        if (status == null) {
            // Status was cleared (set to NONE)
            return ResponseEntity.ok(ApiResponse.success("Status cleared", null));
        }
        
        return ResponseEntity.ok(ApiResponse.success(
                "Status updated", ApplicantStatusResponse.fromEntity(status)));
    }

    /**
     * Get status for an applicant.
     * 
     * @param applicantId The applicant
     * @param companyId The company making the request
     */
    @GetMapping("/{applicantId}/status")
    public ResponseEntity<ApiResponse<ApplicantStatusResponse>> getStatus(
            @PathVariable UUID applicantId,
            @RequestHeader("X-Company-Id") UUID companyId) {
        
        CompanyApplicantStatus status = applicantStatusService.getStatus(companyId, applicantId);
        
        if (status == null) {
            return ResponseEntity.ok(ApiResponse.success("No status set", null));
        }
        
        return ResponseEntity.ok(ApiResponse.success(
                "Status retrieved", ApplicantStatusResponse.fromEntity(status)));
    }

    /**
     * Delete status for an applicant.
     * 
     * @param applicantId The applicant
     * @param companyId The company making the request
     */
    @DeleteMapping("/{applicantId}/status")
    public ResponseEntity<ApiResponse<Void>> deleteStatus(
            @PathVariable UUID applicantId,
            @RequestHeader("X-Company-Id") UUID companyId) {
        
        applicantStatusService.clearStatus(companyId, applicantId);
        return ResponseEntity.ok(ApiResponse.success("Status cleared", null));
    }

    /**
     * Get all favorites for a company.
     * 
     * @param companyId The company making the request
     */
    @GetMapping("/status/favorites")
    public ResponseEntity<ApiResponse<List<ApplicantStatusResponse>>> getFavorites(
            @RequestHeader("X-Company-Id") UUID companyId) {
        
        List<CompanyApplicantStatus> favorites = 
                applicantStatusService.getApplicantsByStatus(companyId, ApplicantStatusType.FAVORITE);
        
        List<ApplicantStatusResponse> response = favorites.stream()
                .map(ApplicantStatusResponse::fromEntity)
                .toList();
        
        return ResponseEntity.ok(ApiResponse.success("Favorites retrieved", response));
    }

    /**
     * Get all warnings for a company.
     * 
     * @param companyId The company making the request
     */
    @GetMapping("/status/warnings")
    public ResponseEntity<ApiResponse<List<ApplicantStatusResponse>>> getWarnings(
            @RequestHeader("X-Company-Id") UUID companyId) {
        
        List<CompanyApplicantStatus> warnings = 
                applicantStatusService.getApplicantsByStatus(companyId, ApplicantStatusType.WARNING);
        
        List<ApplicantStatusResponse> response = warnings.stream()
                .map(ApplicantStatusResponse::fromEntity)
                .toList();
        
        return ResponseEntity.ok(ApiResponse.success("Warnings retrieved", response));
    }
}
