import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/utils/constants";
import type { AuthTokens } from "@/types";

const isBrowser = typeof window !== "undefined";

type StoredUser = Pick<AuthTokens, "companyId" | "email" | "role" | "authProvider"> & {
    tokenType: AuthTokens["tokenType"];
    expiresIn: AuthTokens["expiresIn"];
};

export const storeAuthSession = (tokens: AuthTokens): void => {
    if (!isBrowser) return;

    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

    const userPayload: StoredUser = {
        companyId: tokens.companyId,
        email: tokens.email,
        role: tokens.role,
        authProvider: tokens.authProvider,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(userPayload));

    window.dispatchEvent(new Event("auth-change"));
};

export const clearAuthSession = (): void => {
    if (!isBrowser) return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    window.dispatchEvent(new Event("auth-change"));
};

export const getAccessToken = (): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): StoredUser | null => {
    if (!isBrowser) return null;

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as StoredUser;
    } catch (error) {
        console.error("Failed to parse stored user payload", error);
        localStorage.removeItem(USER_KEY);
        return null;
    }
};

export const getCompanyId = (): string | null => {
    const user = getStoredUser();
    return user?.companyId || null;
};

export const updateStoredUserEmail = (newEmail: string): void => {
    if (!isBrowser) return;

    const user = getStoredUser();
    if (!user) return;

    const updatedUser: StoredUser = {
        ...user,
        email: newEmail,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("auth-change"));
};

/**
 * Dispatch event to notify components that subscription status has changed.
 * Call this after successful payment, subscription cancellation, or renewal.
 */
export const notifySubscriptionChange = (): void => {
    if (!isBrowser) return;
    window.dispatchEvent(new Event("subscription-change"));
};
