import type { InputHTMLAttributes } from "react";

import { classNames } from "./classNames";

export function Input({
  className,
  disabled,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={classNames(
        "min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 disabled:bg-slate-100 disabled:text-slate-500",
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
