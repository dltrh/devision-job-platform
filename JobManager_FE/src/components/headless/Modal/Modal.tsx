import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

interface HeadlessModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    overlayClassName?: string;
}

export const HeadlessModal: React.FC<HeadlessModalProps> = ({
    isOpen,
    onClose,
    children,
    className,
    overlayClassName,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className={overlayClassName}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={className}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                ref={modalRef}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
};
