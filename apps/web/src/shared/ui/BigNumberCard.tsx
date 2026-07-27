import type { ReactNode } from "react";

import { classNames } from "./classNames";

type BigNumberCardTone = "amber" | "blue" | "green" | "slate" | "violet";

interface BigNumberCardProps {
  icon: ReactNode;
  label: string;
  tone: BigNumberCardTone;
  value: number;
}

const toneClassNames: Record<
  BigNumberCardTone,
  { accent: string; icon: string; value: string }
> = {
  amber: {
    accent: "border-l-amber-500",
    icon: "bg-amber-50 text-amber-700",
    value: "text-amber-700",
  },
  blue: {
    accent: "border-l-blue-500",
    icon: "bg-blue-50 text-blue-700",
    value: "text-blue-700",
  },
  green: {
    accent: "border-l-green-500",
    icon: "bg-green-50 text-green-700",
    value: "text-green-700",
  },
  slate: {
    accent: "border-l-slate-500",
    icon: "bg-slate-100 text-slate-700",
    value: "text-slate-800",
  },
  violet: {
    accent: "border-l-violet-600",
    icon: "bg-violet-50 text-violet-700",
    value: "text-violet-700",
  },
};

export function BigNumberCard({
  icon,
  label,
  tone,
  value,
}: BigNumberCardProps) {
  const toneClasses = toneClassNames[tone];

  return (
    <article
      className={classNames(
        "flex min-h-28 items-center gap-4 rounded-2xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm",
        toneClasses.accent,
      )}
    >
      <span
        aria-hidden="true"
        className={classNames(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl",
          toneClasses.icon,
        )}
      >
        {icon}
      </span>

      <div>
        <strong
          className={classNames(
            "block text-3xl font-extrabold leading-none",
            toneClasses.value,
          )}
        >
          {value}
        </strong>
        <p className="mt-2 text-sm font-bold text-slate-600">{label}</p>
      </div>
    </article>
  );
}
