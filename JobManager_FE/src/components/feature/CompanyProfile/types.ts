// Company Profile Types

// Company data from GET /companies/{companyId}
export interface Company {
  id: string;
  name: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  countryCode?: string;
}

// Profile data from GET /companies/{companyId}/profile
export interface CompanyProfile {
  companyId: string;
  aboutUs?: string;
  whoWeSeek?: string;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
}

// Combined data for the UI
export interface CompanyFullData {
  company: Company;
  profile: CompanyProfile;
}

// Form data for Company endpoint (PUT /companies/{companyId})
export interface CompanyFormData {
  name: string;
  phone: string;
  streetAddress: string;
  city: string;
  countryCode: string;
}

// Form data for Profile endpoint (PUT /companies/{companyId}/profile)
export interface ProfileFormData {
  aboutUs: string;
  whoWeSeek: string;
  websiteUrl: string;
  linkedinUrl: string;
  industry: string;
  companySize: string;
  foundedYear: string;
}

// Combined form data for the UI
export interface CompanyProfileFormData
  extends CompanyFormData, ProfileFormData {}

export type MediaType = "LOGO" | "BANNER" | "IMAGE" | "VIDEO";

export interface CompanyMedia {
  id: string;
  companyId: string;
  type: MediaType; // Backend returns 'type' field
  url: string;
  title?: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
}

export interface MediaUploadPayload {
  file: File;
  mediaType: MediaType; // Used in frontend, mapped to 'type' in API call
  title?: string;
  description?: string;
}

export interface MediaReorderItem {
  mediaId: string;
  displayOrder: number;
}

export interface ChangeEmailPayload {
  newEmail: string;
  currentPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type ProfileSection =
  | "company-info"
  | "media-showcase"
  | "account-security"
  | "notifications"
  | "payment-subscription";
