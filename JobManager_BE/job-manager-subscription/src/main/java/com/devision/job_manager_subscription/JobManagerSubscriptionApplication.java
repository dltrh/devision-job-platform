package com.devision.job_manager_subscription;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
public class JobManagerSubscriptionApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobManagerSubscriptionApplication.class, args);
	}

}
