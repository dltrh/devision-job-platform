package com.devision.job_manager_payment.service.external.impl;

import com.devision.job_manager_payment.dto.external.PaymentCancelledEvent;
import com.devision.job_manager_payment.dto.external.PaymentFailedEvent;
import com.devision.job_manager_payment.dto.internal.CreatePaymentRequest;
import com.devision.job_manager_payment.dto.external.PaymentCompletedEvent;
import com.devision.job_manager_payment.dto.internal.PaymentIntentResponse;
import com.devision.job_manager_payment.dto.internal.PaymentResponse;
import com.devision.job_manager_payment.entity.PayerType;
import com.devision.job_manager_payment.entity.Payment;
import com.devision.job_manager_payment.entity.PaymentStatus;
import com.devision.job_manager_payment.exception.InvalidPaymentStatusException;
import com.devision.job_manager_payment.exception.PaymentNotFoundException;
import com.devision.job_manager_payment.exception.PaymentProcessingException;
import com.devision.job_manager_payment.repository.PaymentRepository;
import com.devision.job_manager_payment.service.external.PaymentEventProducer;
import com.devision.job_manager_payment.service.external.StripeService;
import com.devision.job_manager_payment.service.external.PaymentService;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final StripeService stripeService;
    private final PaymentEventProducer paymentEventProducer;

    /**
     * Create a new payment and Stripe payment intent
     */
    @Override
    @Transactional
    public PaymentIntentResponse createPayment(CreatePaymentRequest request) {
        log.info("Creating payment for payer: {} ({})", request.getPayerId(), request.getPayerType());

        Payment payment = Payment.builder()
                .payerType(request.getPayerType())
                .payerId(request.getPayerId())
                .email(request.getEmail())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .status(PaymentStatus.PENDING)
                .description(request.getDescription())
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment record created with ID: {}", payment.getId());
        log.info("The payer type is {}", payment.getPayerType());

        try {
            // Create Stripe Payment intent
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                    payment.getId(),
                    request.getAmount(),
                    request.getCurrency(),
                    request.getEmail()
            );

            // Add Stripe details to the payment
            payment.setStripePaymentIntentId(paymentIntent.getId());
            payment.setStripeCustomerId(paymentIntent.getCustomer());
            paymentRepository.save(payment);

            log.info("Stripe info has been added to the payment: {}",
                    paymentIntent.getId(), payment.getId());

            return PaymentIntentResponse.builder()
                    .paymentId(payment.getId())
                    .clientSecret(paymentIntent.getClientSecret())
                    .stripePaymentIntentId(paymentIntent.getId())
                    .build();
        } catch (Exception e) {
            // Mark payment as failed
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Failed to create Stripe payment intent: " + e.getMessage());
            paymentRepository.save(payment);

            log.error("Failed to create Stripe payment intent for payment: {}", payment.getId(), e);
            throw new PaymentProcessingException("Failed to create payment intent", e);
        }
    }

    /**
     * Get payment by ID
     */
    @Override
    public PaymentResponse getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException(id));

        return mapToResponse(payment);
    }

    /**
     * Get all payments
     */
    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get payments by payer
     */
    @Override
    public List<PaymentResponse> getPaymentsByPayer(UUID payerId, PayerType payerType) {
        return paymentRepository.findByPayerIdAndPayerType(payerId, payerType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get payments by email
     */
    @Override
    public List<PaymentResponse> getPaymentsByEmail(String email) {
        return paymentRepository.findByEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get payments by status
     */
    @Override
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Process webhook from Stripe (payment succeeded/failed)
     */
    @Override
    public void processStripeWebhook(String payload, String signature) {
        log.info("Processing Stripe webhook");

        try {
            Event event = stripeService.constructWebhookEvent(payload, signature);

            switch (event.getType()) {
                case "payment_intent.succeeded":
                    handlePaymentSucceeded(event);
                    break;

                case "payment_intent.payment_failed":
                    handlePaymentFailed(event);
                    break;

                case "payment_intent.canceled":
                    handlePaymentCanceled(event);
                    break;

                default:
                    log.info("Unhandled event type: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Error processing webhook", e);
            throw new PaymentProcessingException("Failed to process webhook", e);
        }
    }

    /**
     * Cancel a pending payment
     */
    @Override
    public PaymentResponse cancelPayment(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException(id));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new InvalidPaymentStatusException(
                    payment.getStatus(), PaymentStatus.PENDING);
        }

        try {
            // Cancel the payment intent
            stripeService.cancelPaymentIntent(payment.getStripePaymentIntentId());

            // Update the status of payment
            payment.setStatus(PaymentStatus.CANCELLED);
            payment = paymentRepository.save(payment);

            log.info("Payment cancelled: {}", id);

            // Publish Kafka event for subscription servic
            // TODO: Do I need this?
            PaymentCancelledEvent cancelledEvent = PaymentCancelledEvent.builder()
                    .paymentId(payment.getId())
                    .payerType(payment.getPayerType())
                    .payerId(payment.getPayerId())
                    .email(payment.getEmail())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .cancelledAt(LocalDateTime.now())
                    .build();

            paymentEventProducer.publishPaymentCancelled(cancelledEvent);
            return mapToResponse(payment);
        } catch (Exception e) {
            log.error("Failed to cancel payment: {}", id, e);
            throw new PaymentProcessingException("Failed to cancel payment", e);
        }


    }


    /**
     * HELPER METHODS:
     */

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .payerType(payment.getPayerType())
                .payerId(payment.getPayerId())
                .email(payment.getEmail())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .description(payment.getDescription())
                .createdAt(payment.getCreatedAt())
                .completedAt(payment.getCompletedAt())
                .failureReason(payment.getFailureReason())
                .build();
    }

    private void handlePaymentSucceeded(Event event) {
        try {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;

            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            } else {
                // Fallback: try unsafe deserialization
                log.warn("Safe deserialization failed, trying unsafe deserialization");
                stripeObject = dataObjectDeserializer.deserializeUnsafe();
            }


            PaymentIntent paymentIntent = (PaymentIntent) stripeObject;

            String paymentIntentId = paymentIntent.getId();
            log.info("Handling payment succeeded for Stripe Payment Intent: {}", paymentIntentId);

            Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                    .orElseThrow(() -> new PaymentNotFoundException(paymentIntentId));

            // Update Status
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setCompletedAt(LocalDateTime.now());
            payment = paymentRepository.save(payment);

            log.info("Payment completed: {}", payment.getId());

            // Publish Kafka event for subscription service
            log.info("Publishing payment completed event for Subscription Service to consume: {}", payment.getId());

            PaymentCompletedEvent completedEvent = PaymentCompletedEvent.builder()
                    .paymentId(payment.getId())
                    .payerType(payment.getPayerType())
                    .payerId(payment.getPayerId())
                    .email(payment.getEmail())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .completedAt(payment.getCompletedAt())
                    .build();
            paymentEventProducer.publishPaymentCompleted(completedEvent);
        } catch (Exception e) {
            log.error("Error handling payment succeeded event", e);
            throw new PaymentProcessingException("Failed to process payment succeeded event: " + e.getMessage());
        }


    }

    private void handlePaymentFailed(Event event) {

        try {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;

            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            } else {
                // Fallback: try unsafe deserialization
                log.warn("Safe deserialization failed, trying unsafe deserialization");
                stripeObject = dataObjectDeserializer.deserializeUnsafe();
            }

            PaymentIntent paymentIntent = (PaymentIntent) stripeObject;

            String paymentIntentId = paymentIntent.getId();
            log.info("Handling payment failed for Stripe Payment Intent: {}", paymentIntentId);

            Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                    .orElseThrow(() -> new PaymentNotFoundException(paymentIntentId));

            // Update Status
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(paymentIntent.getLastPaymentError() != null ?
                    paymentIntent.getLastPaymentError().getMessage() : "Payment failed with no error message");
            paymentRepository.save(payment);

            log.info("Payment with id {} failed", payment.getId());

            // Publish Kafka event for subscription service
            log.info("Published payment failed event for Subscription Service to consume: {}", payment.getId());
            PaymentFailedEvent failedEvent = PaymentFailedEvent.builder()
                    .paymentId(payment.getId())
                    .payerType(payment.getPayerType())
                    .payerId(payment.getPayerId())
                    .email(payment.getEmail())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .failureReason(payment.getFailureReason())
                    .failedAt(LocalDateTime.now())
                    .build();

            paymentEventProducer.publishPaymentFailed(failedEvent);
        } catch (Exception e) {
            log.error("Error handling payment failed event", e);
            throw new PaymentProcessingException("Failed to process payment failed event: " + e.getMessage());
        }



    }

    private void handlePaymentCanceled(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new PaymentProcessingException("Failed to deserialize payment intent"));

        String paymentIntentId = paymentIntent.getId();
        log.info("Handling payment canceled for Stripe Payment Intent: {}", paymentIntentId);

        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentIntentId));

        // Update payment status
        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        log.info("Payment cancelled: {}", payment.getId());

        // Publish Kafka event
        log.info("Published payment canceled event for Subscription Service to consume: {}", payment.getId());
        PaymentCancelledEvent cancelledEvent = PaymentCancelledEvent.builder()
                .paymentId(payment.getId())
                .payerType(payment.getPayerType())
                .payerId(payment.getPayerId())
                .email(payment.getEmail())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .cancelledAt(LocalDateTime.now())
                .build();

        paymentEventProducer.publishPaymentCancelled(cancelledEvent);

    }
}
