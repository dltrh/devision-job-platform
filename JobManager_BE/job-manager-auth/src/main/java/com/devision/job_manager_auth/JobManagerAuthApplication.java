package com.devision.job_manager_auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableDiscoveryClient
@EnableAsync
@ConfigurationPropertiesScan
public class JobManagerAuthApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobManagerAuthApplication.class, args);
	}

}

//@ConfigurationPropertiesScan("com.devision.job_manager_auth.config.sharding")
