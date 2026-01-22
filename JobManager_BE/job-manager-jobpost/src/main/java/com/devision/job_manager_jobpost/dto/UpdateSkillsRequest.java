package com.devision.job_manager_jobpost.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for updating job post skills
 * Used for Ultimo 4.3.1 requirement - enables instant notifications to matching applicants
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSkillsRequest {

    @NotNull(message = "Skill IDs list cannot be null")
    private List<UUID> skillIds;
}
