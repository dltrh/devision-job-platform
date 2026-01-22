package com.devision.job_manager_subscription.controller.internal;

import com.devision.job_manager_subscription.dto.internal.response.ApiResponse;
import com.devision.job_manager_subscription.dto.internal.request.CreateSubscriptionRequest;
import com.devision.job_manager_subscription.dto.internal.response.SubscriptionResponse;
import com.devision.job_manager_subscription.dto.internal.request.UpdateSubscriptionRequest;
import com.devision.job_manager_subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/subscriptions")
@RequiredArgsConstructor
public class InternalSubscriptionController {

    private final SubscriptionService subscriptionService;

    // Get all subscriptions (admin)
    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getAll() {
        List<SubscriptionResponse> subscriptions = subscriptionService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved", subscriptions));
    }

    // Get subscription by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getById(@PathVariable UUID id) {
        SubscriptionResponse subscription = subscriptionService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription retrieved", subscription));
    }

    // Get subscription by company ID
    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getByCompanyId(@PathVariable UUID companyId) {
        SubscriptionResponse subscription = subscriptionService.getByCompanyId(companyId);
        return ResponseEntity.ok(ApiResponse.success("Subscription retrieved", subscription));
    }

    // Get all subscriptions for a company
    @GetMapping("/company/{companyId}/all")
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getAllByCompanyId(@PathVariable UUID companyId) {
        List<SubscriptionResponse> subscriptions = subscriptionService.getAllByCompanyId(companyId);
        return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved", subscriptions));
    }

    // Check if a company is premium
    @GetMapping("/company/{companyId}/premium")
    public ResponseEntity<ApiResponse<Boolean>> isPremium(@PathVariable UUID companyId) {
        boolean isPremium = subscriptionService.isPremium(companyId);
        return ResponseEntity.ok(ApiResponse.success("Premium status checked", isPremium));
    }

    // Create a new subscription
    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionResponse>> create(
            @Valid @RequestBody CreateSubscriptionRequest request) {
        SubscriptionResponse subscription = subscriptionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription created", subscription));
    }

    // Update an existing subscription
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSubscriptionRequest request) {
        SubscriptionResponse subscription = subscriptionService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription updated", subscription));
    }

    // Activate a subscription
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> activate(@PathVariable UUID id) {
        SubscriptionResponse subscription = subscriptionService.activate(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription activated", subscription));
    }

    // Deactivate a subscription
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> deactivate(@PathVariable UUID id) {
        SubscriptionResponse subscription = subscriptionService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription deactivated", subscription));
    }

    // Cancel a subscription
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> cancel(@PathVariable UUID id) {
        SubscriptionResponse subscription = subscriptionService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled", subscription));
    }

    // Delete a subscription
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        subscriptionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription deleted", null));
    }
}
