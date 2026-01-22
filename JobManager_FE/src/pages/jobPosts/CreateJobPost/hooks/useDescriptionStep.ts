import { useState, useMemo, useCallback, useRef } from "react";
import { JobPostFormData, JobPostFormErrors } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface UseDescriptionStepProps {
    formData: JobPostFormData;
    errors: JobPostFormErrors;
    onChange: (field: keyof JobPostFormData, value: any) => void;
}

export interface UseDescriptionStepReturn {
    // Description
    description: {
        value: string;
        error?: string;
        characterCount: number;
        maxCharacters: number;
        isNearLimit: boolean;
        onChange: (value: string) => void;
    };

    // Skills
    skills: {
        items: string[];
        error?: string;
        inputValue: string;
        inputRef: React.RefObject<HTMLInputElement | null>;
        suggestions: {
            items: string[];
            isVisible: boolean;
            show: () => void;
            hide: () => void;
        };
        popularSkills: string[];
        add: (skill: string) => void;
        remove: (skill: string) => void;
        setInputValue: (value: string) => void;
        handleInputChange: (value: string) => void;
        handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
        handleInputBlur: () => void;
        handleInputFocus: () => void;
    };
}

// ============================================================================
// Constants
// ============================================================================

const MAX_CHARACTERS = 10000;
const NEAR_LIMIT_THRESHOLD = 0.9;

const COMMON_SKILLS = [
    "JavaScript",
    "TypeScript",
    "React",
    "Vue.js",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "Spring Boot",
    "C#",
    ".NET",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "SQL",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git",
    "CI/CD",
    "Agile",
    "Scrum",
];

const POPULAR_SKILLS_COUNT = 8;

// ============================================================================
// Hook
// ============================================================================

/**
 * Headless hook for Step 3: Description & Skills
 * Manages job description with character count and skill input with autocomplete
 */
export const useDescriptionStep = ({
    formData,
    errors,
    onChange,
}: UseDescriptionStepProps): UseDescriptionStepReturn => {
    // -------------------------------------------------------------------------
    // Local State
    // -------------------------------------------------------------------------

    const [skillInput, setSkillInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const skillInputRef = useRef<HTMLInputElement>(null);

    // -------------------------------------------------------------------------
    // Memoized Values
    // -------------------------------------------------------------------------

    const characterCount = formData.description.length;
    const isNearLimit = characterCount > MAX_CHARACTERS * NEAR_LIMIT_THRESHOLD;

    const filteredSuggestions = useMemo(() => {
        if (!skillInput.trim()) return [];

        return COMMON_SKILLS.filter(
            (skill) =>
                skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                !formData.technicalSkills.includes(skill)
        );
    }, [skillInput, formData.technicalSkills]);

    const popularSkills = useMemo(() => COMMON_SKILLS.slice(0, POPULAR_SKILLS_COUNT), []);

    // -------------------------------------------------------------------------
    // Callbacks
    // -------------------------------------------------------------------------

    const setDescription = useCallback(
        (value: string) => {
            onChange("description", value);
        },
        [onChange]
    );

    const addSkill = useCallback(
        (skill: string) => {
            const trimmedSkill = skill.trim();
            if (trimmedSkill && !formData.technicalSkills.includes(trimmedSkill)) {
                onChange("technicalSkills", [...formData.technicalSkills, trimmedSkill]);
                setSkillInput("");
                setShowSuggestions(false);
                skillInputRef.current?.focus();
            }
        },
        [formData.technicalSkills, onChange]
    );

    const removeSkill = useCallback(
        (skillToRemove: string) => {
            onChange(
                "technicalSkills",
                formData.technicalSkills.filter((skill) => skill !== skillToRemove)
            );
        },
        [formData.technicalSkills, onChange]
    );

    const handleInputChange = useCallback(
        (value: string) => {
            setSkillInput(value);
            if (value.trim().length > 0) {
                const hasMatches = COMMON_SKILLS.some(
                    (skill) =>
                        skill.toLowerCase().includes(value.toLowerCase()) &&
                        !formData.technicalSkills.includes(skill)
                );
                setShowSuggestions(hasMatches);
            } else {
                setShowSuggestions(false);
            }
        },
        [formData.technicalSkills]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput);
            } else if (
                e.key === "Backspace" &&
                skillInput === "" &&
                formData.technicalSkills.length > 0
            ) {
                // Remove last skill if input is empty
                const newSkills = [...formData.technicalSkills];
                newSkills.pop();
                onChange("technicalSkills", newSkills);
            }
        },
        [skillInput, formData.technicalSkills, addSkill, onChange]
    );

    const handleInputBlur = useCallback(() => {
        // Delay to allow click on suggestions
        setTimeout(() => setShowSuggestions(false), 200);
    }, []);

    const handleInputFocus = useCallback(() => {
        if (skillInput.trim().length > 0 && filteredSuggestions.length > 0) {
            setShowSuggestions(true);
        }
    }, [skillInput, filteredSuggestions.length]);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    return {
        description: {
            value: formData.description,
            error: errors.description,
            characterCount,
            maxCharacters: MAX_CHARACTERS,
            isNearLimit,
            onChange: setDescription,
        },

        skills: {
            items: formData.technicalSkills,
            error: errors.technicalSkills,
            inputValue: skillInput,
            inputRef: skillInputRef,
            suggestions: {
                items: filteredSuggestions,
                isVisible: showSuggestions && filteredSuggestions.length > 0,
                show: () => setShowSuggestions(true),
                hide: () => setShowSuggestions(false),
            },
            popularSkills,
            add: addSkill,
            remove: removeSkill,
            setInputValue: setSkillInput,
            handleInputChange,
            handleKeyDown,
            handleInputBlur,
            handleInputFocus,
        },
    };
};
