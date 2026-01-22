import { useState, useCallback } from "react";

export interface ConfirmDialogConfig {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "primary";
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

export interface UseConfirmDialogReturn {
    isOpen: boolean;
    config: ConfirmDialogConfig | null;
    open: (config: ConfirmDialogConfig) => void;
    close: () => void;
    confirm: () => Promise<void>;
    isConfirming: boolean;
}

export const useConfirmDialog = (): UseConfirmDialogReturn => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<ConfirmDialogConfig | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const open = useCallback((newConfig: ConfirmDialogConfig) => {
        setConfig(newConfig);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        if (!isConfirming) {
            setIsOpen(false);
            config?.onCancel?.();
            // Clear config after animation
            setTimeout(() => setConfig(null), 150);
        }
    }, [config, isConfirming]);

    const confirm = useCallback(async () => {
        if (!config || isConfirming) return;

        setIsConfirming(true);
        try {
            await config.onConfirm();
            setIsOpen(false);
            setTimeout(() => setConfig(null), 150);
        } finally {
            setIsConfirming(false);
        }
    }, [config, isConfirming]);

    return {
        isOpen,
        config,
        open,
        close,
        confirm,
        isConfirming,
    };
};
