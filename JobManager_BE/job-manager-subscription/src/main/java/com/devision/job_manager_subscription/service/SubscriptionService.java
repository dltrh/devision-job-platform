package com.devision.job_manager_subscription.service;

import com.devision.job_manager_subscription.dto.internal.request.CreateSubscriptionRequest;
import com.devision.job_manager_subscription.dto.internal.response.SubscriptionResponse;
import com.devision.job_manager_subscription.dto.internal.request.UpdateSubscriptionRequest;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {

    /**
     * Checks if a company currently has premium access.
     *
     * @param companyId the company UUID
     * @return true if the company has an active, non-expired subscription
     */
    boolean isPremium(UUID companyId);

    /**
     * Gets the subscription for a company by company ID.
     *
     * @param companyId the company UUID
     * @return the subscription response
     */
    SubscriptionResponse getByCompanyId(UUID companyId);

    /**
     * Gets all subscriptions for a company by company ID.
     *
     * @param companyId the company UUID
     * @return list of all subscriptions for the company
     */
    List<SubscriptionResponse> getAllByCompanyId(UUID companyId);

    /**
     * Gets a subscription by its ID.
     *
     * @param id the subscription UUID
     * @return the subscription response
     */
    SubscriptionResponse getById(UUID id);

    /**
     * Gets all subscriptions (for admin purposes).
     *
     * @return list of all subscriptions
     */
    List<SubscriptionResponse> getAll();

    /**
     * Creates a new subscription for a company.
     *
     * @param request the create request
     * @return the created subscription response
     */
    SubscriptionResponse create(CreateSubscriptionRequest request);

    /**
     * Updates an existing subscription.
     *
     * @param id the subscription UUID
     * @param request the update request
     * @return the updated subscription response
     */
    SubscriptionResponse update(UUID id, UpdateSubscriptionRequest request);

    /**
     * Activates a subscription.
     *
     * @param id the subscription UUID
     * @return the updated subscription response
     */
    SubscriptionResponse activate(UUID id);

    /**
     * Deactivates a subscription.
     *
     * @param id the subscription UUID
     * @return the updated subscription response
     */
    SubscriptionResponse deactivate(UUID id);

    /**
     * Cancels a subscription.
     *
     * @param id the subscription UUID
     * @return the updated subscription response
     */
    SubscriptionResponse cancel(UUID id);

    /**
     * Deletes a subscription.
     *
     * @param id the subscription UUID
     */
    void delete(UUID id);
}
