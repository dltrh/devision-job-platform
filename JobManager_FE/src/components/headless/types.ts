// Headless Form Types
export interface HeadlessFormProps<T> {
    initialValues?: T;
    onSubmit: (values: T) => void;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
    children: (props: FormRenderProps<T>) => React.ReactNode;
    className?: string;
}

export interface FormRenderProps<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => void;
    handleBlur: (field: keyof T) => void;
    handleSubmit: (e: React.FormEvent) => void;
    setFieldValue: (field: keyof T, value: any) => void;
    isValid: boolean;
}

// Headless Table Types
export interface TableColumn<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
}

export interface HeadlessTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    pageSize?: number;
    className?: string;
    renderHeader?: (
        columns: TableColumn<T>[],
        requestSort: (key: keyof T) => void,
        sortConfig: SortConfig<T> | null,
    ) => React.ReactNode;
    renderRow?: (item: T, columns: TableColumn<T>[]) => React.ReactNode;
    renderPagination?: (pagination: PaginationProps) => React.ReactNode;
}

export interface SortConfig<T> {
    key: keyof T;
    direction: "asc" | "desc";
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
}

// Headless Modal Types
export interface HeadlessModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: (props: ModalRenderProps) => React.ReactNode;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
}

export interface ModalRenderProps {
    close: () => void;
}
