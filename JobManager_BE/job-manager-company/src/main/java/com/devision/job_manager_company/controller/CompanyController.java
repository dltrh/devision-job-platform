package com.devision.job_manager_company.controller;

import com.devision.job_manager_company.dto.*;
import com.devision.job_manager_company.dto.request.UpdateCompanyProfileRequest;
import com.devision.job_manager_company.dto.request.UpdateCompanyRequest;
import com.devision.job_manager_company.dto.response.ApiResponse;
import com.devision.job_manager_company.dto.response.CompanyListDto;
import com.devision.job_manager_company.dto.response.PagedResponse;
import com.devision.job_manager_company.model.Company;
import com.devision.job_manager_company.model.CompanyProfile;
import com.devision.job_manager_company.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Slf4j
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CompanyListDto>>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country) {

        log.info("Getting all companies: page={}, size={}, sortBy={}, sortDir={}, search={}, country={}",
                page, size, sortBy, sortDir, search, country);

        try {
            if (page < 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Page number cannot be negative"));
            }
            if (size < 1 || size > 100) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Page size must be between 1 and 100"));
            }

            Sort sort = sortDir.equalsIgnoreCase("desc")
                    ? Sort.by(sortBy).descending()
                    : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Company> companyPage;
            if (search != null && !search.trim().isEmpty()) {
                companyPage = companyService.searchCompaniesByName(search.trim(), pageable);
            } else if (country != null && !country.trim().isEmpty()) {
                companyPage = companyService.getCompaniesByCountry(country.trim().toUpperCase(), pageable);
            } else {
                companyPage = companyService.getAllCompanies(pageable);
            }

            List<CompanyListDto> companies = companyPage.getContent().stream()
                    .map(this::mapToListDto)
                    .toList();

            PagedResponse<CompanyListDto> response = PagedResponse.<CompanyListDto>builder()
                    .content(companies)
                    .page(companyPage.getNumber())
                    .size(companyPage.getSize())
                    .totalElements(companyPage.getTotalElements())
                    .totalPages(companyPage.getTotalPages())
                    .first(companyPage.isFirst())
                    .last(companyPage.isLast())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Companies retrieved successfully", response));

        } catch (Exception e) {
            log.error("Error retrieving companies", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to retrieve companies: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyDto>> getCompany(@PathVariable UUID id) {
        log.info("Getting company with ID: {}", id);
        
        return companyService.getCompanyById(id)
                .map(company -> {
                    CompanyDto dto = mapToDto(company);
                    return ResponseEntity.ok(ApiResponse.success("Company found", dto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<CompanyProfileDto>> getCompanyProfile(@PathVariable UUID id) {
        log.info("Getting company profile for ID: {}", id);
        
        return companyService.getCompanyWithProfile(id)
                .map(company -> {
                    CompanyProfileDto dto = mapProfileToDto(company.getProfile());
                    return ResponseEntity.ok(ApiResponse.success("Company profile found", dto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyDto>> updateCompany(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCompanyRequest request) {
        log.info("Updating company with ID: {}", id);
        
        try {
            Company updatedCompany = Company.builder()
                    .name(request.getName())
                    .phone(request.getPhone())
                    .streetAddress(request.getStreetAddress())
                    .city(request.getCity())
                    .countryCode(request.getCountryCode())
                    .build();
            
            Company company = companyService.updateCompany(id, updatedCompany);
            CompanyDto dto = mapToDto(company);
            return ResponseEntity.ok(ApiResponse.success("Company updated successfully", dto));
        } catch (IllegalArgumentException e) {
            log.error("Failed to update company: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<CompanyProfileDto>> updateCompanyProfile(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCompanyProfileRequest request) {
        log.info("Updating company profile for ID: {}", id);
        
        try {
            CompanyProfile updatedProfile = CompanyProfile.builder()
                    .aboutUs(request.getAboutUs())
                    .whoWeSeek(request.getWhoWeSeek())
                    .websiteUrl(request.getWebsiteUrl())
                    .linkedinUrl(request.getLinkedinUrl())
                    .industry(request.getIndustry())
                    .companySize(request.getCompanySize())
                    .foundedYear(request.getFoundedYear())
                    .build();
            
            CompanyProfile profile = companyService.updateCompanyProfile(id, updatedProfile);
            CompanyProfileDto dto = mapProfileToDto(profile);
            return ResponseEntity.ok(ApiResponse.success("Company profile updated successfully", dto));
        } catch (IllegalArgumentException e) {
            log.error("Failed to update company profile: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get company country code
     * Used by JobPost service to derive country for Kafka events (Ultimo 4.3.1)
     */
    @GetMapping("/{id}/country")
    public ResponseEntity<String> getCompanyCountry(@PathVariable UUID id) {
        log.info("Getting country code for company ID: {}", id);

        return companyService.getCompanyById(id)
                .map(company -> ResponseEntity.ok(company.getCountryCode()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Company Service is running");
    }

    @GetMapping("/dial-codes")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getDialCodes() {
        log.info("Getting dial codes list");
        
        // Dial codes matching Country enum from auth service
        // Only includes countries supported by the application
        List<Map<String, String>> dialCodes = new ArrayList<>();
        
        // Southeast Asia
        dialCodes.add(Map.of("code", "84", "name", "Vietnam"));
        dialCodes.add(Map.of("code", "65", "name", "Singapore"));
        dialCodes.add(Map.of("code", "60", "name", "Malaysia"));
        dialCodes.add(Map.of("code", "66", "name", "Thailand"));
        dialCodes.add(Map.of("code", "63", "name", "Philippines"));
        dialCodes.add(Map.of("code", "62", "name", "Indonesia"));
        dialCodes.add(Map.of("code", "81", "name", "Japan"));
        dialCodes.add(Map.of("code", "82", "name", "South Korea"));
        dialCodes.add(Map.of("code", "86", "name", "China"));
        
        // Oceania
        dialCodes.add(Map.of("code", "61", "name", "Australia"));
        dialCodes.add(Map.of("code", "64", "name", "New Zealand"));
        
        // North America
        dialCodes.add(Map.of("code", "1", "name", "United States"));
        dialCodes.add(Map.of("code", "1", "name", "Canada"));
        
        // Europe
        dialCodes.add(Map.of("code", "44", "name", "United Kingdom"));
        dialCodes.add(Map.of("code", "49", "name", "Germany"));
        dialCodes.add(Map.of("code", "33", "name", "France"));
        dialCodes.add(Map.of("code", "31", "name", "Netherlands"));
        
        return ResponseEntity.ok(ApiResponse.success("Dial codes list", dialCodes));
    }

    private CompanyDto mapToDto(Company company) {
        return CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .phone(company.getPhone())
                .streetAddress(company.getStreetAddress())
                .city(company.getCity())
                .countryCode(company.getCountryCode())
                .build();
    }

    private CompanyProfileDto mapProfileToDto(CompanyProfile profile) {
        if (profile == null) {
            return null;
        }
        return CompanyProfileDto.builder()
                .companyId(profile.getCompanyId())
                .aboutUs(profile.getAboutUs())
                .whoWeSeek(profile.getWhoWeSeek())
                .logoUrl(profile.getLogoUrl())
                .bannerUrl(profile.getBannerUrl())
                .websiteUrl(profile.getWebsiteUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .industry(profile.getIndustry())
                .companySize(profile.getCompanySize())
                .foundedYear(profile.getFoundedYear())
                .build();
    }

    private CompanyListDto mapToListDto(Company company) {
        CompanyProfile profile = company.getProfile();

        return CompanyListDto.builder()
                .id(company.getId())
                .name(company.getName())
                .city(company.getCity())
                .countryCode(company.getCountryCode())
                .industry(profile != null ? profile.getIndustry() : null)
                .companySize(profile != null ? profile.getCompanySize() : null)
                .logoUrl(profile != null ? profile.getLogoUrl() : null)
                .isPremium(false)
                .build();
    }
}
