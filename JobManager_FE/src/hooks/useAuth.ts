import { getAccessToken } from "@/services/authStorage";

/**
 * Hook to check if user is authenticated
 * Returns true if user has a valid access token
 */
export const useAuth = () => {
    const token = getAccessToken();
    const isAuthenticated = !!token;

    return {
        isAuthenticated,
    };
};
