import { useState, useEffect, useCallback } from "react";
import type { CompanyMedia, MediaUploadPayload, MediaReorderItem } from "../types";
import {
    getAllMedia,
    uploadMedia,
    updateMedia,
    deleteMedia,
    reorderMedia,
} from "../api/CompanyProfileService";

interface UseCompanyMediaReturn {
    mediaItems: CompanyMedia[];
    isLoading: boolean;
    isUploading: boolean;
    error: string | null;
    successMessage: string | null;
    uploadNewMedia: (payload: MediaUploadPayload) => Promise<void>;
    updateMediaItem: (mediaId: string, data: { title?: string; description?: string }) => Promise<void>;
    deleteMediaItem: (mediaId: string) => Promise<void>;
    reorderMediaItems: (items: MediaReorderItem[]) => Promise<void>;
    refreshMedia: () => Promise<void>;
    clearMessages: () => void;
}

export function useCompanyMedia(): UseCompanyMediaReturn {
    const [mediaItems, setMediaItems] = useState<CompanyMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchMedia = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllMedia();
            // Sort by displayOrder
            const sortedData = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
            setMediaItems(sortedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load media");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const uploadNewMedia = useCallback(async (payload: MediaUploadPayload) => {
        setIsUploading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const newMedia = await uploadMedia(payload);
            setMediaItems((prev) => [...prev, newMedia].sort((a, b) => a.displayOrder - b.displayOrder));
            setSuccessMessage("Media uploaded successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload media");
        } finally {
            setIsUploading(false);
        }
    }, []);

    const updateMediaItem = useCallback(async (
        mediaId: string,
        data: { title?: string; description?: string }
    ) => {
        setError(null);
        setSuccessMessage(null);
        try {
            const updated = await updateMedia(mediaId, data);
            setMediaItems((prev) =>
                prev.map((item) => (item.id === mediaId ? updated : item))
            );
            setSuccessMessage("Media updated successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update media");
        }
    }, []);

    const deleteMediaItem = useCallback(async (mediaId: string) => {
        setError(null);
        setSuccessMessage(null);
        try {
            await deleteMedia(mediaId);
            setMediaItems((prev) => prev.filter((item) => item.id !== mediaId));
            setSuccessMessage("Media deleted successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete media");
        }
    }, []);

    const reorderMediaItems = useCallback(async (items: MediaReorderItem[]) => {
        setError(null);
        try {
            await reorderMedia(items);
            // Update local state with new order
            setMediaItems((prev) => {
                const newItems = [...prev];
                items.forEach(({ mediaId, displayOrder }) => {
                    const item = newItems.find((i) => i.id === mediaId);
                    if (item) {
                        item.displayOrder = displayOrder;
                    }
                });
                return newItems.sort((a, b) => a.displayOrder - b.displayOrder);
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reorder media");
        }
    }, []);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccessMessage(null);
    }, []);

    return {
        mediaItems,
        isLoading,
        isUploading,
        error,
        successMessage,
        uploadNewMedia,
        updateMediaItem,
        deleteMediaItem,
        reorderMediaItems,
        refreshMedia: fetchMedia,
        clearMessages,
    };
}
