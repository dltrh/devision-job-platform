import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import {
    Alert,
    Spinner,
    Button,
    Input,
    DragDropUpload,
    OptionSelector,
    ConfirmButton,
    MediaPreview,
    MediaViewer,
    getMediaPreviewType,
    type OptionItem,
} from "@/components/ui";
import { HeadlessModal } from "@/components/headless";
import { useCompanyMedia } from "../hooks/useCompanyMedia";
import type { CompanyMedia, MediaReorderItem, MediaType } from "../types";
import { Plus, Upload, X, Image, Video, Trash2, GripHorizontal } from "lucide-react";

// Drag and drop gallery item
interface MediaItemProps {
    media: CompanyMedia;
    onDelete: (id: string) => void;
    onView: (index: number) => void;
    index: number;
}

const MediaItem = memo<MediaItemProps>(
    ({ media, onDelete, onView, index }) => {
        const handleDelete = useCallback(() => {
            onDelete(media.id);
        }, [onDelete, media.id]);

        const handleClick = useCallback(
            (e: React.MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.closest("button") || target.closest("[data-no-view]")) {
                    return;
                }
                onView(index);
            },
            [onView, index]
        );

        const mediaType = getMediaPreviewType(media.type);

        return (
            <div
                draggable
                data-index={index}
                onClick={handleClick}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-400 transition-colors"
            >
                <MediaPreview
                    url={media.url}
                    type={mediaType}
                    alt={media.title || "Media"}
                    aspectRatio="auto"
                    className="w-full h-full"
                    lazy={true}
                    fadeIn={true}
                    showSkeleton={true}
                />

                {/* Delete button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ConfirmButton
                        onConfirm={handleDelete}
                        variant="danger"
                        size="sm"
                        className="cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </ConfirmButton>
                </div>

                {/* Drag indicator */}
                <div
                    data-no-view
                    className="absolute top-2 left-2 bg-white bg-opacity-80 rounded p-1 cursor-move"
                >
                    <GripHorizontal className="w-4 h-4 text-gray-600" />
                </div>

                {/* Title */}
                {media.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 truncate">
                        {media.title}
                    </div>
                )}
            </div>
        );
    },
    (prevProps, nextProps) =>
        prevProps.media.id === nextProps.media.id &&
        prevProps.media.url === nextProps.media.url &&
        prevProps.media.title === nextProps.media.title &&
        prevProps.media.type === nextProps.media.type &&
        prevProps.index === nextProps.index
);

// Media Type Options for the upload modal
const MEDIA_TYPE_OPTIONS: OptionItem<MediaType>[] = [
    {
        value: "IMAGE",
        label: "Image",
        icon: <Image className="w-5 h-5" />,
    },
    {
        value: "VIDEO",
        label: "Video",
        icon: <Video className="w-5 h-5" />,
    },
];

// Accept types for each media type
const ACCEPT_BY_TYPE: Record<MediaType, string> = {
    LOGO: "image/*",
    BANNER: "image/*",
    IMAGE: "image/*",
    VIDEO: "video/*",
};

