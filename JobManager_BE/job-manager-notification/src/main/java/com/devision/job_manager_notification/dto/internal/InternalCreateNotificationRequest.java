package com.devision.job_manager_notification.dto.internal;

import com.devision.job_manager_notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternalCreateNotificationRequest {

    private UUID userId;
    private NotificationType type;
    private String title;
    private String message;
    private String referenceId;
    private String referenceType;
    private String metadata;
}
