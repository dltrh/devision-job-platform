export type SignupMethod = "credentials" | "google";

export interface SignupPayload {
    email: string;
    password: string;
    confirmPassword: string;
    country: string;
    companyName: string;
    phoneNumber: string;
    address: string;
    companyLogo: File | null;
    signupMethod: SignupMethod;
}

export interface SignupResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export interface AuthError {
    message: string;
    field?: string;
}