// Upload Media Modal Component
interface UploadMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, mediaType: MediaType, title: string, description?: string) => void;
    isUploading: boolean;
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    isUploading,
}) => {
    const [selectedType, setSelectedType] = useState<MediaType>("IMAGE");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Reset form state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedType("IMAGE");
            setSelectedFile(null);
            setTitle("");
            setDescription("");
        }
    }, [isOpen]);

    const currentAccept = ACCEPT_BY_TYPE[selectedType];

    const handleFileSelect = useCallback(
        (file: File | null) => {
            setSelectedFile(file);
            if (file && !title) {
                setTitle(file.name.split(".")[0]);
            }
        },
        [title]
    );

    const handleTypeChange = useCallback((value: MediaType) => {
        setSelectedType(value);
        setSelectedFile(null); // Reset file when type changes
    }, []);

    const handleSubmit = () => {
        if (selectedFile && title.trim()) {
            onUpload(selectedFile, selectedType, title.trim(), description.trim() || undefined);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setTitle("");
        setDescription("");
        setSelectedType("IMAGE");
        onClose();
    };

    return (
        <HeadlessModal
            isOpen={isOpen}
            onClose={handleClose}
            overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4"
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Upload Media</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Media Type Selection */}
                <OptionSelector
                    label="Media Type"
                    options={MEDIA_TYPE_OPTIONS}
                    value={selectedType}
                    onChange={handleTypeChange}
                    columns={2}
                    className="mb-6"
                />

                {/* File Upload Area */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                    <DragDropUpload
                        file={selectedFile}
                        onFileSelect={handleFileSelect}
                        accept={currentAccept}
                        isUploading={isUploading}
                        helperText={`Accepted: ${currentAccept}`}
                    />
                </div>

                {/* Title Input */}
                <div className="mb-4">
                    <Input
                        label="Title"
                        value={title}
                        onChange={(value) => setTitle(value)}
                        placeholder="Enter media title"
                        fullWidth
                    />
                </div>

                {/* Description Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a brief description..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedFile || !title.trim() || isUploading}
                        isLoading={isUploading}
                    >
                        <span className="flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                        </span>
                    </Button>
                </div>
            </div>
        </HeadlessModal>
    );
};

export const CompanyMediaGallery: React.FC = () => {
    const {
        mediaItems,
        isLoading,
        isUploading,
        error,
        successMessage,
        uploadNewMedia,
        deleteMediaItem,
        reorderMediaItems,
        clearMessages,
    } = useCompanyMedia();

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const draggedIndexRef = useRef<number | null>(null);
    const mediaItemsRef = useRef(mediaItems);

    // Keep ref updated with latest mediaItems to avoid stale closure in drag handlers
    useEffect(() => {
        mediaItemsRef.current = mediaItems;
    }, [mediaItems]);

    const handleUpload = useCallback(
        (file: File, mediaType: MediaType, title: string, description?: string) => {
            uploadNewMedia({
                file,
                mediaType,
                title,
                description,
            }).then(() => {
                setIsUploadModalOpen(false);
            });
        },
        [uploadNewMedia]
    );

    const handleOpenModal = useCallback(() => {
        setIsUploadModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsUploadModalOpen(false);
    }, []);

    const handleCloseViewer = useCallback(() => {
        setViewerIndex(null);
    }, []);

    // Unified drag handler using event delegation on container
    const handleContainerDragStart = useCallback((e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        const draggableItem = target.closest("[data-index]") as HTMLElement;
        if (draggableItem) {
            draggedIndexRef.current = parseInt(draggableItem.dataset.index!, 10);
            e.dataTransfer.effectAllowed = "move";
        }
    }, []);

    const handleContainerDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleContainerDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const target = e.target as HTMLElement;
            const dropItem = target.closest("[data-index]") as HTMLElement;

            if (!dropItem || draggedIndexRef.current === null) {
                draggedIndexRef.current = null;
                return;
            }

            const dropIndex = parseInt(dropItem.dataset.index!, 10);
            const draggedIndex = draggedIndexRef.current;

            if (draggedIndex === dropIndex) {
                draggedIndexRef.current = null;
                return;
            }

            // Use ref to get latest mediaItems
            const currentItems = mediaItemsRef.current;
            const newItems = [...currentItems];
            const [draggedItem] = newItems.splice(draggedIndex, 1);
            newItems.splice(dropIndex, 0, draggedItem);

            // Create reorder payload
            const reorderPayload: MediaReorderItem[] = newItems.map((item, index) => ({
                mediaId: item.id,
                displayOrder: index,
            }));

            reorderMediaItems(reorderPayload);
            draggedIndexRef.current = null;
        },
        [reorderMediaItems]
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Media & Showcase</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your company's media gallery. Drag and drop to reorder items.
                    </p>
                </div>
                <Button onClick={handleOpenModal}>
                    <span className="flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Media
                    </span>
                </Button>
            </div>

            {error && (
                <Alert type="error" onClose={clearMessages}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert type="success" onClose={clearMessages}>
                    {successMessage}
                </Alert>
            )}

            {mediaItems.length > 0 ? (
                <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    onDragStart={handleContainerDragStart}
                    onDragOver={handleContainerDragOver}
                    onDrop={handleContainerDrop}
                >
                    {mediaItems.map((media, index) => (
                        <MediaItem
                            key={media.id}
                            media={media}
                            index={index}
                            onDelete={deleteMediaItem}
                            onView={setViewerIndex}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <Image className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No media uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1 mb-4">
                        Upload images, videos, or documents to showcase your company
                    </p>
                    <Button onClick={handleOpenModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Your First Media
                    </Button>
                </div>
            )}

            {/* Upload Modal */}
            <UploadMediaModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseModal}
                onUpload={handleUpload}
                isUploading={isUploading}
            />

            {/* Media Viewer Modal */}
            {viewerIndex !== null && (
                <HeadlessModal
                    isOpen
                    onClose={handleCloseViewer}
                    overlayClassName="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    className="relative w-full max-w-5xl mx-4"
                >
                    <MediaViewer
                        mediaItems={mediaItems}
                        index={viewerIndex}
                        onChangeIndex={setViewerIndex}
                        onClose={handleCloseViewer}
                        onDelete={deleteMediaItem}
                    />
                </HeadlessModal>
            )}
        </div>
    );
};

export default CompanyMediaGallery;
