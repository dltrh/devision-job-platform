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
public class CompanyDto {
    private UUID id;
    private String name;
    private String phone;
    private String streetAddress;
    private String city;
    private String countryCode;
}
