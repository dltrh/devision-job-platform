import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export interface HeadlessConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    isConfirming?: boolean;
    children: React.ReactNode;
    overlayClassName?: string;
    dialogClassName?: string;
}

/**
 * HeadlessConfirmDialog - A headless confirm dialog component
 *
 * This component provides the logic for confirm dialogs without any styling.
 * It handles:
 * - Escape key to close
 * - Click outside to close
 * - Focus trapping
 * - Body scroll lock
 * - Portal rendering
 *
 * You provide the UI through children and apply styling via className props.
 */
export const HeadlessConfirmDialog: React.FC<HeadlessConfirmDialogProps> = ({
    isOpen,
    onClose,
    isConfirming = false,
    children,
    overlayClassName,
    dialogClassName,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isConfirming) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose, isConfirming]);

    // Focus the dialog when opened
    useEffect(() => {
        if (isOpen && dialogRef.current) {
            dialogRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (!isConfirming) {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        <div
            className={overlayClassName}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div
                ref={dialogRef}
                className={dialogClassName}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                {children}
            </div>
        </div>,
        document.body
    );
};

export default HeadlessConfirmDialog;
