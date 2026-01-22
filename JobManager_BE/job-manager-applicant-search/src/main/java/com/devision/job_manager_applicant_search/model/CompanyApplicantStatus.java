package com.devision.job_manager_applicant_search.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a company's status assignment for an applicant.
 * Each company can mark applicants as FAVORITE or WARNING.
 */
@Entity
@Table(name = "company_applicant_status", indexes = {
    @Index(name = "idx_cas_company_id", columnList = "company_id"),
    @Index(name = "idx_cas_applicant_id", columnList = "applicant_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_company_applicant", columnNames = {"company_id", "applicant_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyApplicantStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "applicant_id", nullable = false)
    private UUID applicantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ApplicantStatusType status;

    @Column(name = "note", length = 500)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
