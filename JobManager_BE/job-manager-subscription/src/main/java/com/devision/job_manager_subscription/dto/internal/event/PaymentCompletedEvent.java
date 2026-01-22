package com.devision.job_manager_subscription.dto.internal.event;

import com.devision.job_manager_subscription.model.PayerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentCompletedEvent {

    private UUID paymentId;
    private PayerType payerType;
    private UUID payerId;
    private String email;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime completedAt;
}
