import React from "react";
import clsx from "clsx";

interface SkillBadgeProps {
    name: string;
    size?: "sm" | "md";
    variant?: "blue" | "gray";
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
    name,
    size = "sm",
    variant = "blue",
}) => {
    return (
        <span
            className={clsx(
                "inline-flex items-center rounded-full font-medium",
                size === "sm" && "px-2 py-1 text-xs",
                size === "md" && "px-3 py-1.5 text-sm",
                variant === "blue" && "bg-blue-100 text-blue-700",
                variant === "gray" && "bg-gray-100 text-gray-700"
            )}
        >
            {name}
        </span>
    );
};