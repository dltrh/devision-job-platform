package com.devision.job_manager_applicant_search;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class JobManagerApplicantSearchApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobManagerApplicantSearchApplication.class, args);
	}

}
