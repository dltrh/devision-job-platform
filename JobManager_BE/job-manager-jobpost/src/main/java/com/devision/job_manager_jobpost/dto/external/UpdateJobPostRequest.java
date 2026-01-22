package com.devision.job_manager_jobpost.dto.external;

import com.devision.job_manager_jobpost.model.SalaryType;
import com.devision.job_manager_jobpost.validation.ValidSalary;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class UpdateJobPostRequest {

    @Size(max = 255)
    private String title;

    private String description;

    private SalaryType salaryType;

    private BigDecimal salaryMin;

    private BigDecimal salaryMax;

    @Size(max = 255)
    private String salaryNote;

    @Size(max = 128)
    private String locationCity;

    /**
     * When updating job location, update this to reflect the new country
     */
    @Size(max = 3, message = "Country code must be 2-3 characters")
    private String countryCode;

    private Boolean fresher;

    @JsonProperty("isPrivate")
    private Boolean aPrivate;

    private LocalDateTime expiryAt;

    private List<UUID> skillIds;
}


