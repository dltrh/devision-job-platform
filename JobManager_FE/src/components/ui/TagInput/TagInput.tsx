import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";

export interface Tag {
  id: string;
  name: string;
}

export interface TagInputProps {
  label?: string;
  placeholder?: string;
  tags: Tag[];
  selectedTags: string[];
  onTagAdd: (tagId: string) => void;
  onTagRemove: (tagId: string) => void;
  error?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  placeholder = "Search for skills",
  tags,
  selectedTags,
  onTagAdd,
  onTagRemove,
  error,
  helperText,
  className,
  disabled = false,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tags based on search and exclude already selected (by name OR id), then sort alphabetically
  const filteredTags = tags
    .filter(
      (tag) =>
        !selectedTags.includes(tag.id) &&
        !selectedTags.includes(tag.name) &&
        tag.name.toLowerCase().includes(searchValue.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Get selected tag objects (match by name OR id)
  const selectedTagObjects = tags.filter(
    (tag) => selectedTags.includes(tag.id) || selectedTags.includes(tag.name),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTagSelect = (tagId: string) => {
    onTagAdd(tagId);
    setSearchValue("");
  };

  return (
    <div className={clsx("flex flex-col gap-1", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* Selected tags */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTagObjects.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => onTagRemove(tag.id)}
                disabled={disabled}
                className="text-blue-600 hover:text-blue-800 focus:outline-none disabled:opacity-50"
                aria-label={`Remove ${tag.name}`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              "w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
              disabled && "bg-gray-100 cursor-not-allowed",
            )}
          />
        </div>

        {/* Dropdown - opens above if near bottom of viewport */}
        {isOpen && filteredTags.length > 0 && (
          <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto bottom-full mb-1">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagSelect(tag.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <span className="text-sm text-red-600">{error}</span>}
      {helperText && !error && (
        <span className="text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
};
