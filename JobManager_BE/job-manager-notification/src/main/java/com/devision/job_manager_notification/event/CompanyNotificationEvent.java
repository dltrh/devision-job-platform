package com.devision.job_manager_notification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyNotificationEvent {

    private UUID companyId;

    private String type;

    private String message;

    private UUID applicantId;

    private UUID searchProfileId;

    private LocalDateTime timestamp;
}
