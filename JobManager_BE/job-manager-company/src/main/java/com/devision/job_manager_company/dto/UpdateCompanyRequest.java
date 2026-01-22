package com.devision.job_manager_company.dto;

import com.devision.job_manager_company.validation.ValidPhoneNumber;
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
public class UpdateCompanyRequest {
    @Size(max = 255, message = "Name must be less than 255 characters")
    private String name;
    
    @ValidPhoneNumber
    private String phone;
    
    @Size(max = 255, message = "Street address must be less than 255 characters")
    private String streetAddress;
    
    @Size(max = 128, message = "City must be less than 128 characters")
    private String city;
    
    @Size(min = 2, max = 3, message = "Country code must be 2-3 characters (ISO 3166-1 alpha-2 or alpha-3)")
    @Pattern(regexp = "^[A-Z]{2,3}$", message = "Country code must be uppercase letters (e.g., VN, USA)")
    private String countryCode;
}
