package com.devision.job_manager_payment.dto.external;


import com.devision.job_manager_payment.entity.PaymentStatus;
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
public class PaymentStatusResponse {

    /**
     * This DTO is for checking if the payment is successful or not.
     */
    private UUID paymentId;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
