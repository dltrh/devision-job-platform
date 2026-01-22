import React from "react";
import clsx from "clsx";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  labelPosition = "right",
  size = "md",
  disabled = false,
  className,
  id,
}) => {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const sizeClasses = {
    sm: {
      track: "w-8 h-4",
      thumb: "w-3 h-3",
      translate: "translate-x-4",
    },
    md: {
      track: "w-11 h-6",
      thumb: "w-5 h-5",
      translate: "translate-x-5",
    },
    lg: {
      track: "w-14 h-7",
      thumb: "w-6 h-6",
      translate: "translate-x-7",
    },
  };

  const sizes = sizeClasses[size];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const toggle = (
    <button
      id={toggleId}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        sizes.track,
        checked ? "bg-blue-600" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={clsx(
          "pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          sizes.thumb,
          checked ? sizes.translate : "translate-x-0"
        )}
      />
    </button>
  );

  if (!label) {
    return toggle;
  }

  return (
    <div className={clsx("flex items-center gap-3", disabled && "opacity-50")}>
      {labelPosition === "left" && (
        <label
          htmlFor={toggleId}
          className={clsx(
            "text-sm font-medium text-gray-700",
            !disabled && "cursor-pointer"
          )}
        >
          {label}
        </label>
      )}
      {toggle}
      {labelPosition === "right" && (
        <label
          htmlFor={toggleId}
          className={clsx(
            "text-sm font-medium text-gray-700",
            !disabled && "cursor-pointer"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};
