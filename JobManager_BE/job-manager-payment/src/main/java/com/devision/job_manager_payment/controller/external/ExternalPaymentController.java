package com.devision.job_manager_payment.controller.external;


import com.devision.job_manager_payment.dto.external.PaymentStatusResponse;
import com.devision.job_manager_payment.dto.internal.PaymentResponse;
import com.devision.job_manager_payment.entity.PayerType;
import com.devision.job_manager_payment.service.external.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class ExternalPaymentController {
    private final PaymentService paymentService;
    /**
     * Get payment status for other microservices
     */
    @GetMapping("/{paymentId}/status")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable UUID paymentId) {
        log.info("Get payment status for payment: {}", paymentId);

        PaymentResponse payment = paymentService.getPaymentById(paymentId);

        PaymentStatusResponse response = PaymentStatusResponse.builder()
                .paymentId(payment.getId())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .completedAt(payment.getCompletedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Get payment history for a specific payer
     */
    @GetMapping("/payer/{payerId}/type/{payerType}")
    public ResponseEntity<List<PaymentStatusResponse>> getPaymentsByPayer(
            @PathVariable UUID payerId,
            @PathVariable PayerType payerType) {

        log.info("External request: Get payments for payer: {} ({})", payerId, payerType);

        List<PaymentStatusResponse> responses = paymentService.getPaymentsByPayer(payerId, payerType)
                .stream()
                .map(payment -> PaymentStatusResponse.builder()
                        .paymentId(payment.getId())
                        .status(payment.getStatus())
                        .createdAt(payment.getCreatedAt())
                        .completedAt(payment.getCompletedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
}
