import type { ReactNode } from "react";

interface ListStateProps {
  children?: ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
  isLoading: boolean;
  loadingMessage: string;
}

export function ListState({
  children,
  emptyMessage,
  isEmpty,
  isLoading,
  loadingMessage,
}: ListStateProps) {
  if (isLoading) {
    return (
      <p className="mt-6 text-base font-bold text-slate-600" role="status">
        {loadingMessage}
      </p>
    );
  }

  if (isEmpty) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-base font-bold text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return children ?? null;
}
