import React from "react";
import clsx from "clsx";
import { useButton } from "@/components/headless";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    fullWidth?: boolean;
    badge?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    isLoading = false,
    fullWidth = false,
    badge,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    onClick,
    type = "button",
    ...props
}) => {
    // Use headless button hook for behavior
    const { buttonProps } = useButton({
        onClick,
        disabled,
        isLoading,
        type,
    });
    const baseStyles =
        "font-medium rounded-lg transition-[border-color] duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent cursor-pointer";

    const variants = {
        primary: "bg-filled-button text-white hover:bg-filled-button/90 focus:ring-filled-button shadow-sm",
        secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-500",
        outline: "bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-400 focus:ring-zinc-500",
        ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            {...buttonProps}
            {...props}
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && "w-full",
                className,
            )}
        >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Loading...
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2 flex-nowrap">
                    {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                    {children && <span className="whitespace-nowrap">{children}</span>}
                    {rightIcon && <span className="shrink-0">{rightIcon}</span>}
                    {badge && <span className="ml-0.5">{badge}</span>}
                </span>
            )}
        </button>
    );
};
