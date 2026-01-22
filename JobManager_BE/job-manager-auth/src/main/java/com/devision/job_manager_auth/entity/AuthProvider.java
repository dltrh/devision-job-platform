package com.devision.job_manager_auth.entity;

/**
 * Authentication provider types.
 * Replaces SsoProvider with clearer naming.
 */
public enum AuthProvider {
    LOCAL,      // Email/password authentication
    GOOGLE,     // Google OAuth2
    MICROSOFT,  // Microsoft OAuth2
    FACEBOOK,   // Facebook OAuth2
    GITHUB      // GitHub OAuth2
}
