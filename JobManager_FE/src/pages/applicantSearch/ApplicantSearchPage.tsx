import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
    Filters,
    SavedSearchProfiles,
    SearchBar,
    ApplicantList,
    ApplicantDetailsModal,
} from "@/components/feature/ApplicantSearch/components";
import {
    useApplicantSearch,
    useSearchProfiles,
    useSubscription,
} from "@/components/feature/ApplicantSearch/hooks";
import { HeadlessModal } from "@/components/headless";
import { Button } from "@/components/ui";
import type {
    Applicant,
    SearchState,
    UpdateSearchProfileRequest,
    ApplicantStatusType,
    StatusFilterType,
} from "@/components/feature/ApplicantSearch/types";
import ApplicantSearchService from "@/components/feature/ApplicantSearch/api/ApplicantSearchService";
import { Star, AlertCircle, Users, SlidersHorizontal, X } from "lucide-react";

// Filter fields to compare for dirty state (excludes username, sortBy, page, pageSize)
const FILTER_KEYS: (keyof SearchState)[] = [
    "countryCode",
    "city",
    "employmentTypes",
    "education",
    "workExperience",
    // TODO: Salary for Search - These are only for profile creation (Kafka matching)
    "minSalary",
    "maxSalary",
    "skillIds",
];

// Compare two filter states to check if they are equal
const areFiltersEqual = (a: SearchState, b: SearchState): boolean => {
    for (const key of FILTER_KEYS) {
        const valA = a[key];
        const valB = b[key];

        if (Array.isArray(valA) && Array.isArray(valB)) {
            if (valA.length !== valB.length) return false;
            const sortedA = [...valA].sort();
            const sortedB = [...valB].sort();
            if (!sortedA.every((v, i) => v === sortedB[i])) return false;
        } else if (valA !== valB) {
            return false;
        }
    }
    return true;
};

