package com.devision.job_manager_auth.dto.external;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TokenValidationResponse {

    private boolean valid;
    private String userId;
    private String email;
    private String role;
    private String countryCode;

    public static TokenValidationResponse invalid() {
        return TokenValidationResponse.builder()
                .valid(false)
                .userId(null)
                .email(null)
                .role(null)
                .countryCode(null)
                .build();
    }

    public static TokenValidationResponse valid(String userId, String email, String role, String countryCode) {
        return TokenValidationResponse.builder()
                .valid(true)
                .userId(userId)
                .email(email)
                .role(role)
                .countryCode(countryCode)
                .build();
    }

}
