package com.devision.job_manager_auth.controller;

import com.devision.job_manager_auth.dto.external.CompanyBasicInfoDto;
import com.devision.job_manager_auth.service.external.CompanyExternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/external/companies")
@RequiredArgsConstructor
@Slf4j
public class CompanyExternalController {

    private final CompanyExternalService companyExternalService;

    @GetMapping("/{id}")
    public ResponseEntity<CompanyBasicInfoDto> getCompanyBasicInfo(@PathVariable UUID id) {
        log.info("External request: Get company basic info for ID: {}", id);
        return companyExternalService.getCompanyBasicInfo(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());

    }

    @GetMapping("/by-email")
    public ResponseEntity<CompanyBasicInfoDto> getCompanyBasicInfoByEmail(@RequestParam String email) {
        log.info("External request: Get company basic info for email: {}", email);
        return companyExternalService.getCompanyBasicInfoByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Can be used by other services
    @GetMapping("/is-activated")
    public ResponseEntity<Boolean> isCompanyActivated(@RequestParam String email) {
        log.info("External request: Check if company activated: {}", email);
        return companyExternalService.isCompanyActivated(email) ? ResponseEntity.ok(true) : ResponseEntity.ok(false);
    }

    // Can be used by the gateway
    @GetMapping("/is-locked")
    public ResponseEntity<Boolean> isCompanyLocked(@RequestParam String email) {
        return companyExternalService.isCompanyLocked(email) ? ResponseEntity.ok(true) : ResponseEntity.ok(false);
    }

}
