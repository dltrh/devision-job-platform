package com.devision.job_manager_payment.service.external.impl;

import com.devision.job_manager_payment.exception.StripeServiceException;
import com.devision.job_manager_payment.service.external.StripeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCancelParams;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class StripeServiceImpl implements StripeService {
    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Override
    public PaymentIntent createPaymentIntent(UUID paymentId, BigDecimal amount, String currency, String email) {
        try {
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue(); // convert to cents

            // Create metadata
            Map<String, String> metadata = new HashMap<>();
            metadata.put("paymentId", paymentId.toString());

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency.toLowerCase())
                    .setReceiptEmail(email)
                    .putAllMetadata(metadata)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            log.info("Created Stripe Payment Intent: {} for payment: {}", paymentIntent.getId(), paymentId);
            return paymentIntent;
        } catch (StripeException e) {
            log.error("Stripe API error while creating payment intent: {}", e.getMessage(), e);
            throw new StripeServiceException("Failed to create payment intent: " + e.getMessage(), e);
        }

    }

    @Override
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            log.info("Retrieved Stripe Payment Intent: {}", paymentIntentId);
            return paymentIntent;
        } catch (StripeException e) {
            log.error("Stripe API error while retrieving payment intent: {}", e.getMessage(), e);
            throw new StripeServiceException("Failed to retrieve payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentIntent cancelPaymentIntent(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = retrievePaymentIntent(paymentIntentId);

            PaymentIntentCancelParams params = PaymentIntentCancelParams
                    .builder()
                    .build();

            PaymentIntent cancelledIntent = paymentIntent.cancel(params);
            log.info("Cancelled Stripe Payment Intent: {}", paymentIntentId);
            return cancelledIntent;
        } catch (StripeException e) {
            log.error("Stripe API error while cancelling payment intent: {}", e.getMessage(), e);
            throw new StripeServiceException("Failed to cancel payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    public Event constructWebhookEvent(String payload, String signature) {
        try {
            Event event = Webhook.constructEvent(payload, signature, webhookSecret);
            log.info("Webhook event verified: {}", event.getType());
            return event;
        } catch (SignatureVerificationException e) {
            log.error("Invalid webhook signature: {}", e.getMessage());
            throw new StripeServiceException("Invalid webhook signature", e);
        }
    }
}
