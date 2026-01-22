import { useCallback, useState, MouseEvent, KeyboardEvent } from "react";

export interface UseButtonProps {
    onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
    disabled?: boolean;
    isLoading?: boolean;
    type?: "button" | "submit" | "reset";
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface UseButtonReturn {
    buttonProps: {
        onClick: (event: MouseEvent<HTMLElement>) => void;
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
        disabled: boolean;
        type: "button" | "submit" | "reset";
        role: string;
        tabIndex: number;
        "aria-disabled": boolean;
        "aria-busy"?: boolean;
    };
    isPressed: boolean;
    isHovered: boolean;
    isFocused: boolean;
    isDisabled: boolean;
    isLoading: boolean;
}

/**
 * Headless button hook - provides all button behavior without any styling
 * Handles click, keyboard navigation (Enter/Space), disabled state, and loading state
 */
export const useButton = ({
    onClick,
    disabled = false,
    isLoading = false,
    type = "button",
    onKeyDown,
}: UseButtonProps = {}): UseButtonReturn => {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isDisabled = disabled || isLoading;

    const handleClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            if (isDisabled) {
                event.preventDefault();
                return;
            }
            onClick?.(event);
        },
        [onClick, isDisabled]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            if (isDisabled) {
                event.preventDefault();
                return;
            }

            // Trigger onClick for Enter and Space keys (standard button behavior)
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.(event);
            }

            onKeyDown?.(event);
        },
        [onClick, onKeyDown, isDisabled]
    );

    return {
        buttonProps: {
            onClick: handleClick,
            onKeyDown: handleKeyDown,
            disabled: isDisabled,
            type,
            role: "button",
            tabIndex: isDisabled ? -1 : 0,
            "aria-disabled": isDisabled,
            ...(isLoading && { "aria-busy": true }),
        },
        isPressed,
        isHovered,
        isFocused,
        isDisabled,
        isLoading,
    };
};
