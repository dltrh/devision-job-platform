package com.devision.job_manager_company.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCompanyProfileRequest {
    @Size(max = 10000, message = "About Us must be less than 10000 characters")
    private String aboutUs;
    
    @Size(max = 5000, message = "Who We Seek must be less than 5000 characters")
    private String whoWeSeek;
    
    @Size(max = 512, message = "Website URL must be less than 512 characters")
    @Pattern(regexp = "^$|^(https?://)?([\\w\\-]+\\.)+[\\w\\-]+(/[\\w\\-./?%&=]*)?$", message = "Website URL must be a valid URL format")
    private String websiteUrl;
    
    @Size(max = 512, message = "LinkedIn URL must be less than 512 characters")
    @Pattern(regexp = "^$|^(https?://)?(www\\.)?linkedin\\.com/(company|in)/[\\w\\-]+/?$", message = "LinkedIn URL must be a valid LinkedIn profile or company URL")
    private String linkedinUrl;
    
    @Size(max = 128, message = "Industry must be less than 128 characters")
    private String industry;
    
    @Size(max = 64, message = "Company size must be less than 64 characters")
    @Pattern(regexp = "^(1-10|11-50|51-200|201-500|501-1000|1001-5000|5001-10000|10001\\+)?$", message = "Company size must be a valid range (e.g., 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10000, 10001+)")
    private String companySize;
    
    @Min(value = 1800, message = "Founded year must be at least 1800")
    @Max(value = 2100, message = "Founded year must be at most 2100")
    private Integer foundedYear;
}
