package com.devision.job_manager_jobpost.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "application_archive",
        uniqueConstraints = @UniqueConstraint(columnNames = {"application_id", "company_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationArchive {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "application_id", nullable = false)
    private UUID applicationId;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "job_post_id", nullable = false)
    private UUID jobPostId;

    @CreationTimestamp
    @Column(name = "archived_at", nullable = false, updatable = false)
    private LocalDateTime archivedAt;
}
