import { useState, useCallback, useEffect } from "react";
import ApplicantSearchService from "../api/ApplicantSearchService";
import type {
    SearchProfileResponse,
    CreateSearchProfileRequest,
    UpdateSearchProfileRequest,
    SearchState,
} from "../types";

interface UseSearchProfilesReturn {
    // State
    profiles: SearchProfileResponse[];
    selectedProfile: SearchProfileResponse | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    // Actions
    loadProfiles: () => Promise<void>;
    selectProfile: (profileId: string | null) => void;
    createProfile: (
        name: string,
        searchState: SearchState
    ) => Promise<SearchProfileResponse | null>;
    updateProfile: (
        profileId: string,
        updates: UpdateSearchProfileRequest
    ) => Promise<SearchProfileResponse | null>;
    deleteProfile: (profileId: string) => Promise<boolean>;
    toggleProfileStatus: (
        profileId: string,
        isActive: boolean
    ) => Promise<boolean>;
}

export const useSearchProfiles = (): UseSearchProfilesReturn => {
    const [profiles, setProfiles] = useState<SearchProfileResponse[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<SearchProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProfiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await ApplicantSearchService.getCompanySearchProfiles();
            if (response.success && response.data) {
                setProfiles(response.data);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load search profiles"
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectProfile = useCallback(
        (profileId: string | null) => {
            if (!profileId) {
                setSelectedProfile(null);
                return;
            }
            const profile = profiles.find((p) => p.id === profileId);
            setSelectedProfile(profile || null);
        },
        [profiles]
    );

    const createProfile = useCallback(
        async (
            name: string,
            searchState: SearchState
        ): Promise<SearchProfileResponse | null> => {
            setIsSaving(true);
            setError(null);

            try {
                const request: Omit<CreateSearchProfileRequest, "companyId"> = {
                    profileName: name,
                    countryCode: searchState.countryCode,
                    city: searchState.city,
                    education: searchState.education,
                    workExperience: searchState.workExperience,
                    employmentTypes: searchState.employmentTypes,
                    skillIds: searchState.skillIds,
                    isActive: true,
                    // Salary for profile matching (not used in search API)
                    minSalary: searchState.minSalary,
                    maxSalary: searchState.maxSalary,
                };

                const response = await ApplicantSearchService.createSearchProfile(request);
                if (response.success && response.data) {
                    setProfiles((prev) => [...prev, response.data]);
                    setSelectedProfile(response.data);
                    return response.data;
                }
                return null;
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to create search profile"
                );
                return null;
            } finally {
                setIsSaving(false);
            }
        },
        []
    );

    const updateProfile = useCallback(
        async (
            profileId: string,
            updates: UpdateSearchProfileRequest
        ): Promise<SearchProfileResponse | null> => {
            setIsSaving(true);
            setError(null);

            try {
                const response = await ApplicantSearchService.updateSearchProfile(
                    profileId,
                    updates
                );
                if (response.success && response.data) {
                    setProfiles((prev) =>
                        prev.map((p) => (p.id === profileId ? response.data : p))
                    );
                    if (selectedProfile?.id === profileId) {
                        setSelectedProfile(response.data);
                    }
                    return response.data;
                }
                return null;
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to update search profile"
                );
                return null;
            } finally {
                setIsSaving(false);
            }
        },
        [selectedProfile]
    );

    const deleteProfile = useCallback(
        async (profileId: string): Promise<boolean> => {
            setIsSaving(true);
            setError(null);

            try {
                await ApplicantSearchService.deleteSearchProfile(profileId);
                setProfiles((prev) => prev.filter((p) => p.id !== profileId));
                if (selectedProfile?.id === profileId) {
                    setSelectedProfile(null);
                }
                return true;
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to delete search profile"
                );
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [selectedProfile]
    );

    const toggleProfileStatus = useCallback(
        async (profileId: string, isActive: boolean): Promise<boolean> => {
            setIsSaving(true);
            setError(null);

            try {
                const response = await ApplicantSearchService.updateSearchProfileStatus(
                    profileId,
                    { isActive }
                );
                if (response.success && response.data) {
                    setProfiles((prev) =>
                        prev.map((p) => (p.id === profileId ? response.data : p))
                    );
                    if (selectedProfile?.id === profileId) {
                        setSelectedProfile(response.data);
                    }
                    return true;
                }
                return false;
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to update profile status"
                );
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [selectedProfile]
    );

    // Load profiles on mount
    useEffect(() => {
        loadProfiles();
    }, [loadProfiles]);

    return {
        profiles,
        selectedProfile,
        isLoading,
        isSaving,
        error,
        loadProfiles,
        selectProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        toggleProfileStatus,
    };
};