export const ApplicantSearchPage: React.FC = () => {
    // Hooks
    const {
        searchState,
        applicants,
        totalElements,
        totalPages,
        isLoading: isSearching,
        error: searchError,
        updateSearchState,
        setSearchState,
        resetSearchState,
        search,
        goToPage,
    } = useApplicantSearch();

    const {
        profiles,
        selectedProfile,
        isSaving,
        selectProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        toggleProfileStatus,
    } = useSearchProfiles();

    const { isPremium } = useSubscription();

    // Local state
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Unsaved changes tracking
    const [originalFilters, setOriginalFilters] = useState<SearchState>(searchState);
    const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
    const [pendingProfileId, setPendingProfileId] = useState<string | null | undefined>(undefined);
    const [showSaveAsNewModal, setShowSaveAsNewModal] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Ref to track if we should trigger save-as-new modal after unsaved changes modal closes
    const triggerSaveAsNewRef = useRef(false);

    // Check if filters have been modified
    const hasUnsavedChanges = useMemo(() => {
        return !areFiltersEqual(searchState, originalFilters);
    }, [searchState, originalFilters]);

    // Update original filters when a profile is loaded
    useEffect(() => {
        if (selectedProfile) {
            const newState: SearchState = {
                ...searchState,
                countryCode: selectedProfile.countryCode,
                city: selectedProfile.city,
                employmentTypes: selectedProfile.employmentTypes,
                education: selectedProfile.education,
                workExperience: selectedProfile.workExperience,
                // Salary for profile matching (not used in search API)
                minSalary: selectedProfile.minSalary,
                maxSalary: selectedProfile.maxSalary,
                skillIds: selectedProfile.skillIds,
                page: 0,
            };
            setSearchState(newState);
            setOriginalFilters(newState);
        }
    }, [selectedProfile?.id]);

    // Effect to trigger save-as-new modal after unsaved changes modal closes
    useEffect(() => {
        if (!isUnsavedChangesModalOpen && triggerSaveAsNewRef.current) {
            triggerSaveAsNewRef.current = false;
            // Small delay to ensure first modal is fully closed
            setTimeout(() => {
                setShowSaveAsNewModal(true);
            }, 100);
        }
    }, [isUnsavedChangesModalOpen]);

    // Handlers
    const handleSearch = useCallback(() => {
        updateSearchState({ page: 0 });
        search();
    }, [updateSearchState, search]);

    const handleFilterChange = useCallback(
        (updates: Partial<SearchState>) => {
            updateSearchState(updates);
        },
        [updateSearchState]
    );

    // Profile selection with unsaved changes check
    const handleProfileSelection = useCallback(
        (profileId: string | null) => {
            // Don't show modal if selecting the same profile
            if (profileId === (selectedProfile?.id || null)) return;

            if (hasUnsavedChanges && isPremium) {
                setPendingProfileId(profileId);
                setIsUnsavedChangesModalOpen(true);
            } else {
                selectProfile(profileId);
                if (!profileId) {
                    // Reset filters to default when deselecting profile
                    resetSearchState();
                    setOriginalFilters(searchState);
                }
            }
        },
        [
            hasUnsavedChanges,
            isPremium,
            selectedProfile?.id,
            selectProfile,
            searchState,
            resetSearchState,
        ]
    );

    // Save changes to current profile and switch
    const handleSaveAndSwitch = useCallback(async () => {
        if (!selectedProfile) return;

        const updates: UpdateSearchProfileRequest = {
            profileName: selectedProfile.profileName,
            countryCode: searchState.countryCode,
            city: searchState.city,
            employmentTypes: searchState.employmentTypes,
            education: searchState.education,
            workExperience: searchState.workExperience,
            // Salary for profile matching (not used in search API)
            minSalary: searchState.minSalary,
            maxSalary: searchState.maxSalary,
            skillIds: searchState.skillIds,
        };

        await updateProfile(selectedProfile.id, updates);
        setIsUnsavedChangesModalOpen(false);

        // Switch to pending profile
        if (pendingProfileId !== undefined) {
            selectProfile(pendingProfileId);
            setPendingProfileId(undefined);
        }
    }, [selectedProfile, searchState, updateProfile, pendingProfileId, selectProfile]);

    // Trigger save as new modal (close unsaved modal first)
    const handleSaveAsNewAndSwitch = useCallback(() => {
        triggerSaveAsNewRef.current = true;
        setIsUnsavedChangesModalOpen(false);
    }, []);

    // Discard changes and switch
    const handleDiscardAndSwitch = useCallback(() => {
        setIsUnsavedChangesModalOpen(false);

        if (pendingProfileId !== undefined) {
            selectProfile(pendingProfileId);
            setPendingProfileId(undefined);
        }
    }, [pendingProfileId, selectProfile]);

    // Cancel modal - stay on current profile
    const handleCancelSwitch = useCallback(() => {
        setIsUnsavedChangesModalOpen(false);
        setPendingProfileId(undefined);
    }, []);

    // Handle save as new from the triggered modal
    const handleSaveAsNew = useCallback(
        async (name: string) => {
            await createProfile(name, searchState);
            setShowSaveAsNewModal(false);

            // Switch to pending profile after saving
            if (pendingProfileId !== undefined) {
                selectProfile(pendingProfileId);
                setPendingProfileId(undefined);
            }
        },
        [createProfile, searchState, pendingProfileId, selectProfile]
    );

    const handleSaveChanges = useCallback(async () => {
        if (!selectedProfile) return;

        const updates: UpdateSearchProfileRequest = {
            profileName: selectedProfile.profileName,
            countryCode: searchState.countryCode,
            city: searchState.city,
            employmentTypes: searchState.employmentTypes,
            education: searchState.education,
            workExperience: searchState.workExperience,
            // Salary for profile matching (not used in search API)
            minSalary: searchState.minSalary,
            maxSalary: searchState.maxSalary,
            skillIds: searchState.skillIds,
        };

        await updateProfile(selectedProfile.id, updates);
        setOriginalFilters(searchState);
    }, [selectedProfile, searchState, updateProfile]);

    const handleDelete = useCallback(async () => {
        if (!selectedProfile) return;
        await deleteProfile(selectedProfile.id);
    }, [selectedProfile, deleteProfile]);

    const handleApplicantClick = useCallback((applicant: Applicant) => {
        setSelectedApplicant(applicant);
        setIsDetailsModalOpen(true);
    }, []);

    const handleCloseDetailsModal = useCallback(() => {
        setIsDetailsModalOpen(false);
        setSelectedApplicant(null);
    }, []);

    const handleApplicantStatusChange = useCallback(
        async (applicantId: string, status: ApplicantStatusType) => {
            try {
                await ApplicantSearchService.setApplicantStatus(applicantId, {
                    status,
                });
                // Update the local applicant state to reflect the change
                if (selectedApplicant && selectedApplicant.id === applicantId) {
                    setSelectedApplicant({ ...selectedApplicant, companyStatus: status });
                }
                // Refresh search results to show updated status
                search();
            } catch (err) {
                console.error("Failed to update applicant status:", err);
            }
        },
        [selectedApplicant, search]
    );

    const handleProfileStatusChange = useCallback(
        async (isActive: boolean) => {
            if (!selectedProfile) return;
            await toggleProfileStatus(selectedProfile.id, isActive);
        },
        [selectedProfile, toggleProfileStatus]
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Page Header */}
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Applicant Search
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Search and filter applicants to find the perfect candidates
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
                    <SearchBar
                        searchTerm={searchState.username}
                        ftsQuery={searchState.ftsQuery}
                        sortBy={searchState.sortBy}
                        onSearchTermChange={(username) => updateSearchState({ username })}
                        onFtsQueryChange={(ftsQuery) => updateSearchState({ ftsQuery })}
                        onSortChange={(sortBy) => updateSearchState({ sortBy })}
                        onSearch={handleSearch}
                        disabled={isSearching}
                    />
                </div>

                {/* Mobile Filter Toggle Button */}
                <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters & Saved Profiles
                </button>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Mobile Filter Overlay */}
                    {isMobileFiltersOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setIsMobileFiltersOpen(false)}
                        />
                    )}

                    {/* Left Sidebar - Saved Profiles & Filters */}
                    <aside
                        className={`
              fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:inset-auto lg:z-auto lg:w-80 lg:max-w-none lg:transform-none lg:transition-none flex-shrink-0
              ${isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
                    >
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between p-4 border-b lg:hidden">
                            <h2 className="text-lg font-semibold">Filters & Profiles</h2>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Close filters"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="h-full overflow-y-auto lg:h-auto lg:overflow-visible">
                            <div className="bg-white lg:rounded-lg lg:shadow-sm p-4 lg:sticky lg:top-4 space-y-6">
                                {/* Unsaved changes indicator */}
                                {hasUnsavedChanges && isPremium && (
                                    <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                        You have unsaved filter changes
                                    </div>
                                )}

                                {/* Saved Search Profiles */}
                                <SavedSearchProfiles
                                    profiles={profiles}
                                    selectedProfile={selectedProfile}
                                    isPremium={isPremium}
                                    isSaving={isSaving}
                                    searchState={searchState}
                                    onSelectProfile={handleProfileSelection}
                                    onSaveAsNew={handleSaveAsNew}
                                    onSaveChanges={handleSaveChanges}
                                    onDelete={handleDelete}
                                />

                                <hr className="border-gray-200" />

                                {/* Filters */}
                                <Filters
                                    searchState={searchState}
                                    onFilterChange={handleFilterChange}
                                    onClearFilters={resetSearchState}
                                    onSearch={() => {
                                        handleSearch();
                                        setIsMobileFiltersOpen(false);
                                    }}
                                    disabled={isSearching}
                                    selectedProfileId={selectedProfile?.id}
                                    isProfileActive={selectedProfile?.isActive ?? false}
                                    onProfileStatusChange={handleProfileStatusChange}
                                    isUpdatingStatus={isSaving}
                                />

                                {/* Mobile Apply Button */}
                                <div className="lg:hidden pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            handleSearch();
                                            setIsMobileFiltersOpen(false);
                                        }}
                                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Content - Applicant List */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg shadow-sm">
                            {/* Status Tabs */}
                            <div className="border-b border-gray-200 px-2 sm:px-4 overflow-x-auto">
                                <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
                                    {[
                                        {
                                            id: "ALL" as StatusFilterType,
                                            label: "All Applicants",
                                            icon: Users,
                                        },
                                        {
                                            id: "FAVORITE" as StatusFilterType,
                                            label: "Favorites",
                                            icon: Star,
                                        },
                                        {
                                            id: "WARNING" as StatusFilterType,
                                            label: "Warnings",
                                            icon: AlertCircle,
                                        },
                                    ].map((tab) => {
                                        const isActive =
                                            (searchState.statusFilter || "ALL") === tab.id;
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    updateSearchState({
                                                        statusFilter: tab.id,
                                                        page: 0,
                                                    });
                                                }}
                                                className={`flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap ${
                                                    isActive
                                                        ? "border-blue-500 text-blue-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                }`}
                                            >
                                                <Icon
                                                    className={`w-4 h-4 ${tab.id === "FAVORITE" && isActive ? "fill-current" : ""}`}
                                                />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Applicant List */}
                            <div className="p-3 sm:p-4">
                                <ApplicantList
                                    applicants={applicants}
                                    isLoading={isSearching}
                                    error={searchError}
                                    currentPage={searchState.page}
                                    totalPages={totalPages}
                                    totalElements={totalElements}
                                    pageSize={searchState.pageSize}
                                    onPageChange={goToPage}
                                    onApplicantClick={handleApplicantClick}
                                />
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Applicant Details Modal */}
            <ApplicantDetailsModal
                applicant={selectedApplicant}
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                onStatusChange={handleApplicantStatusChange}
            />

            {/* Unsaved Changes Modal */}
            <HeadlessModal
                isOpen={isUnsavedChangesModalOpen}
                onClose={handleCancelSwitch}
                overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
                <h2 className="text-lg font-semibold mb-2">Unsaved Changes</h2>
                <p className="text-gray-600 mb-4">
                    You have unsaved filter changes. What would you like to do?
                </p>

                <div className="flex flex-col gap-2">
                    {selectedProfile && (
                        <Button
                            variant="primary"
                            onClick={handleSaveAndSwitch}
                            disabled={isSaving}
                            fullWidth
                        >
                            {isSaving ? "Saving..." : `Update "${selectedProfile.profileName}"`}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={handleSaveAsNewAndSwitch}
                        disabled={isSaving}
                        fullWidth
                    >
                        Save as New Profile
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDiscardAndSwitch}
                        disabled={isSaving}
                        fullWidth
                    >
                        Discard Changes
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleCancelSwitch}
                        disabled={isSaving}
                        fullWidth
                    >
                        Cancel
                    </Button>
                </div>
            </HeadlessModal>

            {/* Save As New Modal (triggered after unsaved changes modal) */}
            <HeadlessModal
                isOpen={showSaveAsNewModal}
                onClose={() => {
                    setShowSaveAsNewModal(false);
                    setPendingProfileId(undefined);
                }}
                overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
                <SaveAsNewForm
                    onSave={handleSaveAsNew}
                    onCancel={() => {
                        setShowSaveAsNewModal(false);
                        setPendingProfileId(undefined);
                    }}
                    isSaving={isSaving}
                />
            </HeadlessModal>
        </div>
    );
};

// Separate component for the save as new form
const SaveAsNewForm: React.FC<{
    onSave: (name: string) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ onSave, onCancel, isSaving }) => {
    const [profileName, setProfileName] = useState("");
    const [nameError, setNameError] = useState("");

    const handleSubmit = async () => {
        if (!profileName.trim()) {
            setNameError("Profile name is required");
            return;
        }
        if (profileName.length > 255) {
            setNameError("Profile name must be less than 255 characters");
            return;
        }
        await onSave(profileName.trim());
    };

    return (
        <>
            <h2 className="text-lg font-semibold mb-4">Save Search Profile</h2>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                        setProfileName(e.target.value);
                        setNameError("");
                    }}
                    placeholder="Enter profile name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={255}
                    autoFocus
                />
                {nameError && <p className="text-sm text-red-600 mt-1">{nameError}</p>}
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                </Button>
            </div>
        </>
    );
};

export default ApplicantSearchPage;
