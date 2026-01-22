import React, { useState, useCallback, memo } from "react";
import clsx from "clsx";

export interface ConfirmButtonProps {
  /** Callback when action is confirmed */
  onConfirm: () => void;
  /** The trigger element (button content before confirmation) */
  children: React.ReactNode;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Variant style */
  variant?: "danger" | "warning" | "primary";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class names for the container */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}

const variantStyles = {
  danger: {
    trigger: "bg-red-600 hover:bg-red-700 text-white",
    confirm: "bg-red-600 hover:bg-red-700 text-white",
    cancel: "bg-gray-600 hover:bg-gray-700 text-white",
  },
  warning: {
    trigger: "bg-yellow-500 hover:bg-yellow-600 text-white",
    confirm: "bg-yellow-500 hover:bg-yellow-600 text-white",
    cancel: "bg-gray-600 hover:bg-gray-700 text-white",
  },
  primary: {
    trigger: "bg-blue-600 hover:bg-blue-700 text-white",
    confirm: "bg-blue-600 hover:bg-blue-700 text-white",
    cancel: "bg-gray-600 hover:bg-gray-700 text-white",
  },
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs rounded",
  md: "px-3 py-1.5 text-sm rounded",
  lg: "px-4 py-2 text-base rounded-md",
};

const triggerSizeStyles = {
  sm: "p-1.5 rounded",
  md: "p-2 rounded-full",
  lg: "p-3 rounded-full",
};

export const ConfirmButton = memo<ConfirmButtonProps>(
  ({
    onConfirm,
    children,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    size = "md",
    className,
    disabled = false,
  }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleShowConfirm = useCallback(() => {
      if (!disabled) {
        setShowConfirm(true);
      }
    }, [disabled]);

    const handleCancel = useCallback(() => {
      setShowConfirm(false);
    }, []);

    const handleConfirm = useCallback(() => {
      onConfirm();
      setShowConfirm(false);
    }, [onConfirm]);

    const styles = variantStyles[variant];

    if (showConfirm) {
      return (
        <div className={clsx("flex gap-2", className)}>
          <button
            type="button"
            onClick={handleConfirm}
            className={clsx(styles.confirm, sizeStyles[size], "cursor-pointer")}
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={clsx(styles.cancel, sizeStyles[size], "cursor-pointer")}
          >
            {cancelText}
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={handleShowConfirm}
        disabled={disabled}
        className={clsx(
          styles.trigger,
          triggerSizeStyles[size],
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
      >
        {children}
      </button>
    );
  }
);

ConfirmButton.displayName = "ConfirmButton";

export default ConfirmButton;
