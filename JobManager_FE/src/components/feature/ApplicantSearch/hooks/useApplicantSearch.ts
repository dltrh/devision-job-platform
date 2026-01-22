import { useState, useCallback, useEffect } from "react";
import ApplicantSearchService from "../api/ApplicantSearchService";
import { MOCK_APPLICANTS } from "../data/mockApplicants";
import type {
    SearchState,
    Applicant,
} from "../types";
import { DEFAULT_SEARCH_STATE } from "../types";

interface UseApplicantSearchReturn {
    // State
    searchState: SearchState;
    applicants: Applicant[];
    totalElements: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    updateSearchState: (updates: Partial<SearchState>) => void;
    setSearchState: (state: SearchState) => void;
    resetSearchState: () => void;
    search: () => Promise<void>;
    goToPage: (page: number) => void;
}

// Toggle this to use mock data instead of API
const USE_MOCK_DATA = false;

export const useApplicantSearch = (): UseApplicantSearchReturn => {
    // Search state
    const [searchState, setSearchStateInternal] = useState<SearchState>(DEFAULT_SEARCH_STATE);

    // Results state
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update search state partially
    const updateSearchState = useCallback((updates: Partial<SearchState>) => {
        setSearchStateInternal((prev) => ({
            ...prev,
            ...updates,
            // Reset to page 0 when filters change (except when only page changes)
            page: updates.page !== undefined ? updates.page : 0,
        }));
    }, []);

    // Set entire search state
    const setSearchState = useCallback((state: SearchState) => {
        setSearchStateInternal(state);
    }, []);

    // Reset search state
    const resetSearchState = useCallback(() => {
        setSearchStateInternal(DEFAULT_SEARCH_STATE);
    }, []);

    // Go to specific page
    const goToPage = useCallback((page: number) => {
        setSearchStateInternal((prev) => ({
            ...prev,
            page,
        }));
    }, []);

    // Search function - real API call
    // TODO: Applicant Data Dependency
    // The exact structure of applicant data is owned by the Job Applicant team.
    // Field names may change when the JA service is updated.
    const searchWithAPI = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await ApplicantSearchService.searchApplicants(searchState);
            if (response.success && response.data) {
                // Map JA response to our Applicant type
                const mappedApplicants: Applicant[] = response.data.content.map((a) => ({
                    ...a,
                    // Map objectiveSummary to bio
                    bio: a.bio || (a as unknown as { objectiveSummary?: string }).objectiveSummary,
                    // Map country.abbreviation to countryCode for backwards compatibility
                    countryCode: a.countryCode || a.country?.abbreviation,
                    // Provide defaults for fields not in JA response
                    employmentTypes: a.employmentTypes || [],
                    skills: a.skills || [],
                    education: a.education || [],
                    workExperience: a.workExperience || [],
                    createdAt: a.createdAt || new Date().toISOString(),
                    updatedAt: a.updatedAt || new Date().toISOString(),
                }));
                setApplicants(mappedApplicants);
                setTotalElements(response.data.totalElements);
                setTotalPages(response.data.totalPages);
            } else {
                setError(response.message || "Search failed");
            }
        } catch (err) {
            setError("Failed to search applicants");
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [searchState]);

    // Search function - mock data for UI testing
    const searchWithMock = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Apply filters to mock data
            let filteredApplicants = [...MOCK_APPLICANTS];

            // Filter by username (search in name, email, bio, skills)
            if (searchState.username) {
                const searchTerm = searchState.username.toLowerCase();
                filteredApplicants = filteredApplicants.filter(
                    (a) =>
                        a.fullName.toLowerCase().includes(searchTerm) ||
                        a.email.toLowerCase().includes(searchTerm) ||
                        a.bio?.toLowerCase().includes(searchTerm) ||
                        a.skills.some((s) =>
                            s.name.toLowerCase().includes(searchTerm)
                        )
                );
            }

            // Filter by country
            if (searchState.countryCode) {
                filteredApplicants = filteredApplicants.filter(
                    (a) => a.countryCode === searchState.countryCode
                );
            }

            // Filter by city (case-insensitive partial match, like JA service)
            if (searchState.city) {
                const cityTerm = searchState.city.toLowerCase();
                filteredApplicants = filteredApplicants.filter(
                    (a) => a.city?.toLowerCase().includes(cityTerm)
                );
            }

            // Filter by work experience (search in job title, company, description - like JA service)
            if (searchState.workExperience) {
                const keywords = searchState.workExperience
                    .split(',')
                    .map((k) => k.trim().toLowerCase())
                    .filter((k) => k.length > 0);
                
                if (keywords.length > 0) {
                    filteredApplicants = filteredApplicants.filter((a) =>
                        a.workExperience.some((exp) =>
                            keywords.some(
                                (kw) =>
                                    exp.title?.toLowerCase().includes(kw) ||
                                    exp.company?.toLowerCase().includes(kw) ||
                                    exp.description?.toLowerCase().includes(kw)
                            )
                        )
                    );
                }
            }

            // Filter by education degree
            if (searchState.education) {
                filteredApplicants = filteredApplicants.filter((a) =>
                    a.education.some((edu) => edu.degree === searchState.education)
                );
            }

            // Filter by skills (OR semantics - match if any skill matches)
            if (searchState.skillIds.length > 0) {
                // Filter by skill ID (searchState.skillIds contains UUIDs)
                filteredApplicants = filteredApplicants.filter((applicant) =>
                    applicant.skills.some((skill) =>
                        searchState.skillIds.includes(skill.id)
                    )
                );
            }

            // Filter by employment types (OR semantics)
            if (searchState.employmentTypes.length > 0) {
                filteredApplicants = filteredApplicants.filter(
                    (a) => a.employmentTypes.some(type => searchState.employmentTypes.includes(type))
                );
            }

            // Sort applicants based on sortBy option
            switch (searchState.sortBy) {
                case "newest":
                    filteredApplicants.sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    break;
                case "oldest":
                    filteredApplicants.sort((a, b) => 
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                    break;
                // TODO: Salary sorting - uncomment when JA adds salary support
                // case "salaryAsc":
                //     filteredApplicants.sort((a, b) => (a.desiredSalary ?? 0) - (b.desiredSalary ?? 0));
                //     break;
                // case "salaryDesc":
                //     filteredApplicants.sort((a, b) => (b.desiredSalary ?? 0) - (a.desiredSalary ?? 0));
                //     break;
                case "isFresher":
                    filteredApplicants.sort((a, b) => {
                        const isFresherA = a.employmentTypes.includes("FRESHER") || a.employmentTypes.includes("INTERNSHIP") ? 1 : 0;
                        const isFresherB = b.employmentTypes.includes("FRESHER") || b.employmentTypes.includes("INTERNSHIP") ? 1 : 0;
                        if (isFresherA !== isFresherB) {
                            return isFresherB - isFresherA;
                        }
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });
                    break;
                default:
                    filteredApplicants.sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
            }

            // Calculate pagination
            const total = filteredApplicants.length;
            const pages = Math.ceil(total / searchState.pageSize);
            const startIndex = searchState.page * searchState.pageSize;
            const paginatedApplicants = filteredApplicants.slice(
                startIndex,
                startIndex + searchState.pageSize
            );

            setApplicants(paginatedApplicants);
            setTotalElements(total);
            setTotalPages(pages);
        } catch (err) {
            setError("Failed to search applicants");
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [searchState]);

    // Main search function - toggles between API and mock
    const search = useCallback(async () => {
        if (USE_MOCK_DATA) {
            await searchWithMock();
        } else {
            await searchWithAPI();
        }
    }, [searchWithAPI, searchWithMock]);

    // Auto-search when page, sort, or filters change
    useEffect(() => {
        search();
    }, [
        searchState.page,
        searchState.sortBy,
        searchState.countryCode,
        searchState.city,
        searchState.employmentTypes,
        searchState.education,
        searchState.workExperience,
        // TODO: Salary filtering - uncomment when JA adds salary support
        // searchState.minSalary,
        // searchState.maxSalary,
        searchState.skillIds,
        searchState.statusFilter,
    ]);

    return {
        searchState,
        applicants,
        totalElements,
        totalPages,
        isLoading,
        error,
        updateSearchState,
        setSearchState,
        resetSearchState,
        search,
        goToPage,
    };
};
