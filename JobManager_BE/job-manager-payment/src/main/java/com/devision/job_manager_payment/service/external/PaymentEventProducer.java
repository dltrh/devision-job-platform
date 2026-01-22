package com.devision.job_manager_payment.service.external;

import com.devision.job_manager_payment.dto.external.PaymentCancelledEvent;
import com.devision.job_manager_payment.dto.external.PaymentCompletedEvent;
import com.devision.job_manager_payment.dto.external.PaymentFailedEvent;

public interface PaymentEventProducer {
    void publishPaymentCompleted(PaymentCompletedEvent event);
    void publishPaymentFailed(PaymentFailedEvent event);
    void publishPaymentCancelled(PaymentCancelledEvent event);
}
