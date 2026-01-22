import React, { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import clsx from "clsx";

export interface DragDropUploadProps {
  /** The currently selected file (controlled) */
  file?: File | null;
  /** Callback when a file is selected */
  onFileSelect: (file: File | null) => void;
  /** Accepted file types (e.g., "image/*", ".pdf,.doc") */
  accept?: string;
  /** Whether the upload is in progress */
  isUploading?: boolean;
  /** Custom text when no file is selected */
  placeholder?: string;
  /** Helper text showing accepted formats */
  helperText?: string;
  /** Additional class names */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  file,
  onFileSelect,
  accept = "*/*",
  isUploading = false,
  placeholder = "Drag & drop or click to select",
  helperText,
  className,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !isUploading) {
        setIsDragging(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && !isUploading) {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
          onFileSelect(droppedFile);
        }
      }
    },
    [disabled, isUploading, onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        onFileSelect(selectedFile);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [onFileSelect]
  );

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
        disabled || isUploading
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer",
        isDragging
          ? "border-blue-500 bg-blue-50"
          : file
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-blue-400",
        className
      )}
    >
      {file ? (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <Upload className="w-5 h-5" />
          <span className="text-sm font-medium truncate max-w-[200px]">
            {file.name}
          </span>
        </div>
      ) : (
        <>
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">{placeholder}</p>
          {helperText && (
            <p className="text-xs text-gray-400 mt-1">{helperText}</p>
          )}
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default DragDropUpload;
