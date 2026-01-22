package com.devision.job_manager_company.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfile {
    @Id
    @Column(name = "company_id")
    private UUID companyId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "about_us", columnDefinition = "TEXT")
    @Size(max = 10000, message = "About us must be less than 10000 characters")
    private String aboutUs;

    @Column(name = "who_we_seek", columnDefinition = "TEXT")
    @Size(max = 5000, message = "Who we seek must be less than 5000 characters")
    private String whoWeSeek;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "banner_url", columnDefinition = "TEXT")
    private String bannerUrl;

    @Column(name = "website_url", length = 512)
    @Size(max = 512, message = "Website URL must be less than 512 characters")
    @Pattern(regexp = "^(https?://)?([\\w.-]+)(:[0-9]+)?(/.*)?$|^$", 
             message = "Website URL must be a valid URL format")
    private String websiteUrl;

    @Column(name = "linkedin_url", length = 512)
    @Size(max = 512, message = "LinkedIn URL must be less than 512 characters")
    @Pattern(regexp = "^(https?://)?(www\\.)?linkedin\\.com/.*$|^$", 
             message = "LinkedIn URL must be a valid LinkedIn URL")
    private String linkedinUrl;

    @Column(name = "industry", length = 128)
    @Size(max = 128, message = "Industry must be less than 128 characters")
    private String industry;

    @Column(name = "company_size", length = 64)
    @Size(max = 64, message = "Company size must be less than 64 characters")
    @Pattern(regexp = "^(1-10|11-50|51-200|201-500|501-1000|1001-5000|5001-10000|10000\\+)?$",
             message = "Company size must be a valid range (e.g., 1-10, 11-50, 51-200, etc.)")
    private String companySize;

    @Column(name = "founded_year")
    @Min(value = 1800, message = "Founded year must be after 1800")
    @Max(value = 2100, message = "Founded year must be before 2100")
    private Integer foundedYear;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
