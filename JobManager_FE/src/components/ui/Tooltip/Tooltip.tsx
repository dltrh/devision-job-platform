import React, { useState } from "react";
import clsx from "clsx";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = "top",
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionStyles = {
        top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
        left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
        right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={clsx(
                        "absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap",
                        positionStyles[position]
                    )}
                >
                    {content}
                    <div
                        className={clsx(
                            "absolute w-2 h-2 bg-gray-900 transform rotate-45",
                            position === "top" &&
                                "bottom-[-4px] left-1/2 -translate-x-1/2",
                            position === "bottom" &&
                                "top-[-4px] left-1/2 -translate-x-1/2",
                            position === "left" &&
                                "right-[-4px] top-1/2 -translate-y-1/2",
                            position === "right" &&
                                "left-[-4px] top-1/2 -translate-y-1/2"
                        )}
                    />
                </div>
            )}
        </div>
    );
};
