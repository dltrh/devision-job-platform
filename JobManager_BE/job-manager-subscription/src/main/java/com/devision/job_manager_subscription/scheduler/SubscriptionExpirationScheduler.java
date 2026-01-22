package com.devision.job_manager_subscription.scheduler;

import com.devision.job_manager_subscription.model.CompanySubscription;
import com.devision.job_manager_subscription.kafka.SubscriptionEventProducer;
import com.devision.job_manager_subscription.repository.CompanySubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionExpirationScheduler {

    private final CompanySubscriptionRepository subscriptionRepository;
    private final SubscriptionEventProducer eventProducer;

    // Run daily at midnight to check for expiring subscriptions (Requirement 6.1.2)
    @Scheduled(cron = "0 0 0 * * *")
    public void checkExpiringSubscriptions() {
        log.info("Starting scheduled check for expiring subscriptions at {}", LocalDateTime.now());

        int totalSubscriptions = 0;
        int processedSuccessfully = 0;
        int processedWithErrors = 0;
        int skipped = 0;

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime sevenDaysFromNow = now.plusDays(7);

            log.debug("Checking for subscriptions expiring between {} and {}", now, sevenDaysFromNow);

            // Find active subscriptions expiring in 7 days
            List<CompanySubscription> expiringSubscriptions;
            try {
                expiringSubscriptions = subscriptionRepository
                        .findActiveSubscriptionsExpiringBetween(now, sevenDaysFromNow);
            } catch (Exception dbEx) {
                log.error("Database error while fetching expiring subscriptions: {}", dbEx.getMessage(), dbEx);
                throw new RuntimeException("Failed to fetch expiring subscriptions from database", dbEx);
            }

            if (expiringSubscriptions == null) {
                log.warn("Repository returned null for expiring subscriptions. Expected empty list.");
                expiringSubscriptions = List.of();
            }

            totalSubscriptions = expiringSubscriptions.size();
            log.info("Found {} subscriptions expiring in the next 7 days", totalSubscriptions);

            if (totalSubscriptions == 0) {
                log.info("No expiring subscriptions found. Scheduler task completed successfully.");
                return;
            }

            // Process each subscription
            for (CompanySubscription subscription : expiringSubscriptions) {
                try {
                    // Validate subscription object
                    if (subscription == null) {
                        log.warn("Encountered null subscription in list - skipping");
                        skipped++;
                        continue;
                    }

                    if (subscription.getId() == null) {
                        log.warn("Subscription has null ID - skipping");
                        skipped++;
                        continue;
                    }

                    if (subscription.getCompanyId() == null) {
                        log.warn("Subscription {} has null companyId - skipping", subscription.getId());
                        skipped++;
                        continue;
                    }

                    if (subscription.getEndAt() == null) {
                        log.warn("Subscription {} has null endAt date - skipping", subscription.getId());
                        skipped++;
                        continue;
                    }

                    // Calculate days remaining
                    long daysRemaining = ChronoUnit.DAYS.between(now, subscription.getEndAt());

                    log.debug("Subscription {} (company: {}) - Days remaining: {}",
                        subscription.getId(), subscription.getCompanyId(), daysRemaining);

                    // Only send reminder if it's within the 7-day window (allowing for timing variance)
                    if (daysRemaining >= 6 && daysRemaining <= 8) {
                        log.info("Publishing expiring soon event for subscription: {} (company: {}, {} days remaining)",
                                subscription.getId(), subscription.getCompanyId(), daysRemaining);

                        try {
                            eventProducer.publishSubscriptionExpiringSoon(
                                    subscription.getId(),
                                    subscription.getCompanyId(),
                                    "PREMIUM",
                                    subscription.getEndAt(),
                                    (int) daysRemaining
                            );
                            processedSuccessfully++;
                            log.debug("Successfully published expiring soon event for subscription: {}",
                                subscription.getId());

                        } catch (IllegalArgumentException validationEx) {
                            log.error("Validation error publishing expiring soon event for subscription: {}. Error: {}",
                                subscription.getId(), validationEx.getMessage(), validationEx);
                            processedWithErrors++;
                        } catch (Exception kafkaEx) {
                            log.error("Kafka error publishing expiring soon event for subscription: {}. Error: {}",
                                subscription.getId(), kafkaEx.getMessage(), kafkaEx);
                            processedWithErrors++;
                        }
                    } else {
                        log.debug("Subscription {} not in 7-day window (days remaining: {}), skipping notification",
                            subscription.getId(), daysRemaining);
                        skipped++;
                    }

                } catch (NullPointerException npe) {
                    log.error("Null pointer error processing subscription: {}. Error: {}",
                        subscription != null ? subscription.getId() : "unknown", npe.getMessage(), npe);
                    processedWithErrors++;
                } catch (Exception e) {
                    log.error("Unexpected error processing expiring subscription: {}. Error: {}",
                        subscription != null ? subscription.getId() : "unknown", e.getMessage(), e);
                    processedWithErrors++;
                    // Continue with next subscription
                }
            }

            // Log summary
            log.info("Completed scheduled check for expiring subscriptions. Summary - Total: {}, Successful: {}, Errors: {}, Skipped: {}",
                totalSubscriptions, processedSuccessfully, processedWithErrors, skipped);

            if (processedWithErrors > 0) {
                log.warn("Scheduler completed with {} errors. Please review logs for details.", processedWithErrors);
            }

        } catch (RuntimeException rte) {
            log.error("Runtime exception in subscription expiration scheduler: {}", rte.getMessage(), rte);
            throw rte;  // Re-throw to let Spring handle it
        } catch (Exception e) {
            log.error("Critical error in subscription expiration scheduler: {}", e.getMessage(), e);
            // Log final summary even on failure
            log.error("Scheduler failed after processing {} subscriptions ({} successful, {} errors, {} skipped)",
                totalSubscriptions, processedSuccessfully, processedWithErrors, skipped);
        }
    }

    // Run daily to check for expired subscriptions
    @Scheduled(cron = "0 5 0 * * *") // Run at 00:05 AM
    public void checkExpiredSubscriptions() {
        log.info("Starting scheduled check for expired subscriptions at {}", LocalDateTime.now());

        int totalSubscriptions = 0;
        int processedSuccessfully = 0;
        int processedWithErrors = 0;
        int skipped = 0;

        try {
            LocalDateTime now = LocalDateTime.now();

            log.debug("Checking for subscriptions that expired before {}", now);

            // Find subscriptions that have just expired
            List<CompanySubscription> expiredSubscriptions;
            try {
                expiredSubscriptions = subscriptionRepository.findExpiredSubscriptions(now);
            } catch (Exception dbEx) {
                log.error("Database error while fetching expired subscriptions: {}", dbEx.getMessage(), dbEx);
                throw new RuntimeException("Failed to fetch expired subscriptions from database", dbEx);
            }

            if (expiredSubscriptions == null) {
                log.warn("Repository returned null for expired subscriptions. Expected empty list.");
                expiredSubscriptions = List.of();
            }

            totalSubscriptions = expiredSubscriptions.size();
            log.info("Found {} expired subscriptions", totalSubscriptions);

            if (totalSubscriptions == 0) {
                log.info("No expired subscriptions found. Scheduler task completed successfully.");
                return;
            }

            // Process each expired subscription
            for (CompanySubscription subscription : expiredSubscriptions) {
                try {
                    // Validate subscription object
                    if (subscription == null) {
                        log.warn("Encountered null subscription in list - skipping");
                        skipped++;
                        continue;
                    }

                    if (subscription.getId() == null) {
                        log.warn("Subscription has null ID - skipping");
                        skipped++;
                        continue;
                    }

                    if (subscription.getCompanyId() == null) {
                        log.warn("Subscription {} has null companyId - skipping", subscription.getId());
                        skipped++;
                        continue;
                    }

                    if (subscription.getStartAt() == null) {
                        log.warn("Subscription {} has null startAt date - skipping", subscription.getId());
                        skipped++;
                        continue;
                    }

                    if (subscription.getEndAt() == null) {
                        log.warn("Subscription {} has null endAt date - skipping", subscription.getId());
                        skipped++;
                        continue;
                    }

                    // Verify subscription is actually expired
                    if (subscription.getEndAt().isAfter(now)) {
                        log.warn("Subscription {} is not actually expired (endAt: {}, now: {}) - skipping",
                            subscription.getId(), subscription.getEndAt(), now);
                        skipped++;
                        continue;
                    }

                    log.info("Publishing expired event for subscription: {} (company: {}, expired at: {})",
                            subscription.getId(), subscription.getCompanyId(), subscription.getEndAt());

                    try {
                        eventProducer.publishSubscriptionExpired(
                                subscription.getId(),
                                subscription.getCompanyId(),
                                "PREMIUM",
                                subscription.getStartAt(),
                                subscription.getEndAt(),
                                "NATURAL_EXPIRY"
                        );
                        processedSuccessfully++;
                        log.debug("Successfully published expired event for subscription: {}",
                            subscription.getId());

                        // Optionally update subscription status to EXPIRED
                        // This is commented out for now, but can be enabled if needed
                        // try {
                        //     subscription.setStatus(SubscriptionStatus.EXPIRED);
                        //     subscriptionRepository.save(subscription);
                        //     log.debug("Updated subscription status to EXPIRED for: {}", subscription.getId());
                        // } catch (Exception updateEx) {
                        //     log.error("Failed to update subscription status for: {}. Error: {}",
                        //         subscription.getId(), updateEx.getMessage(), updateEx);
                        // }

                    } catch (IllegalArgumentException validationEx) {
                        log.error("Validation error publishing expired event for subscription: {}. Error: {}",
                            subscription.getId(), validationEx.getMessage(), validationEx);
                        processedWithErrors++;
                    } catch (Exception kafkaEx) {
                        log.error("Kafka error publishing expired event for subscription: {}. Error: {}",
                            subscription.getId(), kafkaEx.getMessage(), kafkaEx);
                        processedWithErrors++;
                    }

                } catch (NullPointerException npe) {
                    log.error("Null pointer error processing expired subscription: {}. Error: {}",
                        subscription != null ? subscription.getId() : "unknown", npe.getMessage(), npe);
                    processedWithErrors++;
                } catch (Exception e) {
                    log.error("Unexpected error processing expired subscription: {}. Error: {}",
                        subscription != null ? subscription.getId() : "unknown", e.getMessage(), e);
                    processedWithErrors++;
                    // Continue with next subscription
                }
            }

            // Log summary
            log.info("Completed scheduled check for expired subscriptions. Summary - Total: {}, Successful: {}, Errors: {}, Skipped: {}",
                totalSubscriptions, processedSuccessfully, processedWithErrors, skipped);

            if (processedWithErrors > 0) {
                log.warn("Scheduler completed with {} errors. Please review logs for details.", processedWithErrors);
            }

        } catch (RuntimeException rte) {
            log.error("Runtime exception in expired subscription scheduler: {}", rte.getMessage(), rte);
            throw rte;  // Re-throw to let Spring handle it
        } catch (Exception e) {
            log.error("Critical error in expired subscription scheduler: {}", e.getMessage(), e);
            // Log final summary even on failure
            log.error("Scheduler failed after processing {} subscriptions ({} successful, {} errors, {} skipped)",
                totalSubscriptions, processedSuccessfully, processedWithErrors, skipped);
        }
    }
}
