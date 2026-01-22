import { memo, useState, useCallback } from "react";
import { FileText, ImageIcon } from "lucide-react";
import clsx from "clsx";

export type MediaPreviewType = "image" | "video" | "document" | "unknown";

export interface MediaPreviewProps {
  /** URL of the media to display */
  url: string;
  /** Type of media */
  type: MediaPreviewType;
  /** Alt text for images */
  alt?: string;
  /** Aspect ratio of the preview */
  aspectRatio?: "square" | "video" | "auto";
  /** Whether to use lazy loading for images */
  lazy?: boolean;
  /** Additional class names */
  className?: string;
  /** Object fit style */
  objectFit?: "cover" | "contain" | "fill";
  /** Show video controls (only for video type) */
  showControls?: boolean;
  /** Enable fade-in animation on load */
  fadeIn?: boolean;
  /** Show skeleton placeholder while loading */
  showSkeleton?: boolean;
}

const aspectRatioStyles = {
  square: "aspect-square",
  video: "aspect-video",
  auto: "",
};

export const MediaPreview = memo<MediaPreviewProps>(
  ({
    url,
    type,
    alt = "Media preview",
    aspectRatio = "square",
    lazy = true,
    className,
    objectFit = "cover",
    showControls = false,
    fadeIn = false,
    showSkeleton = false,
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
    }, []);

    const handleError = useCallback(() => {
      setHasError(true);
      setIsLoaded(true);
    }, []);

    const objectFitClass =
      objectFit === "cover"
        ? "object-cover"
        : objectFit === "contain"
          ? "object-contain"
          : "object-fill";

    const containerClass = clsx(
      "bg-gray-100 rounded-lg overflow-hidden relative",
      aspectRatioStyles[aspectRatio],
      className
    );

    const mediaClass = clsx(
      "w-full h-full",
      objectFitClass,
      fadeIn && "transition-opacity duration-300",
      fadeIn && !isLoaded && "opacity-0",
      fadeIn && isLoaded && "opacity-100"
    );

    // Skeleton placeholder
    const skeleton = showSkeleton && !isLoaded && !hasError && (
      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
    );

    if (type === "image") {
      return (
        <div className={containerClass}>
          {skeleton}
          <img
            src={url}
            alt={alt}
            className={mediaClass}
            loading={lazy ? "lazy" : "eager"}
            draggable={false}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    if (type === "video") {
      return (
        <div className={containerClass}>
          {skeleton}
          <video
            src={url}
            className={mediaClass}
            controls={showControls}
            preload="metadata"
            draggable={false}
            onLoadedData={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    // Document or unknown type - show icon placeholder
    const IconComponent = type === "document" ? FileText : ImageIcon;

    return (
      <div className={clsx(containerClass, "flex items-center justify-center")}>
        <IconComponent className="w-12 h-12 text-gray-400" />
      </div>
    );
  }
);

MediaPreview.displayName = "MediaPreview";

/**
 * Helper function to determine media type from a type string
 */
export function getMediaPreviewType(type: string): MediaPreviewType {
  const normalizedType = type.toUpperCase();
  switch (normalizedType) {
    case "IMAGE":
    case "LOGO":
    case "BANNER":
      return "image";
    case "VIDEO":
      return "video";
    default:
      return "unknown";
  }
}

export default MediaPreview;
