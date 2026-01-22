package com.devision.job_manager_applicant_search.controller.external;

import com.devision.job_manager_applicant_search.dto.ApiResponse;
import com.devision.job_manager_applicant_search.dto.external.ActiveSearchProfileResponse;
import com.devision.job_manager_applicant_search.model.ApplicantSearchProfile;
import com.devision.job_manager_applicant_search.service.SearchProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search-profiles")
@RequiredArgsConstructor
public class ExternalSearchProfileController {

    private final SearchProfileService searchProfileService;

    // Get all active search profiles (read-only)
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ActiveSearchProfileResponse>>> getAllActive() {
        List<ApplicantSearchProfile> profiles = searchProfileService.getAllActive();
        List<ActiveSearchProfileResponse> responses = profiles.stream()
                .map(ActiveSearchProfileResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Active search profiles retrieved", responses));
    }
}
