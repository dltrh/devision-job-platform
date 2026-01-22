import React from "react";
import { useTable, TableColumn } from "./useTable";

interface HeadlessTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    pageSize?: number;
    className?: string;
    renderHeader?: (
        columns: TableColumn<T>[],
        requestSort: (key: keyof T) => void,
        sortConfig: { key: keyof T; direction: "asc" | "desc" } | null,
    ) => React.ReactNode;
    renderRow?: (item: T, columns: TableColumn<T>[]) => React.ReactNode;
    renderPagination?: (
        currentPage: number,
        totalPages: number,
        goToPage: (page: number) => void,
    ) => React.ReactNode;
}

export const HeadlessTable = <T extends { id: string | number }>({
    data,
    columns,
    pageSize = 10,
    className,
    renderHeader,
    renderRow,
    renderPagination,
}: HeadlessTableProps<T>) => {
    const {
        data: paginatedData,
        sortConfig,
        requestSort,
        currentPage,
        totalPages,
        goToPage,
    } = useTable({ data, columns, pageSize });

    return (
        <div className={className}>
            <table>
                {renderHeader ? (
                    renderHeader(columns, requestSort, sortConfig)
                ) : (
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    onClick={() => requestSort(col.key)}
                                >
                                    {col.header}
                                    {sortConfig?.key === col.key
                                        ? sortConfig.direction === "asc"
                                            ? " 🔼"
                                            : " 🔽"
                                        : null}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {paginatedData.map((item) =>
                        renderRow ? (
                            renderRow(item, columns)
                        ) : (
                            <tr key={item.id}>
                                {columns.map((col) => (
                                    <td key={`${item.id}-${String(col.key)}`}>
                                        {col.render
                                            ? col.render(item)
                                            : (item[
                                                  col.key
                                              ] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
            {renderPagination &&
                renderPagination(currentPage, totalPages, goToPage)}
        </div>
    );
};
