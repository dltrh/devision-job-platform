package com.devision.job_manager_jobpost.dto.external;

import com.devision.job_manager_jobpost.model.EmploymentType;
import com.devision.job_manager_jobpost.model.SalaryType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Job Post search requests
 * Supports Simplex, Medium, and Ultimo level requirements:
 *
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSearchRequest {
    private String title;
    private List<EmploymentType> employmentTypes;
    private String locationCity;
    private String countryCode;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private Boolean fresher; // If it is false or null -> show all job posts

    @Min(0)
    @Builder.Default
    private Integer page = 0;

    @Min(1)
    @Builder.Default
    private Integer size = 10;
}
