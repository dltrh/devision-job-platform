import { useState, useEffect } from "react";
import { skillService } from "@/services/skillService";
import { Skill } from "@/types/skill";

/**
 * Hook to fetch skill names for given skill IDs
 * Caches all skills and filters by IDs
 */
export const useSkillNames = (skillIds: string[] | undefined) => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!skillIds || skillIds.length === 0) {
            setSkills([]);
            return;
        }

        const fetchSkillNames = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Fetch all skills (cached by service)
                const allSkills = await skillService.getAllSkills();
                
                // Filter to only the skills we need
                const matchedSkills = allSkills.filter(skill => 
                    skillIds.includes(skill.id)
                );
                
                setSkills(matchedSkills);
            } catch (err) {
                console.error("Failed to fetch skill names:", err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSkillNames();
    }, [skillIds?.join(',')]); // Re-run if skill IDs change

    return { skills, isLoading, error };
};