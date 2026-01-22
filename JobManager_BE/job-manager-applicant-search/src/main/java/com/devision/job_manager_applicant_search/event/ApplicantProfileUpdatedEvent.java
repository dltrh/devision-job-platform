package com.devision.job_manager_applicant_search.event;

import com.devision.job_manager_applicant_search.model.EducationDegree;
import com.devision.job_manager_applicant_search.model.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Internal event representation for applicant profile updates.
 * 
 * This DTO maps from JA's Kafka events:
 * - UserProfileCreateEvent (topic: user-profile-create)
 * - UserSearchProfileUpdateEvent (topic: user-profile-update)
 * 
 * Field mappings from JA events:
 * - userId -> applicantId
 * - countryAbbreviation -> countryCode
 * - educationLevel -> highestDegree
 * - employmentTypes (List<String>) -> employmentTypes (Set<EmploymentType>)
 * - skillIds -> skillIds
 * - minSalary/maxSalary -> minSalary/maxSalary
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicantProfileUpdatedEvent {

    private UUID eventId;
    
    private UUID applicantId;
    
    private String countryCode;
    
    private EducationDegree highestDegree;
    
    /**
     * Applicant's minimum salary expectation.
     */
    private BigDecimal minSalary;
    
    /**
     * Applicant's maximum salary expectation.
     */
    private BigDecimal maxSalary;
    
    private Set<EmploymentType> employmentTypes;
    
    private Set<UUID> skillIds;
    
    /**
     * Optional job titles the applicant is seeking.
     */
    private List<String> jobTitles;
    
    private LocalDateTime timestamp;

    /**
     * Factory method to create from JA's UserProfileCreateEvent.
     */
    public static ApplicantProfileUpdatedEvent fromCreateEvent(
            UUID eventId,
            UUID userId,
            String countryAbbreviation,
            String educationLevel,
            List<UUID> skillIds,
            List<String> employmentTypes,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            List<String> jobTitles,
            LocalDateTime createdAt
    ) {
        return ApplicantProfileUpdatedEvent.builder()
                .eventId(eventId)
                .applicantId(userId)
                .countryCode(countryAbbreviation)
                .highestDegree(parseEducationDegree(educationLevel))
                .minSalary(minSalary)
                .maxSalary(maxSalary)
                .employmentTypes(parseEmploymentTypes(employmentTypes))
                .skillIds(skillIds != null ? Set.copyOf(skillIds) : Set.of())
                .jobTitles(jobTitles)
                .timestamp(createdAt != null ? createdAt : LocalDateTime.now())
                .build();
    }

    /**
     * Factory method to create from JA's UserSearchProfileUpdateEvent.
     */
    public static ApplicantProfileUpdatedEvent fromUpdateEvent(
            UUID eventId,
            UUID userId,
            String countryAbbreviation,
            String educationLevel,
            List<UUID> skillIds,
            List<String> employmentTypes,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            List<String> jobTitles,
            LocalDateTime createdAt
    ) {
        // Same structure as create event
        return fromCreateEvent(eventId, userId, countryAbbreviation, educationLevel,
                skillIds, employmentTypes, minSalary, maxSalary, jobTitles, createdAt);
    }

    /**
     * Parse education level string to EducationDegree enum.
     */
    private static EducationDegree parseEducationDegree(String educationLevel) {
        if (educationLevel == null || educationLevel.isBlank()) {
            return null;
        }
        try {
            // Handle variations like "BACHELORS" vs "BACHELOR"
            String normalized = educationLevel.toUpperCase()
                    .replace("BACHELORS", "BACHELOR")
                    .replace("MASTERS", "MASTER");
            return EducationDegree.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return null; // Unknown degree
        }
    }

    /**
     * Parse employment type strings to EmploymentType enum set.
     */
    private static Set<EmploymentType> parseEmploymentTypes(List<String> types) {
        if (types == null || types.isEmpty()) {
            return Set.of();
        }
        return types.stream()
                .map(type -> {
                    try {
                        return EmploymentType.valueOf(type.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
    }
}
