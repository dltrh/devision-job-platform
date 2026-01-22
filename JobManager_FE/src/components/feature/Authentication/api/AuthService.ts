import axios, { AxiosError } from "axios";
import httpClient from "@/services/httpClient";
import type { ApiResponse } from "@/types";
import type { AuthTokens } from "@/types";
import type { SignupPayload } from "../CompanySignup/types.ts";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailPayload {
  newEmail: string;
  currentPassword: string;
}

export interface ActivationPayload {
  token: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface CompleteSsoRegistrationPayload {
  token: string;
  country: string;
}

type NullableStringResponse = ApiResponse<string | null>;

const AUTH_BASE_PATH_SSO = "/auth/oauth2";
const AUTH_BASE_PATH = "/auth";

const COUNTRY_ENTRIES = [
  { code: "VIETNAM", iso: "VN", name: "Vietnam" },
  { code: "SINGAPORE", iso: "SG", name: "Singapore" },
  { code: "MALAYSIA", iso: "MY", name: "Malaysia" },
  { code: "THAILAND", iso: "TH", name: "Thailand" },
  { code: "PHILIPPINES", iso: "PH", name: "Philippines" },
  { code: "INDONESIA", iso: "ID", name: "Indonesia" },
  { code: "JAPAN", iso: "JP", name: "Japan" },
  { code: "SOUTH_KOREA", iso: "KR", name: "South Korea" },
  { code: "CHINA", iso: "CN", name: "China" },
  { code: "AUSTRALIA", iso: "AU", name: "Australia" },
  { code: "NEW_ZEALAND", iso: "NZ", name: "New Zealand" },
  { code: "UNITED_STATES", iso: "US", name: "United States" },
  { code: "CANADA", iso: "CA", name: "Canada" },
  { code: "UNITED_KINGDOM", iso: "GB", name: "United Kingdom" },
  { code: "GERMANY", iso: "DE", name: "Germany" },
  { code: "FRANCE", iso: "FR", name: "France" },
  { code: "NETHERLANDS", iso: "NL", name: "Netherlands" },
  { code: "INDIA", iso: "IN", name: "India" },
  { code: "OTHER", iso: "XX", name: "Other" },
];

const COUNTRY_LOOKUP = COUNTRY_ENTRIES.reduce<Record<string, string>>(
  (acc, entry) => {
    acc[entry.code] = entry.code;
    acc[entry.iso] = entry.code;
    acc[entry.name.toUpperCase()] = entry.code;
    return acc;
  },
  {},
);

const resolveCountryCode = (country: string): string => {
  if (!country) {
    return "OTHER";
  }

  const trimmed = country.trim();
  const upper = trimmed.toUpperCase();
  const candidates = [
    upper,
    upper.replace(/\s+/g, "_"),
    upper.replace(/[^A-Z]/g, ""),
  ];

  for (const candidate of candidates) {
    if (COUNTRY_LOOKUP[candidate]) {
      return COUNTRY_LOOKUP[candidate];
    }
  }

  return upper.replace(/\s+/g, "_");
};

const normalizeAxiosError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const fallback = "Unable to complete the request. Please try again.";
    const apiMessage = axiosError.response?.data?.message;
    const message = apiMessage || axiosError.message || fallback;
    throw new Error(message);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(
    "Unexpected error occurred while communicating with the server.",
  );
};

