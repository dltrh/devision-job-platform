package com.devision.job_manager_auth.service.external.impl;

import com.devision.job_manager_auth.dto.external.CompanyAuthStatusDto;
import com.devision.job_manager_auth.dto.external.CompanyBasicInfoDto;
import com.devision.job_manager_auth.entity.CompanyAccount;
import com.devision.job_manager_auth.repository.CompanyAccountRepository;
import com.devision.job_manager_auth.service.external.CompanyExternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyExternalServiceImpl implements CompanyExternalService {
    private final CompanyAccountRepository companyAccountRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyBasicInfoDto> getCompanyBasicInfo(UUID companyId) {
        log.info("External API: Get company basic info for ID: {}", companyId);

        return companyAccountRepository.findById(companyId)
                .map(this::mapToBasicInfoDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyBasicInfoDto> getCompanyBasicInfoByEmail(String email) {
        log.info("External API: Get company basic info for email: {}", email);

        return companyAccountRepository.findByEmail(email)
                .map(this::mapToBasicInfoDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyAuthStatusDto> getCompanyAuthStatus(UUID companyId) {
        log.info("External API: Get auth status for company ID: {}", companyId);

        return companyAccountRepository.findById(companyId)
                .map(this::mapToAuthStatusDto);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isCompanyActivated(String email) {
        log.info("External API: Check if company activated: {}", email);

        return companyAccountRepository.findByEmail(email)
                .map(CompanyAccount::getIsActivated)
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isCompanyLocked(String email) {
        log.info("External API: Check if company locked: {}", email);

        return companyAccountRepository.findByEmail(email)
                .map(CompanyAccount::getIsLocked)
                .orElse(false);
    }

    /**
     * PRIVATE MAPS
     */

    private CompanyBasicInfoDto mapToBasicInfoDto(CompanyAccount account) {
        return CompanyBasicInfoDto.builder()
                .id(account.getId())
                .email(account.getEmail())
                .role(account.getRole())
                .authProvider(account.getAuthProvider())
                .isActivated(account.getIsActivated())
                .createdAt(account.getCreatedAt())
                .build();
    }

    private CompanyAuthStatusDto mapToAuthStatusDto(CompanyAccount account) {
        return CompanyAuthStatusDto.builder()
                .companyId(account.getId())
                .email(account.getEmail())
                .isActivated(account.getIsActivated())
                .isLocked(account.getIsLocked())
                .authProvider(account.getAuthProvider())
                .build();
    }
}
