import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "./classNames";

type SummaryCardTone = "neutral" | "warning" | "info" | "success";

interface SummaryCardProps extends HTMLAttributes<HTMLElement> {
  label: string;
  tone?: SummaryCardTone;
  value: ReactNode;
}

const toneClassNames: Record<
  SummaryCardTone,
  { card: string; label: string; value: string }
> = {
  neutral: {
    card: "border-slate-200 bg-slate-50",
    label: "text-slate-600",
    value: "text-slate-950",
  },
  warning: {
    card: "border-amber-200 bg-amber-50",
    label: "text-amber-800",
    value: "text-amber-950",
  },
  info: {
    card: "border-blue-200 bg-blue-50",
    label: "text-blue-700",
    value: "text-blue-950",
  },
  success: {
    card: "border-green-200 bg-green-50",
    label: "text-green-700",
    value: "text-green-950",
  },
};

export function SummaryCard({
  className,
  label,
  tone = "neutral",
  value,
  ...props
}: SummaryCardProps) {
  const classes = toneClassNames[tone];

  return (
    <article
      className={classNames(
        "rounded-2xl border p-4",
        classes.card,
        className,
      )}
      {...props}
    >
      <p className={classNames("m-0 text-sm font-bold", classes.label)}>
        {label}
      </p>

      <strong className={classNames("mt-2 block text-3xl", classes.value)}>
        {value}
      </strong>
    </article>
  );
}
