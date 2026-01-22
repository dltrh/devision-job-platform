import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Spinner } from "../Spinner";
import clsx from "clsx";

export interface FileUploadProps {
    onUpload: (file: File) => void;
    isUploading?: boolean;
    accept?: string;
    label?: string;
    helperText?: string;
    className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUpload,
    isUploading = false,
    accept = "*/*",
    label = "Add File",
    helperText = "Drag & drop or click",
    className,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            onUpload(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
                "aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
                isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
                className
            )}
        >
            {isUploading ? (
                <Spinner size="md" />
            ) : (
                <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-xs text-gray-400 mt-1">{helperText}</span>
                </>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
};
