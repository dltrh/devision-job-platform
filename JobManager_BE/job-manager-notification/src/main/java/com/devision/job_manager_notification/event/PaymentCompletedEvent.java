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
public class PaymentCompletedEvent {

    private UUID paymentId;
    private UUID companyId;
    private String paymentType;
    private Double amount;
    private String currency;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime completedAt;
    private LocalDateTime eventTimestamp;
    private String eventSource;
}
