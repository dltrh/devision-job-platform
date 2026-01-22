package com.devision.job_manager_notification.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAccountLockedEvent {
    private UUID companyId;
    private String email;
    private String reason;
    private LocalDateTime lockedAt;
}
