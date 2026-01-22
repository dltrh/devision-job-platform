package com.devision.job_manager_applicant_search.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "applicant_search_profile", indexes = {
    @Index(name = "idx_asp_company_id", columnList = "company_id"),
    @Index(name = "idx_asp_is_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"skills", "employmentTypes"})
@EqualsAndHashCode(exclude = {"skills", "employmentTypes"})
public class ApplicantSearchProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "profile_name", nullable = false, length = 255)
    private String profileName;

    @Column(name = "country_code", length = 2)
    private String countryCode;

    /**
     * City filter for the search profile.
     * Maps to JA's 'city' parameter.
     */
    @Column(name = "city", length = 100)
    private String city;

    /**
     * Work experience keywords filter.
     * Maps to JA's 'workExperience' parameter.
     */
    @Column(name = "work_experience", length = 500)
    private String workExperience;

    /**
     * Minimum salary filter for the search profile.
     * Applicants with maxSalary below this are excluded.
     */
    @Column(name = "min_salary", precision = 12, scale = 2)
    private BigDecimal minSalary;

    /**
     * Maximum salary filter for the search profile.
     * Applicants with minSalary above this are excluded.
     */
    @Column(name = "max_salary", precision = 12, scale = 2)
    private BigDecimal maxSalary;

    /**
     * Education level filter.
     * Maps to JA's 'education' parameter.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "education", length = 32)
    private EducationDegree education;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private Set<ApplicantSearchProfileSkill> skills = new HashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private Set<ApplicantSearchProfileEmployment> employmentTypes = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods for managing collections
    public void addSkill(UUID skillId) {
        ApplicantSearchProfileSkill skill = new ApplicantSearchProfileSkill();
        skill.setProfile(this);
        skill.setSkillId(skillId);
        this.skills.add(skill);
    }

    public void clearSkills() {
        this.skills.clear();
    }

    public void addEmploymentType(EmploymentType type) {
        ApplicantSearchProfileEmployment employment = new ApplicantSearchProfileEmployment();
        employment.setProfile(this);
        employment.setType(type);
        this.employmentTypes.add(employment);
    }

    public void clearEmploymentTypes() {
        this.employmentTypes.clear();
    }

    // Gets the set of skill IDs associated with this profile
    public Set<UUID> getSkillIds() {
        Set<UUID> skillIds = new HashSet<>();
        for (ApplicantSearchProfileSkill skill : skills) {
            skillIds.add(skill.getSkillId());
        }
        return skillIds;
    }

    // Gets the set of employment types associated with this profile
    public Set<EmploymentType> getEmploymentTypeValues() {
        Set<EmploymentType> types = new HashSet<>();
        for (ApplicantSearchProfileEmployment emp : employmentTypes) {
            types.add(emp.getType());
        }
        return types;
    }
}
