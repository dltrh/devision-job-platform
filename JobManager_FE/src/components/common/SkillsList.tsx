import React from "react";
import { useSkillNames } from "@/hooks/useSkillNames";
import { SkillBadge } from "./SkillBadge";
import { Spinner } from "@/components/ui";

interface SkillsListProps {
    skillIds?: string[];
    maxDisplay?: number;
    size?: "sm" | "md";
    showCount?: boolean;
}

export const SkillsList: React.FC<SkillsListProps> = ({
    skillIds,
    maxDisplay = 5,
    size = "sm",
    showCount = true,
}) => {
    const { skills, isLoading } = useSkillNames(skillIds);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                <span className="text-xs text-gray-500">Loading skills...</span>
            </div>
        );
    }

    if (!skills || skills.length === 0) {
        return (
            <span className="text-xs text-gray-400">No skills specified</span>
        );
    }

    const displaySkills = skills.slice(0, maxDisplay);
    const remainingCount = skills.length - maxDisplay;

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {displaySkills.map((skill) => (
                <SkillBadge key={skill.id} name={skill.name} size={size} />
            ))}
            
            {remainingCount > 0 && showCount && (
                <span className="text-xs text-gray-500 font-medium">
                    +{remainingCount} more
                </span>
            )}
        </div>
    );
};