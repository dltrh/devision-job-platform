package com.devision.job_manager_notification.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Utility class for logging Kafka consumer metrics and performance statistics.
 * Tracks message processing times, success/failure rates, and throughput.
 */
@Slf4j
@Component
public class KafkaMetricsLogger {

    private static final String METRICS_PREFIX = "[KAFKA_METRICS]";

    // Track message counts per topic
    private final Map<String, AtomicLong> topicMessageCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> topicSuccessCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> topicErrorCounts = new ConcurrentHashMap<>();

    // Track processing times per topic
    private final Map<String, AtomicLong> topicProcessingTimeMs = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> topicMinProcessingTimeMs = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> topicMaxProcessingTimeMs = new ConcurrentHashMap<>();

    // Track partition-specific metrics
    private final Map<String, Map<Integer, AtomicLong>> partitionMessageCounts = new ConcurrentHashMap<>();

    /**
     * Records the start of message processing.
     *
     * @param topic the Kafka topic
     * @param partition the partition number
     * @param offset the message offset
     * @return the start time for calculating processing duration
     */
    public LocalDateTime recordMessageProcessingStart(String topic, int partition, long offset) {
        LocalDateTime startTime = LocalDateTime.now();

        log.debug("{} Started processing message - Topic: {}, Partition: {}, Offset: {}, Timestamp: {}",
                METRICS_PREFIX, topic, partition, offset, startTime);

        // Increment message count for topic
        topicMessageCounts.computeIfAbsent(topic, k -> new AtomicLong(0)).incrementAndGet();

        // Increment partition-specific count
        partitionMessageCounts
                .computeIfAbsent(topic, k -> new ConcurrentHashMap<>())
                .computeIfAbsent(partition, k -> new AtomicLong(0))
                .incrementAndGet();

        return startTime;
    }

    /**
     * Records successful message processing.
     *
     * @param topic the Kafka topic
     * @param partition the partition number
     * @param offset the message offset
     * @param startTime the processing start time
     */
    public void recordMessageProcessingSuccess(String topic, int partition, long offset, LocalDateTime startTime) {
        LocalDateTime endTime = LocalDateTime.now();
        long processingTimeMs = Duration.between(startTime, endTime).toMillis();

        topicSuccessCounts.computeIfAbsent(topic, k -> new AtomicLong(0)).incrementAndGet();
        topicProcessingTimeMs.computeIfAbsent(topic, k -> new AtomicLong(0)).addAndGet(processingTimeMs);

        // Update min/max processing times
        AtomicLong minTime = topicMinProcessingTimeMs.computeIfAbsent(topic, k -> new AtomicLong(Long.MAX_VALUE));
        AtomicLong maxTime = topicMaxProcessingTimeMs.computeIfAbsent(topic, k -> new AtomicLong(0));

        long currentMin = minTime.get();
        while (processingTimeMs < currentMin && !minTime.compareAndSet(currentMin, processingTimeMs)) {
            currentMin = minTime.get();
        }

        long currentMax = maxTime.get();
        while (processingTimeMs > currentMax && !maxTime.compareAndSet(currentMax, processingTimeMs)) {
            currentMax = maxTime.get();
        }

        log.debug("{} Message processed successfully - Topic: {}, Partition: {}, Offset: {}, Processing time: {}ms",
                METRICS_PREFIX, topic, partition, offset, processingTimeMs);

        // Log warning if processing took too long
        if (processingTimeMs > 5000) {
            log.warn("{} Slow message processing detected - Topic: {}, Partition: {}, Offset: {}, Processing time: {}ms (threshold: 5000ms)",
                    METRICS_PREFIX, topic, partition, offset, processingTimeMs);
        }

        // Log metrics summary periodically (every 100 messages per topic)
        long messageCount = topicMessageCounts.get(topic).get();
        if (messageCount % 100 == 0) {
            logTopicMetricsSummary(topic);
        }
    }

    /**
     * Records failed message processing.
     *
     * @param topic the Kafka topic
     * @param partition the partition number
     * @param offset the message offset
     * @param startTime the processing start time
     * @param error the error that occurred
     */
    public void recordMessageProcessingFailure(String topic, int partition, long offset,
                                               LocalDateTime startTime, Throwable error) {
        LocalDateTime endTime = LocalDateTime.now();
        long processingTimeMs = Duration.between(startTime, endTime).toMillis();

        topicErrorCounts.computeIfAbsent(topic, k -> new AtomicLong(0)).incrementAndGet();

        log.error("{} Message processing failed - Topic: {}, Partition: {}, Offset: {}, Processing time: {}ms, Error: {}",
                METRICS_PREFIX, topic, partition, offset, processingTimeMs, error.getMessage());

        // Calculate error rate
        long totalMessages = topicMessageCounts.get(topic).get();
        long errorCount = topicErrorCounts.get(topic).get();
        double errorRate = (double) errorCount / totalMessages * 100;

        if (errorRate > 10) {
            log.error("{} High error rate detected for topic '{}': {:.2f}% ({} errors out of {} messages). " +
                            "Please investigate immediately!",
                    METRICS_PREFIX, topic, errorRate, errorCount, totalMessages);
        } else if (errorRate > 5) {
            log.warn("{} Elevated error rate for topic '{}': {:.2f}% ({} errors out of {} messages)",
                    METRICS_PREFIX, topic, errorRate, errorCount, totalMessages);
        }
    }

