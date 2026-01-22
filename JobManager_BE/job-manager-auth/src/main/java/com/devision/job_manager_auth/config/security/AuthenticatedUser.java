package com.devision.job_manager_auth.config.security;


import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class AuthenticatedUser {

    private final UUID userId;
    private final String email;
    private final String role;
    private final String countryCode;

    @Override
    public String toString() {
        return "AuthenticatedUser{" +
                "userId=" + userId +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", countryCode='" + countryCode + '\'' +
                '}';
    }

}
