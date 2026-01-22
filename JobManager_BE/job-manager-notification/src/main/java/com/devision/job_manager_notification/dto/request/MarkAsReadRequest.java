package com.devision.job_manager_notification.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkAsReadRequest {

    @NotNull(message = "Notification ID is required")
    private UUID notificationId;
}
