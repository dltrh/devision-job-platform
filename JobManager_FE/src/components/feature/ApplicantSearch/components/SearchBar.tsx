import React from "react";
import { Input } from "@/components/ui";
import { APPLICANT_SORT_OPTIONS, APPLICANT_SORT_LABELS } from "@/utils/constants";
import { Search, Check, FileText } from "lucide-react";
import type { ApplicantSortOption } from "../types";

interface SearchBarProps {
    /** Search term (username/name search) */
    searchTerm: string;
    /** Full-text search query (Work Experience, Objective Summary, Technical Skills) */
    ftsQuery?: string;
    sortBy: ApplicantSortOption;
    onSearchTermChange: (term: string) => void;
    onFtsQueryChange?: (query: string) => void;
    onSortChange: (sortBy: ApplicantSortOption) => void;
    onSearch: () => void;
    disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchTerm,
    ftsQuery = "",
    sortBy,
    onSearchTermChange,
    onFtsQueryChange,
    onSortChange,
    onSearch,
    disabled = false,
}) => {
    const sortOptions = Object.entries(APPLICANT_SORT_OPTIONS).map(([, value]) => ({
        value,
        label: APPLICANT_SORT_LABELS[value],
    }));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Inputs Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Name Search Input */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Input
            type="text"
            value={searchTerm}
            onChange={onSearchTermChange}
            onKeyDown={handleKeyDown}
            placeholder="Search by name..."
            disabled={disabled}
            fullWidth
            endAdornment={
              <Search className="w-4 h-4 text-gray-400" />
            }
          />
        </div>

                {/* Full-Text Search Input */}
                <div className="relative flex-1 w-full">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={ftsQuery}
                        onChange={(e) => onFtsQueryChange?.(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search experience, skills, summary..."
                        disabled={disabled}
                        className="w-full pl-10 pr-12 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <button
                            onClick={onSearch}
                            disabled={disabled}
                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 touch-manipulation"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* FTS Description and Sort Options Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 items-start sm:items-center justify-between">
                <p className="text-xs text-gray-500 hidden sm:block">
                    <span className="font-medium">Full-Text Search:</span> Search across Work
                    Experience, Objective Summary, and Technical Skills
                </p>

                {/* Sort Options */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value as ApplicantSortOption)}
                            disabled={disabled}
                            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors cursor-pointer touch-manipulation ${
                                sortBy === option.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {option.label}
                            {sortBy === option.value && (
                                <Check className="inline w-3.5 sm:w-4 h-3.5 sm:h-4 ml-1" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