const loginCompany = async (
  payload: LoginPayload,
): Promise<ApiResponse<AuthTokens>> => {
  try {
    const response = await httpClient.post<ApiResponse<AuthTokens>>(
      `${AUTH_BASE_PATH}/login`,
      payload,
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const signupCompany = async (
  payload: SignupPayload,
): Promise<NullableStringResponse> => {
  try {
    const requestBody = {
      email: payload.email.trim(),
      password: payload.password,
      country: resolveCountryCode(payload.country),
    };

    const response = await httpClient.post<NullableStringResponse>(
      `${AUTH_BASE_PATH}/register`,
      requestBody,
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const activateAccount = async (
  payload: ActivationPayload,
): Promise<NullableStringResponse> => {
  try {
    const response = await httpClient.post<NullableStringResponse>(
      `${AUTH_BASE_PATH}/activate`,
      payload,
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const resendActivationEmail = async (
  email: string,
): Promise<NullableStringResponse> => {
  try {
    const response = await httpClient.post<NullableStringResponse>(
      `${AUTH_BASE_PATH}/resend-activation`,
      null,
      {
        params: { email },
      },
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const completeSsoRegistration = async (
  payload: CompleteSsoRegistrationPayload,
): Promise<ApiResponse<AuthTokens>> => {
  try {
    console.log("Calling /auth/complete with payload:", {
      token: payload.token.substring(0, 20) + "...",
      country: payload.country,
    });

    const response = await httpClient.post<ApiResponse<AuthTokens>>(
      `${AUTH_BASE_PATH_SSO}/complete`,
      {
        token: payload.token,
        country: payload.country,
      },
    );

    console.log("SSO completion response:", response.data);
    return response.data;
  } catch (error) {
    console.error("SSO completion failed:", error);

    if (axios.isAxiosError(error)) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
    }

    normalizeAxiosError(error);
    throw error;
  }
};

const refreshAuthToken = async (
  payload: RefreshTokenPayload,
): Promise<ApiResponse<AuthTokens>> => {
  try {
    const response = await httpClient.post<ApiResponse<AuthTokens>>(
      `${AUTH_BASE_PATH}/refresh`,
      payload,
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const logoutCompany = async (): Promise<NullableStringResponse> => {
  try {
    const response = await httpClient.post<NullableStringResponse>(
      `${AUTH_BASE_PATH}/logout`,
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const fetchHealth = async (): Promise<string> => {
  try {
    const response = await httpClient.get<string>(`${AUTH_BASE_PATH}/health`);
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const forgotPasswordCompany = async (
  payload: ForgotPasswordPayload,
): Promise<NullableStringResponse> => {
  try {
    const response = await httpClient.post<NullableStringResponse>(
      `${AUTH_BASE_PATH}/forgot-password`,
      payload,
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const resetPasswordCompany = async (
  payload: ResetPasswordPayload,
): Promise<NullableStringResponse> => {
  try {
    const response = await httpClient.post<NullableStringResponse>(
      `${AUTH_BASE_PATH}/reset-password`,
      payload,
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const getCountries = async (): Promise<
  ApiResponse<Array<{ code: string; displayName: string }>>
> => {
  try {
    const response = await httpClient.get<
      ApiResponse<Array<{ code: string; displayName: string }>>
    >(`${AUTH_BASE_PATH}/countries`);
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const changePasswordCompany = async (
  companyId: string,
  payload: ChangePasswordPayload,
): Promise<NullableStringResponse> => {
  try {
    const response = await httpClient.post<NullableStringResponse>(
      `${AUTH_BASE_PATH}/change-password`,
      payload,
      {
        params: { companyId },
      },
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const changeEmailCompany = async (
  companyId: string,
  payload: ChangeEmailPayload,
): Promise<NullableStringResponse> => {
  try {
    const response = await httpClient.post<NullableStringResponse>(
      `${AUTH_BASE_PATH}/change-email`,
      payload,
      {
        params: { companyId },
      },
    );
    return response.data;
  } catch (error) {
    normalizeAxiosError(error);
    throw error;
  }
};

const AuthService = {
  loginCompany,
  signupCompany,
  activateAccount,
  resendActivationEmail,
  completeSsoRegistration,
  forgotPasswordCompany,
  resetPasswordCompany,
  refreshAuthToken,
  logoutCompany,
  fetchHealth,
  getCountries,
  changePasswordCompany,
  changeEmailCompany,
};

export default AuthService;
