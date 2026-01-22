package com.devision.job_manager_company.dto;

import com.devision.job_manager_company.model.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMediaDto {
    private UUID id;
    private UUID companyId;
    private MediaType type;
    private String url;
    private String title;
    private String description;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
