package com.devision.job_manager_payment.dto.internal;

import com.devision.job_manager_payment.entity.PayerType;
import com.devision.job_manager_payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private UUID id;
    private PayerType payerType;
    private UUID payerId;
    private String email;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String stripePaymentIntentId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String failureReason;
}
