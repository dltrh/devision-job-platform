package com.devision.job_manager_company.service.impl;

import com.devision.job_manager_company.event.CompanyCountryChangedEvent;
import com.devision.job_manager_company.event.CompanyRegisteredEvent;
import com.devision.job_manager_company.model.Company;
import com.devision.job_manager_company.model.CompanyProfile;
import com.devision.job_manager_company.repository.CompanyProfileRepository;
import com.devision.job_manager_company.repository.CompanyRepository;
import com.devision.job_manager_company.service.CompanyService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyServiceImpl implements CompanyService {

    private static final String COUNTRY_CHANGED_TOPIC = "company.country.changed";

    private final CompanyRepository companyRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public Company createCompanyFromEvent(CompanyRegisteredEvent event) {
        log.info("Creating company from registration event for ID: {}", event.getCompanyId());

        // Check if company already exists (idempotency)
        if (companyRepository.existsById(event.getCompanyId())) {
            log.warn("Company already exists with ID: {}", event.getCompanyId());
            return companyRepository.findById(event.getCompanyId()).orElseThrow();
        }

        // Create company entity with minimal data from auth event
        // Other fields (name, phone, etc.) will be set when user updates their profile
        Company company = Company.builder()
                .id(event.getCompanyId())
                .name("")  // Will be set when user completes profile
                .countryCode(event.getCountryCode() != null ? event.getCountryCode() : "XX")
                .build();

        company = companyRepository.save(company);
        log.info("Company created with ID: {}", company.getId());

        // Create empty company profile
        CompanyProfile profile = CompanyProfile.builder()
                .company(company)
                .build();

        companyProfileRepository.save(profile);
        log.info("Company profile created for company ID: {}", company.getId());

        return company;
    }

    @Override
    public Optional<Company> getCompanyById(UUID id) {
        return companyRepository.findById(id);
    }

    @Override
    public Optional<Company> getCompanyWithProfile(UUID id) {
        return companyRepository.findByIdWithProfile(id);
    }

    @Override
    public Page<Company> getAllCompanies(Pageable pageable) {
        log.info("Getting all companies with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());
        return companyRepository.findAllWithProfile(pageable);
    }

    @Override
    public Page<Company> searchCompaniesByName(String name, Pageable pageable) {
        log.info("Searching companies by name: '{}' with pagination: page={}, size={}",
                name, pageable.getPageNumber(), pageable.getPageSize());
        return companyRepository.searchByName(name, pageable);
    }

    @Override
    public Page<Company> getCompaniesByCountry(String countryCode, Pageable pageable) {
        log.info("Getting companies by country: '{}' with pagination: page={}, size={}",
                countryCode, pageable.getPageNumber(), pageable.getPageSize());
        return companyRepository.findByCountryCode(countryCode, pageable);
    }

    @Override
    @Transactional
    public Company updateCompany(UUID id, Company updatedCompany) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with ID: " + id));

        // Track if country is changing for event publishing
        String previousCountryCode = company.getCountryCode();
        boolean countryChanged = false;

        if (updatedCompany.getName() != null) {
            company.setName(updatedCompany.getName());
        }
        if (updatedCompany.getPhone() != null) {
            company.setPhone(updatedCompany.getPhone());
        }
        if (updatedCompany.getStreetAddress() != null) {
            company.setStreetAddress(updatedCompany.getStreetAddress());
        }
        if (updatedCompany.getCity() != null) {
            company.setCity(updatedCompany.getCity());
        }
        if (updatedCompany.getCountryCode() != null && 
                !updatedCompany.getCountryCode().equals(previousCountryCode)) {
            company.setCountryCode(updatedCompany.getCountryCode());
            countryChanged = true;
        }

        Company savedCompany = companyRepository.save(company);

        // Publish event if country changed
        if (countryChanged) {
            publishCountryChangedEvent(id, previousCountryCode, updatedCompany.getCountryCode());
        }

        return savedCompany;
    }

    /**
     * Publish country changed event for auth service to migrate shard
     */
    private void publishCountryChangedEvent(UUID companyId, String previousCountryCode, String newCountryCode) {
        CompanyCountryChangedEvent event = CompanyCountryChangedEvent.builder()
                .companyId(companyId)
                .previousCountryCode(previousCountryCode)
                .newCountryCode(newCountryCode)
                .changedAt(LocalDateTime.now())
                .build();

        try {
            kafkaTemplate.send(COUNTRY_CHANGED_TOPIC, companyId.toString(), event);
            log.info("Published CompanyCountryChangedEvent for company ID: {} (country: {} -> {})",
                    companyId, previousCountryCode, newCountryCode);
        } catch (Exception e) {
            log.error("Failed to publish CompanyCountryChangedEvent for company ID: {}. Error: {}",
                    companyId, e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public CompanyProfile updateCompanyProfile(UUID companyId, CompanyProfile updatedProfile) {
        CompanyProfile profile = companyProfileRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for company ID: " + companyId));

        if (updatedProfile.getAboutUs() != null) {
            profile.setAboutUs(updatedProfile.getAboutUs());
        }
        if (updatedProfile.getWhoWeSeek() != null) {
            profile.setWhoWeSeek(updatedProfile.getWhoWeSeek());
        }
        if (updatedProfile.getWebsiteUrl() != null) {
            profile.setWebsiteUrl(updatedProfile.getWebsiteUrl());
        }
        if (updatedProfile.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(updatedProfile.getLinkedinUrl());
        }
        if (updatedProfile.getIndustry() != null) {
            profile.setIndustry(updatedProfile.getIndustry());
        }
        if (updatedProfile.getCompanySize() != null) {
            profile.setCompanySize(updatedProfile.getCompanySize());
        }
        if (updatedProfile.getFoundedYear() != null) {
            profile.setFoundedYear(updatedProfile.getFoundedYear());
        }

        return companyProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public void updateProfileLogoUrl(UUID companyId, String logoUrl) {
        log.info("Updating logo URL for company ID: {}", companyId);
        CompanyProfile profile = companyProfileRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for company ID: " + companyId));
        profile.setLogoUrl(logoUrl);
        companyProfileRepository.save(profile);
        log.info("Updated logoUrl in CompanyProfile for company ID: {}", companyId);
    }

    @Override
    @Transactional
    public void updateProfileBannerUrl(UUID companyId, String bannerUrl) {
        log.info("Updating banner URL for company ID: {}", companyId);
        CompanyProfile profile = companyProfileRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for company ID: " + companyId));
        profile.setBannerUrl(bannerUrl);
        companyProfileRepository.save(profile);
        log.info("Updated bannerUrl in CompanyProfile for company ID: {}", companyId);
    }

    @Override
    @Transactional
    public Optional<List<CompanyProfile>> getAllCompanies() {
        List<CompanyProfile> profiles = companyProfileRepository.findAll();
        return profiles.isEmpty() ? Optional.empty() : Optional.of(profiles);
    }
}
