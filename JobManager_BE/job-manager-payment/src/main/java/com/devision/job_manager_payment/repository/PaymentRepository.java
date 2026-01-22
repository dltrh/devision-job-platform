package com.devision.job_manager_payment.repository;

import com.devision.job_manager_payment.entity.PayerType;
import com.devision.job_manager_payment.entity.Payment;
import com.devision.job_manager_payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByPayerIdAndPayerType(UUID payerId, PayerType payerType);

    // Find payment by Stripe Payment Intent ID
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    // Find all payments by email (for transaction history)
    List<Payment> findByEmail(String email);

    // Find all payments by status
    List<Payment> findByStatus(PaymentStatus status);

    // Find all payments by payer type (all companies or all applicants)
    List<Payment> findByPayerType(PayerType payerType);

    // Find payments by payerId, payerType, and status
    List<Payment> findByPayerIdAndPayerTypeAndStatus(UUID payerId, PayerType payerType, PaymentStatus status);

}
