import type { InputHTMLAttributes, ReactNode } from "react";

import { classNames } from "./classNames";

interface ToggleFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  description?: string;
  label: ReactNode;
}

export function ToggleField({
  className,
  description,
  label,
  ...props
}: ToggleFieldProps) {
  return (
    <label
      className={classNames(
        "preferences-toggle flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-4",
        className,
      )}
    >
      <input type="checkbox" className="mt-0.5 h-5 w-5" {...props} />

      <span className="flex flex-col gap-1">
        <strong>{label}</strong>

        {description && (
          <small className="text-sm leading-5 text-slate-500">
            {description}
          </small>
        )}
      </span>
    </label>
  );
}
