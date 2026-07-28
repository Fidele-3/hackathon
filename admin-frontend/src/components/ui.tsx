"use client";

import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-emerald-100 bg-white/80 shadow-sm backdrop-blur-sm dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:shadow-lg dark:shadow-emerald-950/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {message}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-neutral-500">Loading…</div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-neutral-400">{message}</div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  requested: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  open: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  stored: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  reserved: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  sold: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "warning" }) {
  const base = "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-gradient-to-br from-emerald-600 to-emerald-500 text-white border border-emerald-400/50 shadow-md shadow-emerald-600/30 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/40",
    secondary:
      "bg-neutral-100/80 text-neutral-800 border border-neutral-200 backdrop-blur-sm hover:bg-neutral-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-500/20 dark:hover:bg-emerald-800/40",
    danger:
      "bg-gradient-to-br from-red-600 to-red-500 text-white border border-red-400/50 shadow-md shadow-red-600/30 hover:from-red-500 hover:to-red-400",
    warning:
      "bg-gradient-to-br from-amber-500 to-amber-400 text-white border border-amber-300/50 shadow-md shadow-amber-500/30 hover:from-amber-400 hover:to-amber-300",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <span className="text-sm text-neutral-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, rows, keyFn }: { columns: Column<T>[]; rows: T[]; keyFn: (row: T) => string | number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500 dark:border-neutral-800">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((row) => (
            <tr key={keyFn(row)} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
