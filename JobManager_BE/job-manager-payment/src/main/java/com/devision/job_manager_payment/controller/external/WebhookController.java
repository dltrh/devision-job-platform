package com.devision.job_manager_payment.controller.external;

import com.devision.job_manager_payment.service.external.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {
    private final PaymentService paymentService;

    /**
     * Stripe webhook endpoint
     * Stripe sends POST requests to this endpoint when payment events occur
     */
    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        log.info("Received Stripe webhook");

        try {
            paymentService.processStripeWebhook(payload, signature);
            return ResponseEntity.ok("Webhook processed successfully");

        } catch (Exception e) {
            log.error("Error processing Stripe webhook", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Webhook processing failed: " + e.getMessage());
        }
    }
}
