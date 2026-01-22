/**
 * Skill from Job Applicant service
 */
export interface Skill {
	id: string; // UUID
	name: string; // e.g., "Java", "React"
	usageCount: number; // Popularity metric
}

/**
 * Skill selection for form (combines ID + name for display)
 */
export interface SkillSelection {
	id: string;
	name: string;
	usageCount?: number; 
}