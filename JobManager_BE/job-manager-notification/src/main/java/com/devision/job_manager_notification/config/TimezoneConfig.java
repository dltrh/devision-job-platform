package com.devision.job_manager_notification.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import java.util.TimeZone;

/**
 * Configuration class to set the application timezone to Asia/Ho_Chi_Minh (GMT+7).
 * This ensures all timestamps (database, logs, notifications) use Vietnam timezone.
 */
@Configuration
@Slf4j
public class TimezoneConfig {

    @PostConstruct
    public void init() {
        // Set default timezone for JVM
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        log.info("Application timezone set to: {}", TimeZone.getDefault().getID());
        log.info("Current time in configured timezone: {}", java.time.ZonedDateTime.now());
    }
}
