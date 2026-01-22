package com.devision.job_manager_payment.dto.external;

import com.devision.job_manager_payment.entity.PayerType;
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
public class PaymentCancelledEvent {
    private UUID paymentId;
    private PayerType payerType;
    private UUID payerId;
    private String email;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime cancelledAt;
}
