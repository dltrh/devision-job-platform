import { memo } from "react";
import clsx from "clsx";

export interface SocialLinkProps {
  /** URL to link to */
  href: string;
  /** Icon to display (React node, typically a lucide-react icon) */
  icon: React.ReactNode;
  /** Accessible label for the link */
  label: string;
  /** Visual style variant */
  variant?: "default" | "subtle" | "solid";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

const variantStyles = {
  default:
    "bg-white text-gray-600 hover:text-blue-600 shadow-sm border border-gray-100",
  subtle: "bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-gray-100",
  solid: "bg-blue-600 text-white hover:bg-blue-700",
};

const sizeStyles = {
  sm: "p-1.5 [&_svg]:w-4 [&_svg]:h-4",
  md: "p-2 [&_svg]:w-5 [&_svg]:h-5",
  lg: "p-3 [&_svg]:w-6 [&_svg]:h-6",
};

export const SocialLink = memo<SocialLinkProps>(
  ({
    href,
    icon,
    label,
    variant = "default",
    size = "md",
    className,
  }) => {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={clsx(
          "rounded-lg transition-colors inline-flex items-center justify-center",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
      >
        {icon}
      </a>
    );
  }
);

SocialLink.displayName = "SocialLink";

export default SocialLink;
