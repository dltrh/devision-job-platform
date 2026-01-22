package com.devision.job_manager_subscription.controller.external;

import com.devision.job_manager_subscription.dto.internal.response.ApiResponse;
import com.devision.job_manager_subscription.dto.external.SubscriptionStatusResponse;
import com.devision.job_manager_subscription.model.CompanySubscription;
import com.devision.job_manager_subscription.repository.CompanySubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class ExternalSubscriptionController {

    private final CompanySubscriptionRepository subscriptionRepository;

    /**
     * Get subscription status for a company.
     * This is the main endpoint used by other services to check premium status.
     *
     * Response includes:
     * - companyId: the company UUID
     * - status: current subscription status
     * - endAt: subscription end date (null if indefinite)
     * - isPremium: computed premium status (true if ACTIVE and not expired)
     */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<SubscriptionStatusResponse>> getSubscriptionStatus(
            @PathVariable UUID companyId) {
        
        SubscriptionStatusResponse response = subscriptionRepository.findByCompanyId(companyId)
                .map(SubscriptionStatusResponse::fromEntity)
                .orElse(SubscriptionStatusResponse.notPremium(companyId));

        return ResponseEntity.ok(ApiResponse.success("Subscription status retrieved", response));
    }

    /**
     * Quick check if a company is premium.
     * Returns a simple boolean response for efficient validation.
     */
    @GetMapping("/company/{companyId}/is-premium")
    public ResponseEntity<ApiResponse<Boolean>> isPremium(@PathVariable UUID companyId) {
        boolean isPremium = subscriptionRepository.findByCompanyId(companyId)
                .map(CompanySubscription::isPremium)
                .orElse(false);

        return ResponseEntity.ok(ApiResponse.success("Premium status checked", isPremium));
    }
}
