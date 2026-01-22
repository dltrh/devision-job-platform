import { useState, useCallback, useRef, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export interface ToastConfig {
    message: string;
    type?: ToastType;
    duration?: number; // milliseconds, default 4000
}

export interface UseToastReturn {
    toasts: Toast[];
    show: (config: ToastConfig) => string;
    success: (message: string, duration?: number) => string;
    error: (message: string, duration?: number) => string;
    warning: (message: string, duration?: number) => string;
    info: (message: string, duration?: number) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
}

const DEFAULT_DURATION = 4000; // 4 seconds

/**
 * useToast - Headless toast/snackbar hook
 *
 * Provides state management for toast notifications without any UI.
 * Toasts auto-dismiss after the specified duration.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * // Show success toast
 * toast.success("Job posted successfully! 🎉");
 *
 * // Show with custom duration (5 seconds)
 * toast.success("Saved!", 5000);
 *
 * // Show with full config
 * toast.show({ message: "Hello", type: "info", duration: 3000 });
 * ```
 */
export const useToast = (): UseToastReturn => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            timersRef.current.forEach((timer) => clearTimeout(timer));
            timersRef.current.clear();
        };
    }, []);

    const dismiss = useCallback((id: string) => {
        // Clear the timer if it exists
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }

        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        timersRef.current.forEach((timer) => clearTimeout(timer));
        timersRef.current.clear();
        setToasts([]);
    }, []);

    const show = useCallback(
        (config: ToastConfig): string => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const duration = config.duration ?? DEFAULT_DURATION;

            const newToast: Toast = {
                id,
                type: config.type || "info",
                message: config.message,
                duration,
            };

            setToasts((prev) => [...prev, newToast]);

            // Auto-dismiss after duration
            if (duration > 0) {
                const timer = setTimeout(() => {
                    dismiss(id);
                }, duration);
                timersRef.current.set(id, timer);
            }

            return id;
        },
        [dismiss]
    );

    const success = useCallback(
        (message: string, duration?: number): string => {
            return show({ message, type: "success", duration });
        },
        [show]
    );

    const error = useCallback(
        (message: string, duration?: number): string => {
            return show({ message, type: "error", duration });
        },
        [show]
    );

    const warning = useCallback(
        (message: string, duration?: number): string => {
            return show({ message, type: "warning", duration });
        },
        [show]
    );

    const info = useCallback(
        (message: string, duration?: number): string => {
            return show({ message, type: "info", duration });
        },
        [show]
    );

    return {
        toasts,
        show,
        success,
        error,
        warning,
        info,
        dismiss,
        dismissAll,
    };
};
