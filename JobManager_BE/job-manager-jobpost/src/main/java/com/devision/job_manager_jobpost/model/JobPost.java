package com.devision.job_manager_jobpost.model;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.List;
import java.util.ArrayList;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_post")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPost {

    @Builder.Default
    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobPostSkill> skills = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobPostEmploymentType> employmentTypes = new ArrayList<>();

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "job_post_id")
    private UUID jobPostId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "country_code", length = 3)
    private String countryCode;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "is_fresher", nullable = false)
    private boolean fresher;

    @Enumerated(EnumType.STRING)
    @Column(name = "salary_type", nullable = false, length = 32)
    private SalaryType salaryType;

    @Column(name = "salary_min", precision = 19, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 19, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "salary_note", length = 255)
    private String salaryNote;

    @Column(name = "location_city", length = 128)
    private String locationCity;

    @Column(name = "is_published", nullable = false)
    private boolean published;

    @Column(name = "is_private", nullable = false)
    private boolean aPrivate;

    @Column(name = "posted_at")
    private LocalDateTime postedAt;

    @Column(name = "expiry_at")
    private LocalDateTime expiryAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
