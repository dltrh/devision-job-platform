package com.devision.job_manager_payment.controller.internal;


import com.devision.job_manager_payment.dto.internal.ApiResponse;
import com.devision.job_manager_payment.dto.internal.CreatePaymentRequest;
import com.devision.job_manager_payment.dto.internal.PaymentIntentResponse;
import com.devision.job_manager_payment.dto.internal.PaymentResponse;
import com.devision.job_manager_payment.entity.PayerType;
import com.devision.job_manager_payment.entity.PaymentStatus;
import com.devision.job_manager_payment.service.external.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/payment")
@RequiredArgsConstructor
@Slf4j
public class InternalPaymentController {
    private final PaymentService paymentService;

    /**
     * Create a new payment
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentIntentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request) {

        log.info("Creating payment for payer: {} ({})", request.getPayerId(), request.getPayerType());

        PaymentIntentResponse response = paymentService.createPayment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment created successfully", response));
    }

    /**
     * Get payment by ID
     */
    @GetMapping("/{paymentID}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable UUID paymentID) {
        log.info("Getting payment by ID: {}", paymentID);

        PaymentResponse response = paymentService.getPaymentById(paymentID);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all payments
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        log.info("Getting all payments");

        List<PaymentResponse> responses = paymentService.getAllPayments();

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * Get payments by payer
     */
    @GetMapping("/payer/{payerId}/type/{payerType}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByPayer(
            @PathVariable UUID payerId,
            @PathVariable PayerType payerType) {

        log.info("Getting payments for payer: {} ({})", payerId, payerType);

        List<PaymentResponse> responses = paymentService.getPaymentsByPayer(payerId, payerType);

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * Get payments by email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByEmail(
            @PathVariable String email) {

        log.info("Getting payments for email: {}", email);

        List<PaymentResponse> responses = paymentService.getPaymentsByEmail(email);

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * Get payments by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByStatus(
            @PathVariable PaymentStatus status) {

        log.info("Getting payments by status: {}", status);

        List<PaymentResponse> responses = paymentService.getPaymentsByStatus(status);

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * Cancel a pending payment
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<PaymentResponse>> cancelPayment(@PathVariable UUID id) {
        log.info("Cancelling payment: {}", id);

        PaymentResponse response = paymentService.cancelPayment(id);

        return ResponseEntity.ok(ApiResponse.success("Payment cancelled successfully", response));
    }
}
