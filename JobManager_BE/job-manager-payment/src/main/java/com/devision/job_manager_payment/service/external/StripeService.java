package com.devision.job_manager_payment.service.external;

import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;

import java.math.BigDecimal;
import java.util.UUID;

public interface StripeService {
    PaymentIntent createPaymentIntent(UUID paymentId, BigDecimal amount, String currency, String email);
    PaymentIntent retrievePaymentIntent(String paymentIntentId);
    PaymentIntent cancelPaymentIntent(String paymentIntentId);
    Event constructWebhookEvent(String payload, String signature);

}
