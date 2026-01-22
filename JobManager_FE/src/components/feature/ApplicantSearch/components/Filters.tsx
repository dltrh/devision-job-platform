import React, { useState, useEffect } from "react";
import {
    Select,
    Checkbox,
    RangeSlider,
    TagInput,
    RadioGroup,
    Toggle,
    Input,
} from "@/components/ui";
import type { RadioOption } from "@/components/ui";
import type { Tag } from "@/components/ui/TagInput";
import {
    EMPLOYMENT_TYPES,
    EMPLOYMENT_TYPE_LABELS,
    EDUCATION_DEGREES,
    EDUCATION_DEGREE_LABELS,
} from "@/utils/constants";
import type { SearchState, Country, EducationDegree, EmploymentType } from "../types";
import ApplicantSearchService from "../api/ApplicantSearchService";

interface FiltersProps {
    searchState: SearchState;
    onFilterChange: (updates: Partial<SearchState>) => void;
    onClearFilters?: () => void;
    onSearch?: () => void;
    disabled?: boolean;
    // Search profile props
    selectedProfileId?: string;
    isProfileActive?: boolean;
    onProfileStatusChange?: (isActive: boolean) => void;
    isUpdatingStatus?: boolean;
}

export const Filters: React.FC<FiltersProps> = ({
    searchState,
    onFilterChange,
    onClearFilters,
    // onSearch prop is available for future use if needed
    disabled = false,
    selectedProfileId,
    isProfileActive = false,
    onProfileStatusChange,
    isUpdatingStatus = false,
}) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);
    const [skills, setSkills] = useState<Tag[]>([]);
    const [isLoadingSkills, setIsLoadingSkills] = useState(true);
    const [cityInput, setCityInput] = useState(searchState.city || "");

    // Load countries on mount
    useEffect(() => {
        const loadCountries = async () => {
            try {
                const response = await ApplicantSearchService.getCountries();
                if (response.success && response.data) {
                    setCountries(response.data);
                }
            } catch (err) {
                console.error("Failed to load countries:", err);
            } finally {
                setIsLoadingCountries(false);
            }
        };
        loadCountries();
    }, []);

    // Load skills on mount
    useEffect(() => {
        const loadSkills = async () => {
            try {
                const response = await ApplicantSearchService.getSkills();
                if (response.success && response.data) {
                    // Map API response to Tag format expected by TagInput
                    const mappedSkills: Tag[] = response.data.map((skill) => ({
                        id: skill.id,
                        name: skill.name,
                    }));
                    setSkills(mappedSkills);
                }
            } catch (err) {
                console.error("Failed to load skills:", err);
            } finally {
                setIsLoadingSkills(false);
            }
        };
        loadSkills();
    }, []);

    const handleCountryChange = (e: { target: { value: string } }) => {
        const value = e.target.value;
        onFilterChange({ countryCode: value || undefined });
    };

    const handleCityChange = (value: string) => {
        setCityInput(value);
    };

    const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onFilterChange({ city: cityInput || undefined });
        }
    };

    const handleWorkExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onFilterChange({ workExperience: value || undefined });
    };

    const handleEmploymentTypeChange = (type: EmploymentType, checked: boolean) => {
        const newTypes = checked
            ? [...searchState.employmentTypes, type]
            : searchState.employmentTypes.filter((t) => t !== type);
        onFilterChange({ employmentTypes: newTypes });
    };

    const handleProfileStatusToggle = () => {
        if (onProfileStatusChange) {
            onProfileStatusChange(!isProfileActive);
        }
    };

    const handleDegreeChange = (value: string | undefined) => {
        onFilterChange({ education: value as EducationDegree | undefined });
    };

    /**
     * Salary handlers - used for search profile creation only.
     * TODO: Salary for Search - These values are saved to search profiles for
     * Kafka notification matching, but NOT sent to the applicant search API
     * because JA's UserResponse doesn't have salary fields yet.
     * When JA adds salary to UserResponse, enable salary filtering in ApplicantSearchService.ts.
     */
    const handleSalaryMinChange = (value: number) => {
        onFilterChange({ minSalary: value });
    };

    const handleSalaryMaxChange = (value: number) => {
        onFilterChange({ maxSalary: value });
    };

    const handleSkillAdd = (skillId: string) => {
        // Add skill ID directly
        if (!searchState.skillIds.includes(skillId)) {
            onFilterChange({ skillIds: [...searchState.skillIds, skillId] });
        }
    };

    const handleSkillRemove = (skillId: string) => {
        // Remove by ID
        onFilterChange({
            skillIds: searchState.skillIds.filter((id) => id !== skillId),
        });
    };

    const countryOptions = [
        { value: "", label: "All countries" },
        ...countries
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map((c) => ({ value: c.code, label: c.displayName })),
    ];

    const educationDegreeOptions: RadioOption[] = Object.entries(EDUCATION_DEGREES).map(
        ([, value]) => ({
            value: value,
            label: EDUCATION_DEGREE_LABELS[value],
        })
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Search Profile Status Toggle - only show when a profile is selected */}
            {selectedProfileId && (
                <div className="pb-3 sm:pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Profile Status</h3>
                            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                                {isProfileActive ? "Active" : "Inactive"}
                            </p>
                        </div>
                        <Toggle
                            checked={isProfileActive}
                            onChange={handleProfileStatusToggle}
                            disabled={disabled || isUpdatingStatus}
                            size="md"
                        />
                    </div>
                </div>
            )}

            {/* Location */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
                <Select
                    options={countryOptions}
                    value={searchState.countryCode || ""}
                    onChange={handleCountryChange}
                    disabled={disabled || isLoadingCountries}
                    fullWidth
                />
                <div className="mt-2">
                    <Input
                        type="text"
                        placeholder="Enter city name and press Enter..."
                        value={cityInput}
                        onChange={handleCityChange}
                        onKeyDown={handleCityKeyDown}
                        disabled={disabled}
                        fullWidth
                    />
                </div>
            </div>

            {/* Work Experience / Job Title */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Work Experience</h3>
                <p className="text-xs text-gray-500 mb-2">
                    Search by job title, company, or keywords
                </p>
                <input
                    type="text"
                    placeholder="e.g. Software Engineer, Google..."
                    value={searchState.workExperience || ""}
                    onChange={handleWorkExperienceChange}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Employment Type */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Employment Type</h3>
                <div className="space-y-2">
                    {Object.entries(EMPLOYMENT_TYPES).map(([key, value]) => (
                        <Checkbox
                            key={key}
                            label={EMPLOYMENT_TYPE_LABELS[value]}
                            checked={searchState.employmentTypes.includes(value as EmploymentType)}
                            onChange={(checked) =>
                                handleEmploymentTypeChange(value as EmploymentType, checked)
                            }
                            disabled={disabled}
                        />
                    ))}
                </div>
            </div>

            {/* Education Degree */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                    Education Degree
                </h3>
                <RadioGroup
                    name="education-degree"
                    options={educationDegreeOptions}
                    value={searchState.education}
                    onChange={handleDegreeChange}
                    disabled={disabled}
                    allowDeselect
                />
            </div>

            {/*
             * TODO: Salary for Search
             * This filter is saved to search profiles for Kafka notification matching.
             * It does NOT affect the applicant search results because JA's UserResponse
             * doesn't have salary fields yet. Remove this note when JA adds salary support.
             */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Salary Range</h3>
                <p className="text-xs text-gray-500 mb-2 sm:mb-3">
                    Used for profile notifications only
                </p>
                <RangeSlider
                    min={0}
                    max={100000}
                    step={500}
                    minGap={500}
                    minValue={searchState.minSalary ?? 0}
                    maxValue={searchState.maxSalary ?? 100000}
                    onMinChange={handleSalaryMinChange}
                    onMaxChange={handleSalaryMaxChange}
                    formatValue={(v) => v.toLocaleString()}
                />
            </div>

            {/* Skill Tags */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Skill Tags</h3>
                <TagInput
                    tags={skills}
                    selectedTags={searchState.skillIds}
                    onTagAdd={handleSkillAdd}
                    onTagRemove={handleSkillRemove}
                    placeholder="Search for skills"
                    disabled={disabled || isLoadingSkills}
                />
            </div>

            {/* Clear Filters Button */}
            {onClearFilters && (
                <button
                    onClick={onClearFilters}
                    disabled={disabled}
                    className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                    Clear All Filters
                </button>
            )}
        </div>
    );
};
