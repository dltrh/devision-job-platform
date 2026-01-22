package com.devision.job_manager_company.controller;

import com.devision.job_manager_company.dto.response.ApiResponse;
import com.devision.job_manager_company.dto.CompanyMediaDto;
import com.devision.job_manager_company.dto.response.PagedResponse;
import com.devision.job_manager_company.dto.request.UpdateMediaDisplayOrderRequest;
import com.devision.job_manager_company.model.CompanyMedia;
import com.devision.job_manager_company.model.MediaType;
import com.devision.job_manager_company.service.CompanyMediaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies/{companyId}/media")
@RequiredArgsConstructor
@Slf4j
public class CompanyMediaController {

    private final CompanyMediaService companyMediaService;

    @PostMapping("/logo")
    public ResponseEntity<ApiResponse<CompanyMediaDto>> uploadLogo(
            @PathVariable UUID companyId,
            @RequestParam("file") MultipartFile file) {
        log.info("Upload logo request for company ID: {}", companyId);
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is required"));
            }

            CompanyMedia media = companyMediaService.uploadLogo(companyId, file);
            CompanyMediaDto dto = mapToDto(media);
            
            return ResponseEntity.ok(ApiResponse.success("Logo uploaded successfully", dto));
        } catch (IllegalArgumentException e) {
            log.error("Failed to upload logo: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to upload logo", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload logo: " + e.getMessage()));
        }
    }

    @PostMapping("/banner")
    public ResponseEntity<ApiResponse<CompanyMediaDto>> uploadBanner(
            @PathVariable UUID companyId,
            @RequestParam("file") MultipartFile file) {
        log.info("Upload banner request for company ID: {}", companyId);
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is required"));
            }

            CompanyMedia media = companyMediaService.uploadBanner(companyId, file);
            CompanyMediaDto dto = mapToDto(media);
            
            return ResponseEntity.ok(ApiResponse.success("Banner uploaded successfully", dto));
        } catch (IllegalArgumentException e) {
            log.error("Failed to upload banner: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to upload banner", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload banner: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyMediaDto>> uploadMedia(
            @PathVariable UUID companyId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") MediaType type,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description) {
        log.info("Upload media request for company ID: {}, type: {}", companyId, type);
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is required"));
            }

            CompanyMedia media = companyMediaService.uploadMedia(companyId, type, file, title, description);
            CompanyMediaDto dto = mapToDto(media);
            
            return ResponseEntity.ok(ApiResponse.success("Media uploaded successfully", dto));
        } catch (IllegalArgumentException e) {
            log.error("Failed to upload media: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to upload media", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload media: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CompanyMediaDto>>> getCompanyMedia(
            @PathVariable UUID companyId,
            @RequestParam(value = "type", required = false) MediaType type,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        log.info("Get media request for company ID: {}, type: {}, page: {}, size: {}, sortBy: {}, sortDir: {}", 
                companyId, type, page, size, sortBy, sortDir);
        
        try {
            // Validate sort field
            if (!isValidSortField(sortBy)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid sort field. Allowed: createdAt, displayOrder, title"));
            }

            Sort sort = sortDir.equalsIgnoreCase("asc") 
                    ? Sort.by(sortBy).ascending() 
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<CompanyMedia> mediaPage = type != null
                    ? companyMediaService.getCompanyMediaByTypePaginated(companyId, type, pageable)
                    : companyMediaService.getCompanyMediaPaginated(companyId, pageable);

            List<CompanyMediaDto> dtos = mediaPage.getContent().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            PagedResponse<CompanyMediaDto> pagedResponse = PagedResponse.<CompanyMediaDto>builder()
                    .content(dtos)
                    .page(mediaPage.getNumber())
                    .size(mediaPage.getSize())
                    .totalElements(mediaPage.getTotalElements())
                    .totalPages(mediaPage.getTotalPages())
                    .first(mediaPage.isFirst())
                    .last(mediaPage.isLast())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Media retrieved successfully", pagedResponse));
        } catch (Exception e) {
            log.error("Failed to get company media", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get media: " + e.getMessage()));
        }
    }

    private boolean isValidSortField(String sortBy) {
        return sortBy.equals("createdAt") || sortBy.equals("displayOrder") || sortBy.equals("title");
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<ApiResponse<String>> deleteMedia(
            @PathVariable UUID companyId,
            @PathVariable UUID mediaId) {
        log.info("Delete media request for company ID: {}, media ID: {}", companyId, mediaId);
        
        try {
            companyMediaService.deleteMedia(mediaId);
            return ResponseEntity.ok(ApiResponse.success("Media deleted successfully", null));
        } catch (IllegalArgumentException e) {
            log.error("Failed to delete media: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete media", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to delete media: " + e.getMessage()));
        }
    }

    @PutMapping("/{mediaId}/display-order")
    public ResponseEntity<ApiResponse<String>> updateDisplayOrder(
            @PathVariable UUID companyId,
            @PathVariable UUID mediaId,
            @Valid @RequestBody UpdateMediaDisplayOrderRequest request) {
        log.info("Update display order request for company ID: {}, media ID: {}, new order: {}", 
                companyId, mediaId, request.getDisplayOrder());
        
        try {
            companyMediaService.updateDisplayOrder(companyId, mediaId, request.getDisplayOrder());
            return ResponseEntity.ok(ApiResponse.success("Display order updated successfully", null));
        } catch (IllegalArgumentException e) {
            log.error("Failed to update display order: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update display order", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to update display order: " + e.getMessage()));
        }
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<String>> reorderMedia(
            @PathVariable UUID companyId,
            @RequestBody List<UUID> orderedMediaIds) {
        log.info("Reorder media request for company ID: {}, order: {}", companyId, orderedMediaIds);
        
        try {
            companyMediaService.reorderMedia(companyId, orderedMediaIds);
            return ResponseEntity.ok(ApiResponse.success("Media reordered successfully", null));
        } catch (IllegalArgumentException e) {
            log.error("Failed to reorder media: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to reorder media", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to reorder media: " + e.getMessage()));
        }
    }

    private CompanyMediaDto mapToDto(CompanyMedia media) {
        return CompanyMediaDto.builder()
                .id(media.getId())
                .companyId(media.getCompany().getId())
                .type(media.getType())
                .url(media.getUrl())
                .title(media.getTitle())
                .description(media.getDescription())
                .displayOrder(media.getDisplayOrder())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
