package com.devision.job_manager_jobpost;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients  // Enable Feign clients for service-to-service communication
@EnableCaching       // Enable caching for Company service country lookups
public class JobManagerJobpostApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobManagerJobpostApplication.class, args);
	}

}
