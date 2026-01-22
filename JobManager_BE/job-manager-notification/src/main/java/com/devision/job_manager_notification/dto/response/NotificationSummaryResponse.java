package com.devision.job_manager_notification.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSummaryResponse {
    private long totalNotifications;
    private long unreadCount;
    private long readCount;
    private long archivedCount;
}
