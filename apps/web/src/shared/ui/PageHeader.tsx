import type { ReactNode } from "react";

interface PageHeaderProps {
  action?: ReactNode;
  description?: ReactNode;
  title: string;
  titleId: string;
}

export function PageHeader({
  action,
  description,
  title,
  titleId,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 id={titleId} className="m-0 text-[28px] font-bold">
          {title}
        </h2>

        {description && (
          <p className="simple-mode-secondary mt-2 text-base leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
    </div>
  );
}
