import { memo } from "react";
import clsx from "clsx";

export interface LabeledValueProps {
  /** Icon to display (React node, typically a lucide-react icon) */
  icon?: React.ReactNode;
  /** Small label text above the value */
  label: string;
  /** The main value to display */
  value?: string | number | null;
  /** Placeholder text when value is empty */
  placeholder?: string;
  /** Icon color class (default: text-blue-500) */
  iconColor?: string;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Additional class names */
  className?: string;
}

export const LabeledValue = memo<LabeledValueProps>(
  ({
    icon,
    label,
    value,
    placeholder = "Not specified",
    iconColor = "text-blue-500",
    direction = "horizontal",
    className,
  }) => {
    const displayValue = value || placeholder;
    const isEmpty = !value;

    if (direction === "vertical") {
      return (
        <div className={clsx("flex flex-col gap-1", className)}>
          {icon && (
            <div className={clsx("w-5 h-5", iconColor)}>{icon}</div>
          )}
          <p className="text-xs text-gray-400">{label}</p>
          <p
            className={clsx(
              "font-medium",
              isEmpty ? "text-gray-400 italic" : "text-gray-900"
            )}
          >
            {displayValue}
          </p>
        </div>
      );
    }

    return (
      <div className={clsx("flex items-center gap-3", className)}>
        {icon && (
          <div className={clsx("w-5 h-5 flex-shrink-0", iconColor)}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs text-gray-400">{label}</p>
          <p
            className={clsx(
              "font-medium truncate",
              isEmpty ? "text-gray-400 italic" : "text-gray-900"
            )}
          >
            {displayValue}
          </p>
        </div>
      </div>
    );
  }
);

LabeledValue.displayName = "LabeledValue";

export default LabeledValue;
