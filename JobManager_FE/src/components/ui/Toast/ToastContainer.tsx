import React from "react";
import ReactDOM from "react-dom";
import { Toast } from "@/components/headless/Toast";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import clsx from "clsx";

export interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
    position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}

const positionStyles = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

const typeConfig = {
    success: {
        icon: CheckCircle,
        bg: "bg-green-50",
        border: "border-green-200",
        iconColor: "text-green-500",
        textColor: "text-green-800",
    },
    error: {
        icon: XCircle,
        bg: "bg-red-50",
        border: "border-red-200",
        iconColor: "text-red-500",
        textColor: "text-red-800",
    },
    warning: {
        icon: AlertTriangle,
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        iconColor: "text-yellow-500",
        textColor: "text-yellow-800",
    },
    info: {
        icon: Info,
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconColor: "text-blue-500",
        textColor: "text-blue-800",
    },
};

/**
 * ToastContainer - Renders toast notifications
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * return (
 *   <>
 *     <button onClick={() => toast.success("Saved!")}>Save</button>
 *     <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
 *   </>
 * );
 * ```
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    onDismiss,
    position = "top-right",
}) => {
    if (toasts.length === 0) return null;

    return ReactDOM.createPortal(
        <div
            className={clsx(
                "fixed z-[100] flex flex-col gap-2 pointer-events-none",
                positionStyles[position]
            )}
            aria-live="polite"
            aria-label="Notifications"
        >
            {toasts.map((toast) => {
                const config = typeConfig[toast.type];
                const Icon = config.icon;

                return (
                    <div
                        key={toast.id}
                        className={clsx(
                            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg",
                            "animate-in slide-in-from-right-full fade-in duration-300",
                            "min-w-[300px] max-w-[420px]",
                            config.bg,
                            config.border
                        )}
                        role="alert"
                    >
                        <Icon className={clsx("w-5 h-5 flex-shrink-0", config.iconColor)} />
                        <p className={clsx("flex-1 text-sm font-medium", config.textColor)}>
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => onDismiss(toast.id)}
                            className={clsx(
                                "flex-shrink-0 p-1 rounded-full transition-colors",
                                "hover:bg-black/5",
                                config.textColor
                            )}
                            aria-label="Dismiss notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>,
        document.body
    );
};

export default ToastContainer;
