import React from "react";
import clsx from "clsx";

export interface AlertProps {
    type?: "info" | "success" | "warning" | "error";
    title?: string;
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
    type = "info",
    title,
    children,
    className,
    onClose,
}) => {
    const styles = {
        info: "bg-blue-50 border-blue-200 text-blue-800",
        success: "bg-green-50 border-green-200 text-green-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        error: "bg-red-50 border-red-200 text-red-800",
    };

    const icons = {
        info: "ℹ️",
        success: "✓",
        warning: "⚠️",
        error: "✕",
    };

    return (
        <div
            className={clsx(
                "border rounded-lg p-4 flex items-start gap-3",
                styles[type],
                className,
            )}
        >
            <span className="text-xl">{icons[type]}</span>
            <div className="flex-1">
                {title && <h4 className="font-semibold mb-1">{title}</h4>}
                <div className="text-sm">{children}</div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            )}
        </div>
    );
};
