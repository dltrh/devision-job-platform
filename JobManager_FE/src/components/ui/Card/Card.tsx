import React from "react";
import clsx from "clsx";
import { useCard } from "@/components/headless";

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onSelect?: (selected: boolean) => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    padding = "md",
    hover = false,
    selectable = false,
    selected,
    onClick,
    onSelect,
}) => {
    // Use headless card hook for behavior
    const { cardProps, isSelected } = useCard({
        onClick,
        hoverable: hover,
        selectable,
        selected,
        onSelect,
    });

    const paddingStyles = {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
    };

    return (
        <div
            {...cardProps}
            className={clsx(
                "bg-white rounded-lg border border-gray-200 shadow-sm",
                paddingStyles[padding],
                hover && "hover:shadow-md transition-shadow cursor-pointer",
                selectable && isSelected && "ring-2 ring-blue-500 border-blue-500",
                className,
            )}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className }) => (
    <div className={clsx("border-b border-gray-200 pb-3 mb-3", className)}>
        {children}
    </div>
);

export const CardBody: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className }) => <div className={className}>{children}</div>;

export const CardFooter: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className }) => (
    <div className={clsx("border-t border-gray-200 pt-3 mt-3", className)}>
        {children}
    </div>
);
