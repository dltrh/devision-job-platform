import { memo } from "react";
import clsx from "clsx";

export interface InfoCardProps {
  /** Card title */
  title?: string;
  /** Action button/element to show in header */
  action?: React.ReactNode;
  /** Card content */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: "default" | "subtle" | "accent";
  /** Padding size */
  padding?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

const variantStyles = {
  default: "bg-white border-gray-100 shadow-sm",
  subtle: "bg-gray-50 border-gray-100",
  accent: "bg-blue-50 border-blue-100",
};

const paddingStyles = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const InfoCard = memo<InfoCardProps>(
  ({
    title,
    action,
    children,
    variant = "default",
    padding = "md",
    className,
  }) => {
    return (
      <div
        className={clsx(
          "rounded-xl border",
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
      >
        {(title || action) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h3 className="font-semibold text-gray-900">{title}</h3>
            )}
            {action}
          </div>
        )}
        {children}
      </div>
    );
  }
);

InfoCard.displayName = "InfoCard";

export default InfoCard;
