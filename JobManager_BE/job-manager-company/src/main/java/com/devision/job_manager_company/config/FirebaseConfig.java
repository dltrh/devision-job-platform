package com.devision.job_manager_company.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;

@Configuration
@Slf4j
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class FirebaseConfig {

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.credentials-file}")
    private Resource credentialsFile;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!credentialsFile.exists()) {
            log.warn("Firebase credentials file not found. Firebase features will be disabled.");
            return null;
        }
        
        GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsFile.getInputStream());

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            log.info("Initializing Firebase App with project ID: {}", projectId);
            return FirebaseApp.initializeApp(options);
        }
        return FirebaseApp.getInstance();
    }

    @Bean
    public Storage firebaseStorage(FirebaseApp firebaseApp) throws IOException {
        if (firebaseApp == null || !credentialsFile.exists()) {
            log.warn("Firebase Storage not initialized - credentials file not found.");
            return null;
        }
        
        GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsFile.getInputStream());
        log.info("Initializing Firebase Storage for project: {}", projectId);
        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build()
                .getService();
    }
}
