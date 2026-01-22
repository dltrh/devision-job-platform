import { useState, useMemo } from "react";

export interface TableColumn<T> {
    key: keyof T;
    header: string;
    render?: (item: T) => React.ReactNode;
}

interface UseTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    initialPage?: number;
    pageSize?: number;
}

export const useTable = <T>({
    data,
    initialPage = 1,
    pageSize = 10,
}: UseTableProps<T>) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof T;
        direction: "asc" | "desc";
    } | null>(null);

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(data.length / pageSize);

    const requestSort = (key: keyof T) => {
        let direction: "asc" | "desc" = "asc";
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "asc"
        ) {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return {
        data: paginatedData,
        sortConfig,
        requestSort,
        currentPage,
        totalPages,
        goToPage,
    };
};
