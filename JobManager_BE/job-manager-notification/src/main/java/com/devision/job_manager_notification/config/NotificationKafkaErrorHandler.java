package com.devision.job_manager_notification.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.stereotype.Component;

/**
 * Custom error handler for Kafka consumer errors.
 * Provides comprehensive logging and error tracking for failed Kafka message processing.
 */
@Slf4j
@Component
public class NotificationKafkaErrorHandler implements CommonErrorHandler {

    private static final int MAX_ERROR_LOG_LENGTH = 500;
    private static final String ERROR_LOG_PREFIX = "[KAFKA_ERROR]";

    @Override
    public boolean handleOne(Exception thrownException, ConsumerRecord<?, ?> record,
                             Consumer<?, ?> consumer, MessageListenerContainer container) {

        logDetailedError(thrownException, record);

        // Check for specific exception types and handle accordingly
        if (thrownException instanceof org.springframework.messaging.converter.MessageConversionException) {
            log.error("{} Message conversion failed for topic: {}, partition: {}, offset: {}. " +
                            "This usually indicates a schema mismatch between producer and consumer. " +
                            "Please verify event class structure matches between services.",
                    ERROR_LOG_PREFIX, record.topic(), record.partition(), record.offset());

            // Don't retry message conversion errors as they will keep failing
            return true;
        }

        if (thrownException instanceof NullPointerException) {
            log.error("{} Null pointer exception processing message from topic: {}, partition: {}, offset: {}. " +
                            "This indicates missing required fields in the event data. " +
                            "Payload: {}", ERROR_LOG_PREFIX, record.topic(), record.partition(), record.offset(),
                    truncatePayload(record.value()));

            // Don't retry null pointer errors
            return true;
        }

        if (thrownException instanceof IllegalArgumentException) {
            log.error("{} Invalid argument exception for topic: {}, partition: {}, offset: {}. " +
                            "Event data contains invalid values. Error: {}", ERROR_LOG_PREFIX,
                    record.topic(), record.partition(), record.offset(), thrownException.getMessage());

            // Don't retry invalid argument errors
            return true;
        }

        if (thrownException instanceof org.springframework.dao.DataAccessException) {
            log.error("{} Database error processing message from topic: {}, partition: {}, offset: {}. " +
                            "This may be temporary. Consider implementing retry logic with backoff. Error: {}",
                    ERROR_LOG_PREFIX, record.topic(), record.partition(), record.offset(),
                    thrownException.getMessage());

            // Database errors might be temporary, but we still mark as handled to prevent infinite retries
            return true;
        }

        // For unknown exceptions, log detailed information
        log.error("{} Unexpected error processing message from topic: {}, partition: {}, offset: {}. " +
                        "Exception type: {}, Message: {}", ERROR_LOG_PREFIX, record.topic(),
                record.partition(), record.offset(), thrownException.getClass().getName(),
                thrownException.getMessage(), thrownException);

        // Mark as handled to prevent consumer from blocking
        return true;
    }

    @Override
    public void handleOtherException(Exception thrownException, Consumer<?, ?> consumer,
                                     MessageListenerContainer container, boolean batchListener) {
        log.error("{} General Kafka consumer error occurred. Container: {}, Batch listener: {}. " +
                        "This error is not related to a specific message. Exception: {}",
                ERROR_LOG_PREFIX, container.getContainerProperties().getGroupId(), batchListener,
                thrownException.getMessage(), thrownException);

        if (thrownException instanceof org.apache.kafka.common.errors.SerializationException) {
            log.error("{} Kafka serialization error. This indicates the message in Kafka cannot be deserialized. " +
                    "Check if the message format in Kafka matches the expected format. " +
                    "You may need to skip this message manually or fix the data in Kafka.", ERROR_LOG_PREFIX);
        }

        if (thrownException instanceof org.apache.kafka.common.errors.TimeoutException) {
            log.error("{} Kafka timeout error. The consumer could not fetch messages within the timeout period. " +
                    "This might indicate network issues or Kafka broker problems. " +
                    "Check Kafka broker health and network connectivity.", ERROR_LOG_PREFIX);
        }

        if (thrownException instanceof org.apache.kafka.common.errors.AuthenticationException ||
                thrownException instanceof org.apache.kafka.common.errors.AuthorizationException) {
            log.error("{} Kafka authentication/authorization error. " +
                    "The consumer does not have permission to consume from the topics. " +
                    "Check Kafka ACLs and consumer credentials.", ERROR_LOG_PREFIX);
        }

        if (thrownException instanceof org.springframework.kafka.listener.ListenerExecutionFailedException) {
            log.error("{} Listener execution failed. This is a wrapper exception. " +
                    "Check the cause for the actual error: {}", ERROR_LOG_PREFIX,
                    thrownException.getCause() != null ? thrownException.getCause().getMessage() : "No cause available");
        }
    }

    /**
     * Logs detailed error information for debugging purposes.
     */
    private void logDetailedError(Exception thrownException, ConsumerRecord<?, ?> record) {
        log.error("{} ========== KAFKA ERROR DETAILS ==========", ERROR_LOG_PREFIX);
        log.error("{} Topic: {}", ERROR_LOG_PREFIX, record.topic());
        log.error("{} Partition: {}", ERROR_LOG_PREFIX, record.partition());
        log.error("{} Offset: {}", ERROR_LOG_PREFIX, record.offset());
        log.error("{} Timestamp: {}", ERROR_LOG_PREFIX, record.timestamp());
        log.error("{} Key: {}", ERROR_LOG_PREFIX, record.key());
        log.error("{} Value type: {}", ERROR_LOG_PREFIX, record.value() != null ? record.value().getClass().getName() : "null");
        log.error("{} Value: {}", ERROR_LOG_PREFIX, truncatePayload(record.value()));
        log.error("{} Exception type: {}", ERROR_LOG_PREFIX, thrownException.getClass().getName());
        log.error("{} Exception message: {}", ERROR_LOG_PREFIX, thrownException.getMessage());

        if (thrownException.getCause() != null) {
            log.error("{} Root cause: {}", ERROR_LOG_PREFIX, thrownException.getCause().getMessage());
        }

        log.error("{} ========================================", ERROR_LOG_PREFIX);
    }

    /**
     * Truncates payload for logging to prevent extremely long log lines.
     */
    private String truncatePayload(Object payload) {
        if (payload == null) {
            return "null";
        }

        String payloadStr = payload.toString();
        if (payloadStr.length() > MAX_ERROR_LOG_LENGTH) {
            return payloadStr.substring(0, MAX_ERROR_LOG_LENGTH) + "... (truncated)";
        }

        return payloadStr;
    }
}
