package com.devision.job_manager_auth.service.internal;

import com.devision.job_manager_auth.entity.CompanyAccount;

// Handle email notification to the company
public interface EmailService {
    void sendActivationEmail(CompanyAccount company, String activationToken);

    void sendWelcomeEmail(CompanyAccount company);

    void sendAccountLockedEmail(CompanyAccount company);

    void sendPasswordResetEmail(CompanyAccount company, String resetToken);

    void sendPasswordChangedEmail(CompanyAccount company);

    void sendEmailChangedConfirmation(CompanyAccount company);
}
