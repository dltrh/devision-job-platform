import React, { useRef } from "react";
import { Upload } from "lucide-react";

export interface ImageUploadProps {
    label: string;
    currentImage?: string;
    onUpload: (file: File) => void;
    aspectRatio?: "square" | "banner";
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    currentImage,
    onUpload,
    aspectRatio = "square",
    className,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className || ""}`}>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div
                className={`relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition-colors cursor-pointer ${aspectRatio === "banner" ? "h-32 w-full" : "h-32 w-32"
                    }`}
                onClick={handleClick}
            >
                {currentImage ? (
                    <img
                        src={currentImage}
                        alt={label}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-xs">Click to upload</span>
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};
