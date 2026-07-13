import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "./classNames";

type BadgeTone = "slate" | "amber" | "green" | "blue" | "purple" | "red";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

const toneClassNames: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
  red: "bg-red-50 text-red-700",
};

export function Badge({
  children,
  className,
  tone = "slate",
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "app-badge rounded-full px-3 py-1 text-sm font-bold",
        toneClassNames[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
