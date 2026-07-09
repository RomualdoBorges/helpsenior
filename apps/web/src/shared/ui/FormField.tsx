import type { LabelHTMLAttributes, ReactNode } from "react";

import { classNames } from "./classNames";

interface FormFieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  label: string;
}

export function FormField({
  children,
  className,
  label,
  ...props
}: FormFieldProps) {
  return (
    <label className={classNames("grid gap-2", className)} {...props}>
      <span className="font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
