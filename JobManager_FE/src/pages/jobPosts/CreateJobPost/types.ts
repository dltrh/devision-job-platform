import { EmploymentType, SalaryType, Skill } from "@/types";

/**
 * Form data structure for creating/editing job posts
 */
export interface JobPostFormData {
    // Step 1: Basics
    title: string;
    employmentTypes: EmploymentType[];
    isFresher: boolean;

    // Step 2: Compensation & Location
    salaryType: SalaryType;
    salaryMin: string;
    salaryMax: string;
    salaryNote: string;
    locationCity: string;
    countryCode: string;

    // Step 3: Description & Skills
    description: string;
    technicalSkills: string[];
	selectedSkills?: Skill[];

    // Step 4: Visibility & Publish
    isPrivate: boolean;
    expiryAt: string;
    isPublished: boolean;
}

/**
 * Validation errors for each field
 */
export interface JobPostFormErrors {
    title?: string;
    employmentTypes?: string;
    salaryType?: string;
    salaryMin?: string;
    salaryMax?: string;
    locationCity?: string;
    countryCode?: string;
    description?: string;
    technicalSkills?: string;
    expiryAt?: string;
}

/**
 * Step configuration
 */
export enum FormStep {
    BASICS = 0,
    COMPENSATION = 1,
    DESCRIPTION = 2,
    VISIBILITY = 3,
}

export const FORM_STEPS = [
    { id: FormStep.BASICS, label: "Basics", title: "Job Basics" },
    {
        id: FormStep.COMPENSATION,
        label: "Compensation",
        title: "Compensation & Location",
    },
    {
        id: FormStep.DESCRIPTION,
        label: "Description",
        title: "Description & Skills",
    },
    {
        id: FormStep.VISIBILITY,
        label: "Publish",
        title: "Visibility & Publish",
    },
];

/**
 * Auto-save status
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";
