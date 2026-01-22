import { useState, useCallback, MouseEvent } from "react";

export interface UseCardProps {
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    hoverable?: boolean;
    selectable?: boolean;
    selected?: boolean;
    defaultSelected?: boolean;
    onSelect?: (selected: boolean) => void;
}

export interface UseCardReturn {
    cardProps: {
        onClick?: (event: MouseEvent<HTMLElement>) => void;
        role?: string;
        tabIndex?: number;
        "aria-selected"?: boolean;
    };
    isHovered: boolean;
    isSelected: boolean;
    setIsHovered: (hovered: boolean) => void;
    setIsSelected: (selected: boolean) => void;
}

/**
 * Headless card hook - provides card behavior (hover, selection, click) without styling
 */
export const useCard = ({
    onClick,
    hoverable = false,
    selectable = false,
    selected: controlledSelected,
    defaultSelected = false,
    onSelect,
}: UseCardProps = {}): UseCardReturn => {
    const [isHovered, setIsHovered] = useState(false);
    const isControlled = controlledSelected !== undefined;
    const [uncontrolledSelected, setUncontrolledSelected] = useState(defaultSelected);

    const isSelected = selectable ? (isControlled ? controlledSelected : uncontrolledSelected) : false;

    const handleClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            if (selectable) {
                const newSelected = !isSelected;
                if (!isControlled) {
                    setUncontrolledSelected(newSelected);
                }
                onSelect?.(newSelected);
            }
            onClick?.(event);
        },
        [selectable, isSelected, isControlled, onSelect, onClick]
    );

    const setIsSelected = useCallback(
        (selected: boolean) => {
            if (selectable && !isControlled) {
                setUncontrolledSelected(selected);
                onSelect?.(selected);
            }
        },
        [selectable, isControlled, onSelect]
    );

    return {
        cardProps: {
            ...(onClick || selectable ? { onClick: handleClick } : {}),
            ...(selectable && {
                role: "button",
                tabIndex: 0,
                "aria-selected": isSelected,
            }),
        },
        isHovered,
        isSelected,
        setIsHovered,
        setIsSelected,
    };
};
