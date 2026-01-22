package com.devision.job_manager_company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfileDto {
    private UUID companyId;
    private String aboutUs;
    private String whoWeSeek;
    private String logoUrl;
    private String bannerUrl;
    private String websiteUrl;
    private String linkedinUrl;
    private String industry;
    private String companySize;
    private Integer foundedYear;
}
