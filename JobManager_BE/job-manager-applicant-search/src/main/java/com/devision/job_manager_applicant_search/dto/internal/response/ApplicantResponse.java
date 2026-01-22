package com.devision.job_manager_applicant_search.dto.internal.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for applicant data.
 * Aligned with JA service's UserResponse.
 * 
 * Fields match JA's UserResponse structure as of 2026-01-04.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicantResponse {

    private UUID id;
    
    private String email;
    
    private String firstName;
    
    private String lastName;
    
    private String fullName;
    
    private String phone;
    
    private String address;
    
    private String city;
    
    private String objectiveSummary;
    
    private String avatarUrl;
    
    private boolean premium;
    
    private boolean active;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime profileUpdatedAt;
    
    private CountryDto country;
    
    private List<SkillDto> skills;
    
    private List<EducationDto> education;
    
    private List<WorkExperienceDto> workExperience;
    
    private List<PortfolioItemDto> portfolioItems;

    // Company-specific applicant status (enriched from local database)
    private String companyStatus;      // "NONE", "WARNING", "FAVORITE"
    private String companyStatusNote;  // Note explaining the status

    // ==================== Nested DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CountryDto {
        private String id;
        private String name;
        private String abbreviation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillDto {
        private String id;
        private String name;
        private int usageCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EducationDto {
        private UUID id;
        private String educationLevel; // HIGH_SCHOOL, ASSOCIATE, BACHELOR, MASTER, DOCTORATE
        private String fieldOfStudy;
        private String institutionName;
        private String startAt; // ISO date string
        private String endAt;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkExperienceDto {
        private UUID id;
        private String title;
        private String companyName;
        private String employmentType; // FULL_TIME, PART_TIME, etc.
        private String startAt;
        private String endAt;
        private boolean currentJob;
        private String description;
        private CountryDto country;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PortfolioItemDto {
        private UUID id;
        private String title;
        private String description;
        private String url;
        private String imageUrl;
    }
}
