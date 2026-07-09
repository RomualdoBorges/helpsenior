import type { SelectHTMLAttributes } from "react";

import { classNames } from "./classNames";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={classNames(
        "min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
