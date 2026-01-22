import React, { createContext, useContext, ReactNode } from "react";
import { useToast, UseToastReturn } from "./useToast";

const ToastContext = createContext<UseToastReturn | null>(null);

export interface ToastProviderProps {
    children: ReactNode;
}

/**
 * ToastProvider - Context provider for toast notifications
 *
 * Wrap your app with this provider to enable toast notifications anywhere.
 *
 * @example
 * ```tsx
 * // In App.tsx or main.tsx
 * <ToastProvider>
 *   <App />
 *   <ToastContainer />
 * </ToastProvider>
 *
 * // In any component
 * const toast = useToastContext();
 * toast.success("Job posted successfully!");
 * ```
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const toast = useToast();

    return <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>;
};

/**
 * useToastContext - Hook to access toast context
 *
 * Must be used within a ToastProvider.
 */
export const useToastContext = (): UseToastReturn => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToastContext must be used within a ToastProvider");
    }
    return context;
};

export { ToastContext };