    /**
     * Logs a summary of metrics for a specific topic.
     *
     * @param topic the Kafka topic
     */
    public void logTopicMetricsSummary(String topic) {
        long totalMessages = topicMessageCounts.getOrDefault(topic, new AtomicLong(0)).get();
        long successCount = topicSuccessCounts.getOrDefault(topic, new AtomicLong(0)).get();
        long errorCount = topicErrorCounts.getOrDefault(topic, new AtomicLong(0)).get();
        long totalProcessingTime = topicProcessingTimeMs.getOrDefault(topic, new AtomicLong(0)).get();

        if (totalMessages == 0) {
            log.debug("{} No messages processed yet for topic: {}", METRICS_PREFIX, topic);
            return;
        }

        double successRate = (double) successCount / totalMessages * 100;
        double errorRate = (double) errorCount / totalMessages * 100;
        double avgProcessingTime = (double) totalProcessingTime / Math.max(successCount, 1);
        long minTime = topicMinProcessingTimeMs.getOrDefault(topic, new AtomicLong(0)).get();
        long maxTime = topicMaxProcessingTimeMs.getOrDefault(topic, new AtomicLong(0)).get();

        log.info("{} ========== METRICS SUMMARY: {} ==========", METRICS_PREFIX, topic);
        log.info("{} Total messages: {}", METRICS_PREFIX, totalMessages);
        log.info("{} Successful: {} ({:.2f}%)", METRICS_PREFIX, successCount, successRate);
        log.info("{} Failed: {} ({:.2f}%)", METRICS_PREFIX, errorCount, errorRate);
        log.info("{} Avg processing time: {:.2f}ms", METRICS_PREFIX, avgProcessingTime);
        log.info("{} Min processing time: {}ms", METRICS_PREFIX, minTime);
        log.info("{} Max processing time: {}ms", METRICS_PREFIX, maxTime);

        // Log partition distribution
        Map<Integer, AtomicLong> partitionCounts = partitionMessageCounts.get(topic);
        if (partitionCounts != null && !partitionCounts.isEmpty()) {
            log.info("{} Partition distribution:", METRICS_PREFIX);
            partitionCounts.forEach((partition, count) ->
                    log.info("{}   Partition {}: {} messages ({:.2f}%)",
                            METRICS_PREFIX, partition, count.get(),
                            (double) count.get() / totalMessages * 100));
        }

        log.info("{} ==========================================", METRICS_PREFIX);
    }

    /**
     * Logs metrics summary for all topics.
     */
    public void logAllTopicsMetricsSummary() {
        log.info("{} ========== ALL TOPICS METRICS SUMMARY ==========", METRICS_PREFIX);

        if (topicMessageCounts.isEmpty()) {
            log.info("{} No messages processed yet", METRICS_PREFIX);
            log.info("{} ===============================================", METRICS_PREFIX);
            return;
        }

        long totalAllMessages = 0;
        long totalAllSuccess = 0;
        long totalAllErrors = 0;

        for (String topic : topicMessageCounts.keySet()) {
            long messages = topicMessageCounts.get(topic).get();
            long success = topicSuccessCounts.getOrDefault(topic, new AtomicLong(0)).get();
            long errors = topicErrorCounts.getOrDefault(topic, new AtomicLong(0)).get();

            totalAllMessages += messages;
            totalAllSuccess += success;
            totalAllErrors += errors;

            log.info("{} Topic '{}': {} total, {} success, {} errors",
                    METRICS_PREFIX, topic, messages, success, errors);
        }

        double overallSuccessRate = totalAllMessages > 0 ?
                (double) totalAllSuccess / totalAllMessages * 100 : 0;
        double overallErrorRate = totalAllMessages > 0 ?
                (double) totalAllErrors / totalAllMessages * 100 : 0;

        log.info("{} ---------------------------------------", METRICS_PREFIX);
        log.info("{} OVERALL: {} messages, {:.2f}% success, {:.2f}% errors",
                METRICS_PREFIX, totalAllMessages, overallSuccessRate, overallErrorRate);
        log.info("{} ===============================================", METRICS_PREFIX);
    }

    /**
     * Resets all metrics (useful for testing or periodic reset).
     */
    public void resetAllMetrics() {
        log.warn("{} Resetting all Kafka metrics", METRICS_PREFIX);

        topicMessageCounts.clear();
        topicSuccessCounts.clear();
        topicErrorCounts.clear();
        topicProcessingTimeMs.clear();
        topicMinProcessingTimeMs.clear();
        topicMaxProcessingTimeMs.clear();
        partitionMessageCounts.clear();

        log.info("{} All metrics have been reset", METRICS_PREFIX);
    }

    /**
     * Gets the current message count for a topic.
     *
     * @param topic the Kafka topic
     * @return the number of messages processed
     */
    public long getTopicMessageCount(String topic) {
        return topicMessageCounts.getOrDefault(topic, new AtomicLong(0)).get();
    }

    /**
     * Gets the current success rate for a topic.
     *
     * @param topic the Kafka topic
     * @return the success rate as a percentage (0-100)
     */
    public double getTopicSuccessRate(String topic) {
        long total = topicMessageCounts.getOrDefault(topic, new AtomicLong(0)).get();
        if (total == 0) return 0.0;

        long success = topicSuccessCounts.getOrDefault(topic, new AtomicLong(0)).get();
        return (double) success / total * 100;
    }

    /**
     * Gets the current error rate for a topic.
     *
     * @param topic the Kafka topic
     * @return the error rate as a percentage (0-100)
     */
    public double getTopicErrorRate(String topic) {
        long total = topicMessageCounts.getOrDefault(topic, new AtomicLong(0)).get();
        if (total == 0) return 0.0;

        long errors = topicErrorCounts.getOrDefault(topic, new AtomicLong(0)).get();
        return (double) errors / total * 100;
    }
}
