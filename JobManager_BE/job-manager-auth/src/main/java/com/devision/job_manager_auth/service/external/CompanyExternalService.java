package com.devision.job_manager_auth.service.external;

import com.devision.job_manager_auth.dto.external.CompanyAuthStatusDto;
import com.devision.job_manager_auth.dto.external.CompanyBasicInfoDto;

import java.util.Optional;
import java.util.UUID;

public interface CompanyExternalService {

    Optional<CompanyBasicInfoDto> getCompanyBasicInfo(UUID companyId);

    Optional<CompanyBasicInfoDto> getCompanyBasicInfoByEmail(String email);

    Optional<CompanyAuthStatusDto> getCompanyAuthStatus(UUID companyId);

    boolean isCompanyActivated(String email);

    boolean isCompanyLocked(String email);

}
