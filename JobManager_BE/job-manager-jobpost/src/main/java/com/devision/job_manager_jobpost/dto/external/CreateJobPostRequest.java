package com.devision.job_manager_jobpost.dto.external;

import com.devision.job_manager_jobpost.model.EmploymentType;
import com.devision.job_manager_jobpost.model.SalaryType;
import com.devision.job_manager_jobpost.validation.ValidSalary;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ValidSalary
public class CreateJobPostRequest {

    @NotNull
    private UUID companyId;

    @NotBlank
    @Size(max = 255)
    private String title;

    private String description;

    @NotNull
    private SalaryType salaryType;

    private BigDecimal salaryMin;

    private BigDecimal salaryMax;

    @Size(max = 255)
    private String salaryNote;

    @Size(max = 128)
    private String locationCity;

    @Size(max = 3, message = "Country code must be 2-3 characters")
    private String countryCode;

    private boolean fresher;

    @JsonProperty("isPrivate")
    private boolean aPrivate;

    private LocalDateTime expiryAt;

    private List<UUID> skillIds;
    
    // Employment type - single value (frontend sends single type)
    private EmploymentType employmentType;
}


