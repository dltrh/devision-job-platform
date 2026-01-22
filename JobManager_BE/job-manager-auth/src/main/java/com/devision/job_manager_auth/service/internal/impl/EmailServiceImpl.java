package com.devision.job_manager_auth.service.internal.impl;

import com.devision.job_manager_auth.entity.CompanyAccount;
import com.devision.job_manager_auth.service.internal.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async
    public void sendActivationEmail(CompanyAccount company, String activationToken) {

        try {

            String activationLink = frontendUrl + "/activate?token=" + activationToken;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(company.getEmail());
            message.setSubject("Activate Your DEVision-JM Account");
            message.setText(String.format("""
                    Hello %s,

                    Welcome to DEVision-JM! Please click the link below to activate your account: %s
                    """,
                    company.getEmail() != null ? company.getEmail() : "there",
                    activationLink));

            mailSender.send(message);
            log.info("Activation email sent to {}", company.getEmail());

        } catch (Exception e) {
            log.error("Failed to send activation email to {}: {}", company.getEmail(), e.getMessage());
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(CompanyAccount company) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(company.getEmail());
            message.setSubject("Welcome to DEVision Job Manager!");
            message.setText(String.format("""
                    Hello %s,

                    Your account has been successfully activated!

                    You can now:
                    - Post job opportunities
                    - Search for qualified applicants
                    - Manage your company profile

                    Login here: %s/login

                    Best regards,
                    DEVision Team
                    """,
                    company.getEmail() != null ? company.getEmail() : "there",
                    frontendUrl));

            mailSender.send(message);
            log.info("Welcome email sent to: {}", company.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", company.getEmail(), e.getMessage());
        }
    }

    @Override
    @Async
    public void sendAccountLockedEmail(CompanyAccount company) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(company.getEmail());
            message.setSubject("DEVision Account Security Alert - Account Locked");
            message.setText(String.format("""
                    Hello %s,

                    Your account has been temporarily locked due to multiple failed login attempts.

                    If this was you, please wait 60 seconds before trying again.

                    If this wasn't you, please contact our support team immediately.

                    Best regards,
                    DEVision Security Team
                    """,
                    company.getEmail() != null ? company.getEmail() : "there"));

            mailSender.send(message);
            log.info("Account locked email sent to: {}", company.getEmail());

        } catch (Exception e) {
            log.error("Failed to send account locked email to {}: {}", company.getEmail(), e.getMessage());
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(CompanyAccount company, String resetToken) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(company.getEmail());
            message.setSubject("Reset Your DEVision-JM Password");
            message.setText(String.format("""
                    Hello %s,

                    We received a request to reset your password. Click the link below to reset your password:

                    %s

                    This link will expire in 1 hour.

                    If you didn't request this, please ignore this email and your password will remain unchanged.

                    Best regards,
                    DEVision Team
                    """,
                    company.getEmail() != null ? company.getEmail() : "there",
                    resetLink));

            mailSender.send(message);
            log.info("Password reset email sent to: {}", company.getEmail());

        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", company.getEmail(), e.getMessage());
        }
    }

    @Override
    @Async
    public void sendPasswordChangedEmail(CompanyAccount company) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(company.getEmail());
            message.setSubject("DEVision-JM Password Changed Successfully");
            message.setText(String.format("""
                    Hello %s,

                    Your password has been successfully changed.

                    If you made this change, you can safely ignore this email.

                    If you didn't change your password, please contact our support team immediately.

                    Login here: %s/login

                    Best regards,
                    DEVision Security Team
                    """,
                    company.getEmail() != null ? company.getEmail() : "there",
                    frontendUrl));

            mailSender.send(message);
            log.info("Password changed confirmation email sent to: {}", company.getEmail());

        } catch (Exception e) {
            log.error("Failed to send password changed email to {}: {}", company.getEmail(), e.getMessage());
        }
    }

    @Override
    @Async
    public void sendEmailChangedConfirmation(CompanyAccount company) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(company.getEmail()); // new email
            message.setSubject("DEVision-JM Email Changed Successfully");
            message.setText(String.format("""
                Hello,

                Your email address has been successfully changed to: %s

                If you made this change, you can safely ignore this email.

                If you didn't change your email, please contact our support team immediately.

                Login here: %s/login

                Best regards,
                DEVision Security Team
                """,
                    company.getEmail(),
                    frontendUrl));

            mailSender.send(message);
            log.info("Email change confirmation sent to: {}", company.getEmail());

        } catch (Exception e) {
            log.error("Failed to send email change confirmation to {}: {}", company.getEmail(), e.getMessage());
        }
    }
}
