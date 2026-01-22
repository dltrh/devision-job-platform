package com.devision.job_manager_company;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class JobManagerCompanyApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobManagerCompanyApplication.class, args);
	}

}
