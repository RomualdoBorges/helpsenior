import type { TextareaHTMLAttributes } from "react";

import { classNames } from "./classNames";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={classNames(
        "min-h-24 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950",
        className,
      )}
      {...props}
    />
  );
}
