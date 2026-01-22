import React, { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaPreview, getMediaPreviewType, ConfirmButton } from "@/components/ui";

export interface MediaViewerItem {
  id: string;
  url: string;
  type: string;
  title?: string;
  description?: string;
}

export interface MediaViewerProps {
  mediaItems: MediaViewerItem[];
  index: number;
  onChangeIndex: (index: number) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  mediaItems,
  index,
  onChangeIndex,
  onClose,
  onDelete,
}) => {
  const media = mediaItems[index];
  const hasPrev = index > 0;
  const hasNext = index < mediaItems.length - 1;

  // Handle keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev) {
        onChangeIndex(index - 1);
      }
      if (e.key === "ArrowRight" && hasNext) {
        onChangeIndex(index + 1);
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, hasPrev, hasNext, onChangeIndex, onClose]);

  const handleDelete = useCallback(() => {
    if (!onDelete || !media) return;

    const mediaId = media.id;
    const itemCount = mediaItems.length;

    // Determine what happens after delete
    if (itemCount === 1) {
      // Last item - close viewer
      onDelete(mediaId);
      onClose();
    } else if (index === itemCount - 1) {
      // Deleting last item in list - move to previous
      onChangeIndex(index - 1);
      onDelete(mediaId);
    } else {
      // Move to next (index stays the same since item is removed)
      onDelete(mediaId);
    }
  }, [onDelete, media, mediaItems.length, index, onChangeIndex, onClose]);

  if (!media) {
    return null;
  }

  const mediaType = getMediaPreviewType(media.type as any);
  const isVideo = mediaType === "video";

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors cursor-pointer"
        aria-label="Close viewer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Media Display */}
      <div className="flex items-center justify-center bg-black" style={{ minHeight: "50vh", maxHeight: "80vh" }}>
        <MediaPreview
          url={media.url}
          type={mediaType}
          alt={media.title || "Media"}
          aspectRatio="auto"
          objectFit="contain"
          showControls={isVideo}
          lazy={false}
          fadeIn={true}
          showSkeleton={true}
          className="max-h-[80vh] max-w-full"
        />
      </div>

      {/* Previous Button */}
      {hasPrev && (
        <button
          onClick={() => onChangeIndex(index - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-colors cursor-pointer"
          aria-label="Previous media"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Button */}
      {hasNext && (
        <button
          onClick={() => onChangeIndex(index + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-colors cursor-pointer"
          aria-label="Next media"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Footer with Info and Delete */}
      <div className="flex items-center justify-between p-4 text-white bg-gradient-to-t from-black/80 to-black/60">
        <div className="flex-1 min-w-0 mr-4">
          {media.title && (
            <h3 className="font-medium truncate">{media.title}</h3>
          )}
          {media.description && (
            <p className="text-sm text-white/70 truncate">{media.description}</p>
          )}
          <p className="text-xs text-white/50 mt-1">
            {index + 1} of {mediaItems.length}
          </p>
        </div>

        {onDelete && (
          <ConfirmButton
            variant="danger"
            size="sm"
            onConfirm={handleDelete}
          >
            Delete
          </ConfirmButton>
        )}
      </div>
    </div>
  );
};
