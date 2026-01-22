import React from "react";
import { HeadlessConfirmDialog, UseConfirmDialogReturn } from "@/components/headless/ConfirmDialog";
import { Button } from "@/components/ui/Button/Button";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import clsx from "clsx";

export interface ConfirmDialogProps {
    dialog: UseConfirmDialogReturn;
}

const variantConfig = {
    danger: {
        icon: AlertTriangle,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        confirmButtonVariant: "danger" as const,
    },
    warning: {
        icon: AlertCircle,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        confirmButtonVariant: "secondary" as const, // Use secondary for warning
    },
    primary: {
        icon: Info,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        confirmButtonVariant: "primary" as const,
    },
};

/**
 * ConfirmDialog - A styled confirm dialog component
 *
 * Uses the headless useConfirmDialog hook for state management.
 *
 * @example
 * ```tsx
 * const confirmDialog = useConfirmDialog();
 *
 * const handleDelete = () => {
 *   confirmDialog.open({
 *     title: "Delete Item",
 *     message: "Are you sure you want to delete this item?",
 *     variant: "danger",
 *     confirmText: "Delete",
 *     onConfirm: async () => {
 *       await deleteItem();
 *     },
 *   });
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleDelete}>Delete</Button>
 *     <ConfirmDialog dialog={confirmDialog} />
 *   </>
 * );
 * ```
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ dialog }) => {
    const { isOpen, config, close, confirm, isConfirming } = dialog;

    if (!config) return null;

    const variant = config.variant || "primary";
    const { icon: Icon, iconBg, iconColor, confirmButtonVariant } = variantConfig[variant];

    return (
        <HeadlessConfirmDialog
            isOpen={isOpen}
            onClose={close}
            isConfirming={isConfirming}
            overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            dialogClassName="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Close button */}
            <button
                type="button"
                onClick={close}
                disabled={isConfirming}
                className={clsx(
                    "absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
                    isConfirming && "opacity-50 cursor-not-allowed"
                )}
                aria-label="Close dialog"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={clsx("flex-shrink-0 p-3 rounded-full", iconBg)}>
                        <Icon className={clsx("w-6 h-6", iconColor)} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 pt-1">
                        {config.title && (
                            <h3
                                id="confirm-dialog-title"
                                className="text-lg font-semibold text-gray-900 mb-2"
                            >
                                {config.title}
                            </h3>
                        )}
                        <p className="text-sm text-gray-600 leading-relaxed">{config.message}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Button variant="ghost" size="md" onClick={close} disabled={isConfirming}>
                    {config.cancelText || "Cancel"}
                </Button>
                <Button
                    variant={confirmButtonVariant}
                    size="md"
                    onClick={confirm}
                    isLoading={isConfirming}
                    disabled={isConfirming}
                >
                    {config.confirmText || "Confirm"}
                </Button>
            </div>
        </HeadlessConfirmDialog>
    );
};

export default ConfirmDialog;
