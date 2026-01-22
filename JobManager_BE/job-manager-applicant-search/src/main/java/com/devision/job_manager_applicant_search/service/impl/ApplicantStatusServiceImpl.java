package com.devision.job_manager_applicant_search.service.impl;

import com.devision.job_manager_applicant_search.model.ApplicantStatusType;
import com.devision.job_manager_applicant_search.model.CompanyApplicantStatus;
import com.devision.job_manager_applicant_search.repository.CompanyApplicantStatusRepository;
import com.devision.job_manager_applicant_search.service.ApplicantStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Implementation of ApplicantStatusService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicantStatusServiceImpl implements ApplicantStatusService {

    private final CompanyApplicantStatusRepository statusRepository;

    @Override
    @Transactional
    public CompanyApplicantStatus setStatus(UUID companyId, UUID applicantId, ApplicantStatusType status, String note) {
        log.debug("Setting status {} for applicant {} by company {}", status, applicantId, companyId);

        // If status is NONE, delete the record instead
        if (status == ApplicantStatusType.NONE) {
            clearStatus(companyId, applicantId);
            return null;
        }

        // Find existing or create new
        CompanyApplicantStatus entity = statusRepository
                .findByCompanyIdAndApplicantId(companyId, applicantId)
                .orElseGet(() -> CompanyApplicantStatus.builder()
                        .companyId(companyId)
                        .applicantId(applicantId)
                        .build());

        entity.setStatus(status);
        entity.setNote(note);

        CompanyApplicantStatus saved = statusRepository.save(entity);
        log.info("Set status {} for applicant {} by company {}", status, applicantId, companyId);
        return saved;
    }

    @Override
    public CompanyApplicantStatus getStatus(UUID companyId, UUID applicantId) {
        return statusRepository.findByCompanyIdAndApplicantId(companyId, applicantId).orElse(null);
    }

    @Override
    public Map<UUID, ApplicantStatusType> getStatusesForApplicants(UUID companyId, Collection<UUID> applicantIds) {
        if (applicantIds == null || applicantIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<CompanyApplicantStatus> statuses = statusRepository.findByCompanyIdAndApplicantIdIn(companyId, applicantIds);
        
        Map<UUID, ApplicantStatusType> result = new HashMap<>();
        for (CompanyApplicantStatus status : statuses) {
            result.put(status.getApplicantId(), status.getStatus());
        }
        return result;
    }

    @Override
    @Transactional
    public void clearStatus(UUID companyId, UUID applicantId) {
        log.debug("Clearing status for applicant {} by company {}", applicantId, companyId);
        statusRepository.deleteByCompanyIdAndApplicantId(companyId, applicantId);
        log.info("Cleared status for applicant {} by company {}", applicantId, companyId);
    }

    @Override
    public List<CompanyApplicantStatus> getApplicantsByStatus(UUID companyId, ApplicantStatusType status) {
        return statusRepository.findByCompanyIdAndStatus(companyId, status);
    }
}
