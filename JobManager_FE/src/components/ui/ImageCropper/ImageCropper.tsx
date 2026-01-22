import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Button, Spinner } from "@/components/ui";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export interface ImageCropperProps {
  /** Image source URL or base64 data URL */
  imageSrc: string;
  /** Aspect ratio for cropping (e.g., 1 for square, 4 for 4:1 banner) */
  aspect: number;
  /** Callback when crop is completed */
  onCropComplete: (croppedImage: Blob) => void;
  /** Callback when cropping is cancelled */
  onCancel: () => void;
  /** Whether the cropper is currently processing */
  isProcessing?: boolean;
  /** Recommended dimension hint text */
  dimensionHint?: string;
  /** Output image format */
  outputFormat?: "image/jpeg" | "image/png" | "image/webp";
  /** Output image quality (0-1, only for jpeg/webp) */
  outputQuality?: number;
}

/**
 * Creates a cropped image from the source image using canvas
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputFormat: string = "image/jpeg",
  quality: number = 0.92,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to the crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      outputFormat,
      quality,
    );
  });
}

/**
 * Creates an HTMLImageElement from a source URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  aspect,
  onCropComplete,
  onCancel,
  isProcessing = false,
  dimensionHint,
  outputFormat = "image/jpeg",
  outputQuality = 0.92,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        outputFormat,
        outputQuality,
      );
      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  }, [
    croppedAreaPixels,
    imageSrc,
    onCropComplete,
    outputFormat,
    outputQuality,
  ]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
  }, []);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Dimension hint */}
      {dimensionHint && (
        <div className="text-center py-2 bg-blue-50 text-blue-700 text-sm">
          {dimensionHint}
        </div>
      )}

      {/* Cropper area */}
      <div className="relative flex-1 min-h-[300px] bg-gray-900">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
          showGrid={true}
          style={{
            containerStyle: {
              width: "100%",
              height: "100%",
            },
          }}
        />
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1 || isProcessing}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={isProcessing}
            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3 || isProcessing}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isProcessing}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-2"
            aria-label="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={isProcessing}>
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Processing...
              </span>
            ) : (
              "Crop & Upload"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
