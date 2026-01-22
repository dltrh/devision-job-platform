// Authentication-specific shared types

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    companyId: string;
    email: string;
    role: string;
    authProvider: string;
}
