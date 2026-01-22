package com.devision.job_manager_payment.exception;

import com.devision.job_manager_payment.entity.PaymentStatus;

public class InvalidPaymentStatusException extends RuntimeException {
    public InvalidPaymentStatusException(PaymentStatus currentStatus, PaymentStatus requiredStatus) {
        super(String.format("Invalid payment status. Current: %s, Required: %s",
                currentStatus, requiredStatus));
    }

    public InvalidPaymentStatusException(String message) {
        super(message);
    }
}
