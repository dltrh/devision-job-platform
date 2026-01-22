package com.devision.job_manager_applicant_search.controller.internal;

import com.devision.job_manager_applicant_search.dto.ApiResponse;
import com.devision.job_manager_applicant_search.dto.internal.request.CreateSearchProfileRequest;
import com.devision.job_manager_applicant_search.dto.internal.response.SearchProfileResponse;
import com.devision.job_manager_applicant_search.dto.internal.request.UpdateSearchProfileRequest;
import com.devision.job_manager_applicant_search.dto.internal.request.UpdateStatusRequest;
import com.devision.job_manager_applicant_search.service.SearchProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/search-profiles")
@RequiredArgsConstructor
public class InternalSearchProfileController {

    private final SearchProfileService searchProfileService;

    /**
     * Create a new search profile.
     * Requires premium subscription for the company.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SearchProfileResponse>> create(
            @Valid @RequestBody CreateSearchProfileRequest request) {
        SearchProfileResponse profile = searchProfileService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Search profile created", profile));
    }

    // Get a search profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SearchProfileResponse>> getById(@PathVariable UUID id) {
        SearchProfileResponse profile = searchProfileService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Search profile retrieved", profile));
    }

    // Update an existing search profile
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SearchProfileResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSearchProfileRequest request) {
        SearchProfileResponse profile = searchProfileService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Search profile updated", profile));
    }

    // Delete a search profile
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        searchProfileService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Search profile deleted", null));
    }

    // Get all search profiles for a company
    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<List<SearchProfileResponse>>> getByCompanyId(
            @PathVariable UUID companyId) {
        List<SearchProfileResponse> profiles = searchProfileService.getByCompanyId(companyId);
        return ResponseEntity.ok(ApiResponse.success("Search profiles retrieved", profiles));
    }

    // Get all active search profiles for a company
    @GetMapping("/company/{companyId}/active")
    public ResponseEntity<ApiResponse<List<SearchProfileResponse>>> getActiveByCompanyId(
            @PathVariable UUID companyId) {
        List<SearchProfileResponse> profiles = searchProfileService.getActiveByCompanyId(companyId);
        return ResponseEntity.ok(ApiResponse.success("Active search profiles retrieved", profiles));
    }

    /**
     * Update the active status of a search profile (activate/deactivate).
     * Requires premium subscription when activating.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SearchProfileResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateStatusRequest request) {
        SearchProfileResponse profile = searchProfileService.updateStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success("Search profile status updated", profile));
    }
}
