import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "./classNames";

type AlertTone = "error" | "success" | "warning" | "info";

interface AlertProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  tone?: AlertTone;
}

const toneClassNames: Record<AlertTone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-slate-200 bg-slate-50 text-slate-600",
};

export function Alert({
  children,
  className,
  tone = "info",
  ...props
}: AlertProps) {
  return (
    <p
      className={classNames(
        "app-alert rounded-xl border px-4 py-3 font-bold",
        toneClassNames[tone],
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
