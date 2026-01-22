export interface CompleteProfilePayload {
    companyName: string;
    phoneNumber: string;
    address: string;
    companyLogo: File | null;
}

export interface CompleteProfileResponse {
    success: boolean;
    message: string;
    data?: any;
}
