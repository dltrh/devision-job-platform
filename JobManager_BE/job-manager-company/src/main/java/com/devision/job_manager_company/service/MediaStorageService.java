package com.devision.job_manager_company.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
@ConditionalOnBean(Storage.class)
public class MediaStorageService {

    private final Storage storage;

    @Value("${firebase.bucket-name}")
    private String bucketName;

    public MediaStorageService(Storage storage) {
        this.storage = storage;
    }

    // Upload company logo, overwrites existing logo
    public String uploadCompanyLogo(UUID companyId, MultipartFile file) throws IOException {
        String extension = getExtension(file.getOriginalFilename());
        String objectName = String.format("companies/%s/logo%s", companyId.toString(),
                extension != null ? ("." + extension) : "");

        log.info("Uploading company logo for company ID: {} to {}", companyId, objectName);
        return upload(objectName, file);
    }

    // Upload company media (images, videos, documents)
    public String uploadCompanyMedia(UUID companyId, MultipartFile file) throws IOException {
        String extension = getExtension(file.getOriginalFilename());
        String uuid = UUID.randomUUID().toString();
        String objectName = String.format("companies/%s/media/%s%s", companyId.toString(), uuid,
                extension != null ? ("." + extension) : "");

        log.info("Uploading company media for company ID: {} to {}", companyId, objectName);
        return upload(objectName, file);
    }

    // Upload company banner image
    public String uploadCompanyBanner(UUID companyId, MultipartFile file) throws IOException {
        String extension = getExtension(file.getOriginalFilename());
        String objectName = String.format("companies/%s/banner%s", companyId.toString(),
                extension != null ? ("." + extension) : "");

        log.info("Uploading company banner for company ID: {} to {}", companyId, objectName);
        return upload(objectName, file);
    }

    // Delete a file from Firebase Storage
    public void deleteFile(String fileUrl) {
        try {
            // Extract object name from URL
            String objectName = extractObjectNameFromUrl(fileUrl);
            if (objectName != null) {
                BlobId blobId = BlobId.of(bucketName, objectName);
                boolean deleted = storage.delete(blobId);
                if (deleted) {
                    log.info("Deleted file: {}", objectName);
                } else {
                    log.warn("File not found or already deleted: {}", objectName);
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete file: {}", fileUrl, e);
        }
    }

    // Upload file to Firebase Storage
    private String upload(String objectName, MultipartFile file) throws IOException {
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        // Use Firebase Storage URL format with URL-encoded path
        String encodedObjectName = java.net.URLEncoder.encode(objectName, java.nio.charset.StandardCharsets.UTF_8);
        String publicUrl = String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media", bucketName, encodedObjectName);
        log.info("File uploaded successfully: {}", publicUrl);
        return publicUrl;
    }

    // Extract file extension from filename
    private String getExtension(String filename) {
        if (filename == null) return null;
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == filename.length() - 1) {
            return null;
        }
        return filename.substring(dotIndex + 1);
    }

    // Extract object name from Firebase Storage URL
    private String extractObjectNameFromUrl(String url) {
        if (url == null) return null;
        try {
            String firebasePrefix = String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/", bucketName);
            if (url.startsWith(firebasePrefix)) {
                String encodedPath = url.substring(firebasePrefix.length());
                // Remove query parameters (?alt=media)
                int queryIndex = encodedPath.indexOf('?');
                if (queryIndex != -1) {
                    encodedPath = encodedPath.substring(0, queryIndex);
                }
                // URL decode the path
                return java.net.URLDecoder.decode(encodedPath, java.nio.charset.StandardCharsets.UTF_8);
            }
            String legacyPrefix = String.format("https://storage.googleapis.com/%s/", bucketName);
            if (url.startsWith(legacyPrefix)) {
                return url.substring(legacyPrefix.length());
            }
        } catch (Exception e) {
            log.error("Failed to extract object name from URL: {}", url, e);
        }
        return null;
    }
}
