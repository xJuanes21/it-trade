"use client";

import { Search } from "lucide-react";
import { useState, ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  actions?: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  columns,
  data,
  searchable = false,
  searchPlaceholder = "Buscar...",
  onSearch,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  actions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {subtitle && <p className="text-sm text-blue-300">{subtitle}</p>}
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 rounded-2xl border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}
          {actions}
        </div>
      </header>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="max-h-[600px] overflow-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground sticky top-0">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 ${alignClass[column.align || "left"]} ${column.className || ""}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {loading ? (
                // Loading skeleton
                [...Array(5)].map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <div className="h-3 w-32 rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={(item.id as string | number) || index}
                    className="transition hover:bg-muted/50 focus-within:bg-muted/50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 ${alignClass[column.align || "left"]} ${column.className || ""}`}
                      >
                        {column.render
                          ? column.render(item)
                          : ((item[column.key] as ReactNode) ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
