package com.devision.job_manager_payment.service.external;

import com.devision.job_manager_payment.dto.internal.CreatePaymentRequest;
import com.devision.job_manager_payment.dto.internal.PaymentIntentResponse;
import com.devision.job_manager_payment.dto.internal.PaymentResponse;
import com.devision.job_manager_payment.entity.PayerType;
import com.devision.job_manager_payment.entity.PaymentStatus;

import java.util.List;
import java.util.UUID;

public interface PaymentService {

    /**
     * Create a new payment and Stripe payment intent
     */
    PaymentIntentResponse createPayment(CreatePaymentRequest request);

    /**
     * Get payment by ID
     */
    PaymentResponse getPaymentById(UUID id);

    /**
     * Get all payments
     */
    List<PaymentResponse> getAllPayments();

    /**
     * Get payments by payer (company or applicant)
     */
    List<PaymentResponse> getPaymentsByPayer(UUID payerId, PayerType payerType);

    /**
     * Get payments by email
     */
    List<PaymentResponse> getPaymentsByEmail(String email);

    /**
     * Get payments by status
     */
    List<PaymentResponse> getPaymentsByStatus(PaymentStatus status);

    /**
     * Process webhook from Stripe (payment succeeded/failed)
     */
    void processStripeWebhook(String payload, String signature);

    /**
     * Cancel a pending payment
     */
    PaymentResponse cancelPayment(UUID id);
}
