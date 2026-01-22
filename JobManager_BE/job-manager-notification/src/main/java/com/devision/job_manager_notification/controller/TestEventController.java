package com.devision.job_manager_notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Test controller for manually publishing Kafka events to test notification listeners.
 * ⚠️ FOR TESTING ONLY - Should be removed or secured in production
 */
@RestController
@RequestMapping("/api/test/events")
@RequiredArgsConstructor
@Slf4j
public class TestEventController {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Test job post published event
     *
     * POST http://localhost:8087/api/test/events/jobpost/published
     * Body: {
     *   "jobPostId": "6810de01-b8ed-45b5-8953-af73bfddc489",
     *   "companyId": "6808a20f-1ab3-45c3-8b87-a7e40c9f77a6",
     *   "title": "Test Job Post"
     * }
     */
    @PostMapping("/jobpost/published")
    public Map<String, Object> publishJobPostPublished(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String jobPostId = (String) request.getOrDefault("jobPostId", UUID.randomUUID().toString());
            String companyId = (String) request.getOrDefault("companyId", UUID.randomUUID().toString());
            String title = (String) request.getOrDefault("title", "Test Job Post");

            Map<String, Object> event = new HashMap<>();
            event.put("jobPostId", jobPostId);
            event.put("companyId", companyId);
            event.put("title", title);
            event.put("description", "This is a test job post for notification testing");
            event.put("locationCity", "Ho Chi Minh City");
            event.put("countryCode", "VN");
            event.put("salaryType", "MONTHLY");
            event.put("salaryMin", 2000.0);
            event.put("salaryMax", 4000.0);
            event.put("employmentTypes", Arrays.asList("FULL_TIME"));
            event.put("fresher", false);
            event.put("skillIds", Arrays.asList());
            event.put("publishedAt", LocalDateTime.now());
            event.put("expiryAt", LocalDateTime.now().plusDays(30));

            kafkaTemplate.send("jobpost.published", jobPostId, event);

            log.info("Published test job post published event for jobPostId: {}, companyId: {}",
                    jobPostId, companyId);

            return Map.of(
                    "status", "success",
                    "message", "Job post published event sent to Kafka",
                    "topic", "jobpost.published",
                    "jobPostId", jobPostId,
                    "companyId", companyId
            );
        } catch (Exception e) {
            log.error("Error publishing test event", e);
            return Map.of(
                    "status", "error",
                    "message", e.getMessage()
            );
        }
    }

    /**
     * Test job post updated event
     */
    @PostMapping("/jobpost/updated")
    public Map<String, Object> publishJobPostUpdated(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String jobPostId = (String) request.getOrDefault("jobPostId", UUID.randomUUID().toString());
            String companyId = (String) request.getOrDefault("companyId", UUID.randomUUID().toString());
            String title = (String) request.getOrDefault("title", "Updated Test Job Post");

            Map<String, Object> event = new HashMap<>();
            event.put("jobPostId", jobPostId);
            event.put("companyId", companyId);
            event.put("title", title);
            event.put("updatedAt", LocalDateTime.now());

            kafkaTemplate.send("jobpost.updated", jobPostId, event);

            log.info("Published test job post updated event for jobPostId: {}", jobPostId);

            return Map.of(
                    "status", "success",
                    "message", "Job post updated event sent to Kafka",
                    "topic", "jobpost.updated",
                    "jobPostId", jobPostId
            );
        } catch (Exception e) {
            log.error("Error publishing test event", e);
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    /**
     * Test job post expired event
     */
    @PostMapping("/jobpost/expired")
    public Map<String, Object> publishJobPostExpired(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String jobPostId = (String) request.getOrDefault("jobPostId", UUID.randomUUID().toString());
            String companyId = (String) request.getOrDefault("companyId", UUID.randomUUID().toString());
            String title = (String) request.getOrDefault("title", "Expired Test Job Post");

            Map<String, Object> event = new HashMap<>();
            event.put("jobPostId", jobPostId);
            event.put("companyId", companyId);
            event.put("title", title);
            event.put("expiredAt", LocalDateTime.now());

            kafkaTemplate.send("jobpost.expired", jobPostId, event);

            log.info("Published test job post expired event for jobPostId: {}", jobPostId);

            return Map.of(
                    "status", "success",
                    "message", "Job post expired event sent to Kafka",
                    "topic", "jobpost.expired",
                    "jobPostId", jobPostId
            );
        } catch (Exception e) {
            log.error("Error publishing test event", e);
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    /**
     * Test job post skills changed event (CRITICAL for Ultimo)
     */
    @PostMapping("/jobpost/skills-changed")
    public Map<String, Object> publishJobPostSkillsChanged(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String jobPostId = (String) request.getOrDefault("jobPostId", UUID.randomUUID().toString());
            String companyId = (String) request.getOrDefault("companyId", UUID.randomUUID().toString());
            String title = (String) request.getOrDefault("title", "Test Job Post - Skills Changed");

            Map<String, Object> event = new HashMap<>();
            event.put("jobPostId", jobPostId);
            event.put("companyId", companyId);
            event.put("title", title);
            event.put("addedSkills", Arrays.asList("Java", "Spring Boot"));
            event.put("removedSkills", Arrays.asList("PHP"));
            event.put("currentSkills", Arrays.asList("Java", "Spring Boot", "Microservices"));

            kafkaTemplate.send("jobpost.skills.changed", jobPostId, event);

            log.info("Published test job post skills changed event for jobPostId: {}", jobPostId);

            return Map.of(
                    "status", "success",
                    "message", "Job post skills changed event sent to Kafka",
                    "topic", "jobpost.skills.changed",
                    "jobPostId", jobPostId
            );
        } catch (Exception e) {
            log.error("Error publishing test event", e);
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    /**
     * Test job post country changed event (CRITICAL for Ultimo)
     */
    @PostMapping("/jobpost/country-changed")
    public Map<String, Object> publishJobPostCountryChanged(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String jobPostId = (String) request.getOrDefault("jobPostId", UUID.randomUUID().toString());
            String companyId = (String) request.getOrDefault("companyId", UUID.randomUUID().toString());
            String title = (String) request.getOrDefault("title", "Test Job Post - Location Changed");

            Map<String, Object> event = new HashMap<>();
            event.put("jobPostId", jobPostId);
            event.put("companyId", companyId);
            event.put("title", title);
            event.put("previousCountryCode", "VN");
            event.put("newCountryCode", "SG");
            event.put("previousLocationCity", "Ho Chi Minh City");
            event.put("newLocationCity", "Singapore");

            kafkaTemplate.send("jobpost.country.changed", jobPostId, event);

            log.info("Published test job post country changed event for jobPostId: {}", jobPostId);

            return Map.of(
                    "status", "success",
                    "message", "Job post country changed event sent to Kafka",
                    "topic", "jobpost.country.changed",
                    "jobPostId", jobPostId
            );
        } catch (Exception e) {
            log.error("Error publishing test event", e);
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    /**
     * Test subscription renewal event
     */
    @PostMapping("/subscription/renewed")
    public Map<String, Object> publishSubscriptionRenewed(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String companyId = (String) request.getOrDefault("companyId", UUID.randomUUID().toString());

            Map<String, Object> event = new HashMap<>();
            event.put("companyId", companyId);
            event.put("status", "ACTIVE");
            event.put("isPremium", true);
            event.put("endAt", LocalDateTime.now().plusMonths(1));
            event.put("subscriptionType", "PREMIUM");

            kafkaTemplate.send("company.subscription.updated", companyId, event);

            log.info("Published test subscription renewal event for companyId: {}", companyId);

            return Map.of(
                    "status", "success",
                    "message", "Subscription renewal event sent to Kafka",
                    "topic", "company.subscription.updated",
                    "companyId", companyId
            );
        } catch (Exception e) {
            log.error("Error publishing test event", e);
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    /**
     * Test subscription cancelled event
     */
    @PostMapping("/subscription/cancelled")
    public Map<String, Object> publishSubscriptionCancelled(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String companyId = (String) request.getOrDefault("companyId", UUID.randomUUID().toString());

            Map<String, Object> event = new HashMap<>();
            event.put("companyId", companyId);
            event.put("status", "CANCELLED");
            event.put("isPremium", false);
            event.put("cancelledAt", LocalDateTime.now());

            kafkaTemplate.send("company.subscription.updated", companyId, event);

            log.info("Published test subscription cancelled event for companyId: {}", companyId);

            return Map.of(
                    "status", "success",
                    "message", "Subscription cancelled event sent to Kafka",
                    "topic", "company.subscription.updated",
                    "companyId", companyId
            );
        } catch (Exception e) {
            log.error("Error publishing test event", e);
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    /**
     * Publish all job post events at once for comprehensive testing
     */
    @PostMapping("/jobpost/publish-all")
    public Map<String, Object> publishAllJobPostEvents(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String jobPostId = (String) request.getOrDefault("jobPostId", UUID.randomUUID().toString());
            String companyId = (String) request.getOrDefault("companyId", UUID.randomUUID().toString());

            List<String> published = new ArrayList<>();

            // Published
            publishJobPostPublished(Map.of("jobPostId", jobPostId, "companyId", companyId, "title", "Test Job - Published"));
            published.add("jobpost.published");

            Thread.sleep(1000);

            // Updated
            publishJobPostUpdated(Map.of("jobPostId", jobPostId, "companyId", companyId, "title", "Test Job - Updated"));
            published.add("jobpost.updated");

            Thread.sleep(1000);

            // Skills Changed
            publishJobPostSkillsChanged(Map.of("jobPostId", jobPostId, "companyId", companyId));
            published.add("jobpost.skills.changed");

            Thread.sleep(1000);

            // Country Changed
            publishJobPostCountryChanged(Map.of("jobPostId", jobPostId, "companyId", companyId));
            published.add("jobpost.country.changed");

            Thread.sleep(1000);

            // Expired
            publishJobPostExpired(Map.of("jobPostId", jobPostId, "companyId", companyId));
            published.add("jobpost.expired");

            log.info("Published all test events for jobPostId: {}, companyId: {}", jobPostId, companyId);

            return Map.of(
                    "status", "success",
                    "message", "All job post events sent to Kafka",
                    "eventsPublished", published,
                    "jobPostId", jobPostId,
                    "companyId", companyId,
                    "note", "Check notification service logs and database for notifications"
            );
        } catch (Exception e) {
            log.error("Error publishing test events", e);
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "ok",
                "message", "Test event controller is ready",
                "availableEndpoints", Arrays.asList(
                        "POST /api/test/events/jobpost/published",
                        "POST /api/test/events/jobpost/updated",
                        "POST /api/test/events/jobpost/expired",
                        "POST /api/test/events/jobpost/skills-changed",
                        "POST /api/test/events/jobpost/country-changed",
                        "POST /api/test/events/subscription/renewed",
                        "POST /api/test/events/subscription/cancelled",
                        "POST /api/test/events/jobpost/publish-all"
                )
        );
    }
}
