package com.devision.job_manager_company.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyListDto {
    private UUID id;
    private String name;
    private String city;
    private String countryCode;
    private String industry;
    private String companySize;
    private String logoUrl;
    private boolean isPremium;
}
