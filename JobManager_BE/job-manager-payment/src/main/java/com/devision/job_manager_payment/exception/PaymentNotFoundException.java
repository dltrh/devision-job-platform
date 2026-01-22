package com.devision.job_manager_payment.exception;

import java.util.UUID;

public class PaymentNotFoundException extends RuntimeException {
    public PaymentNotFoundException(UUID id) {
        super("Payment not found with id: " + id);
    }

    public PaymentNotFoundException(String stripePaymentIntentId) {
        super("Payment not found with Stripe Payment Intent ID: " + stripePaymentIntentId);
    }
}
