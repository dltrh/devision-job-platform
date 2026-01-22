//package com.devision.job_manager_jobpost.consumer;
//
//import com.devision.job_manager_jobpost.event.CompanyCountryChangedEvent;
//import com.devision.job_manager_jobpost.event.JobPostCountryChangedEvent;
//import com.devision.job_manager_jobpost.model.JobPost;
//import com.devision.job_manager_jobpost.model.JobPostSkill;
//import com.devision.job_manager_jobpost.repository.JobPostRepository;
//import com.devision.job_manager_jobpost.service.internal.EventPublisherService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.kafka.support.Acknowledgment;
//import org.springframework.kafka.support.KafkaHeaders;
//import org.springframework.messaging.handler.annotation.Header;
//import org.springframework.messaging.handler.annotation.Payload;
//import org.springframework.stereotype.Component;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//
///**
// * Kafka consumer for company country change events.
// *
// * When a company's country is changed in the Company service, this consumer:
// * 1. Receives the CompanyCountryChangedEvent from the "company.country.changed" topic
// * 2. Finds all job posts belonging to that company
// * 3. Publishes a JobPostCountryChangedEvent for each affected job post
// *
// * This enables Ultimo 4.3.1 requirement: Instant notifications to applicants
// * when job location criteria change.
// */
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class CompanyCountryChangeConsumer {
//
//    private final JobPostRepository jobPostRepository;
//    private final EventPublisherService eventPublisher;
//
//    /**
//     * Handle company country change events.
//     * This method is triggered when the Company service publishes a country change event.
//     *
//     * @param event The company country changed event
//     * @param topic The Kafka topic name
//     * @param offset The Kafka message offset
//     * @param acknowledgment Kafka acknowledgment for manual commit
//     */
//    @KafkaListener(
//            topics = "company.country.changed",
//            groupId = "${spring.kafka.consumer.group-id}",
//            containerFactory = "kafkaListenerContainerFactory"
//    )
//    public void handleCompanyCountryChange(
//            @Payload(required = false) CompanyCountryChangedEvent event,
//            @Header(value = KafkaHeaders.RECEIVED_TOPIC, required = false) String topic,
//            @Header(value = KafkaHeaders.OFFSET, required = false) Long offset,
//            Acknowledgment acknowledgment) {
//
//        if (event == null) {
//            log.error("Received null CompanyCountryChangedEvent from topic: {}, offset: {}. Skipping message.",
//                    topic, offset);
//            if (acknowledgment != null) {
//                acknowledgment.acknowledge();
//            }
//            return;
//        }
//
//        log.info("Received CompanyCountryChangedEvent for company ID: {} from topic: {}, offset: {}. " +
//                        "Country changed from {} to {}",
//                event.getCompanyId(), topic, offset,
//                event.getPreviousCountryCode(), event.getNewCountryCode());
//
//        try {
//            // Find all job posts for this company
//            List<JobPost> jobPosts = jobPostRepository.findByCompanyId(event.getCompanyId());
//
//            if (jobPosts.isEmpty()) {
//                log.info("No job posts found for company ID: {}. No events to publish.",
//                        event.getCompanyId());
//                if (acknowledgment != null) {
//                    acknowledgment.acknowledge();
//                }
//                return;
//            }
//
//            log.info("Found {} job posts for company ID: {}. Publishing country change events...",
//                    jobPosts.size(), event.getCompanyId());
//
//            // Publish JobPostCountryChangedEvent for each affected job post
//            int publishedCount = 0;
//            for (JobPost jobPost : jobPosts) {
//                try {
//                    // Extract current skills for applicant matching
//                    List<UUID> currentSkills = jobPost.getSkills().stream()
//                            .map(JobPostSkill::getSkillId)
//                            .toList();
//
//                    JobPostCountryChangedEvent jobPostEvent = JobPostCountryChangedEvent.builder()
//                            .jobPostId(jobPost.getJobPostId())
//                            .companyId(event.getCompanyId())
//                            .title(jobPost.getTitle())
//                            .locationCity(jobPost.getLocationCity())
//                            .previousCountryCode(event.getPreviousCountryCode())
//                            .newCountryCode(event.getNewCountryCode())
//                            .currentSkills(currentSkills)
//                            .changedAt(LocalDateTime.now())
//                            .build();
//
//                    eventPublisher.publishJobPostCountryChanged(jobPostEvent);
//                    publishedCount++;
//
//                    log.debug("Published JobPostCountryChangedEvent for job post ID: {} ({})",
//                            jobPost.getJobPostId(), jobPost.getTitle());
//
//                } catch (Exception e) {
//                    log.error("Failed to publish JobPostCountryChangedEvent for job post ID: {}. Error: {}",
//                            jobPost.getJobPostId(), e.getMessage(), e);
//                    // Continue processing other job posts
//                }
//            }
//
//            log.info("Successfully published {} JobPostCountryChangedEvents for company ID: {}",
//                    publishedCount, event.getCompanyId());
//
//            if (acknowledgment != null) {
//                acknowledgment.acknowledge();
//            }
//
//        } catch (Exception e) {
//            log.error("Failed to process CompanyCountryChangedEvent for company ID: {}. Error: {}",
//                    event.getCompanyId(), e.getMessage(), e);
//            if (acknowledgment != null) {
//                acknowledgment.acknowledge(); // Acknowledge to skip the bad message and continue
//            }
//        }
//    }
//}
