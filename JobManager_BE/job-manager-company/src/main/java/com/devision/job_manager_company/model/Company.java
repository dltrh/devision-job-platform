package com.devision.job_manager_company.model;

import com.devision.job_manager_company.validation.ValidPhoneNumber;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "company")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    @Id
    // ID is assigned from Auth service (no auto-generation)
    @NotNull(message = "Company ID is required")
    private UUID id;

    @Column(nullable = false, length = 255)
    @Size(max = 255, message = "Company name must be less than 255 characters")
    private String name;

    @Column(length = 32)
    @ValidPhoneNumber
    private String phone;

    @Column(name = "street_address", length = 255)
    @Size(max = 255, message = "Street address must be less than 255 characters")
    private String streetAddress;

    @Column(length = 128)
    @Size(max = 128, message = "City must be less than 128 characters")
    private String city;

    @Column(name = "country_code", nullable = false, length = 3)
    @NotBlank(message = "Country code is required")
    @Size(min = 2, max = 3, message = "Country code must be 2-3 characters (ISO 3166-1 alpha-2 or alpha-3)")
    @Pattern(regexp = "^[A-Z]{2,3}$", message = "Country code must be uppercase letters (e.g., VN, USA)")
    private String countryCode;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CompanyProfile profile;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
