package com.devision.job_manager_payment.dto.internal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentIntentResponse {
    /**
     * The frontend only needs these data
     */

    private UUID paymentId;
    private String clientSecret; // Stripe's client secret for frontend
    private String stripePaymentIntentId;

}

