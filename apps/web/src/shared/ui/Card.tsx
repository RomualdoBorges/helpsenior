import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "./classNames";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "div" | "section";
  children: ReactNode;
  variant?: "default" | "muted" | "item";
}

const variantClassNames = {
  default:
    "app-card rounded-[20px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)]",
  muted: "rounded-2xl border border-slate-200 bg-slate-50 p-4",
  item: "rounded-2xl border border-slate-300 bg-white p-5",
};

export function Card({
  as: Component = "div",
  children,
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <Component
      className={classNames(variantClassNames[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
