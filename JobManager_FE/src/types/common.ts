// Common types used across the application

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
    timestamp?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export interface SelectOption {
    label: string;
    value: string | number;
}

export type LoadingState = "idle" | "loading" | "success" | "error";
