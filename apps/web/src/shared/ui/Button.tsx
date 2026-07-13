import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "./classNames";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "warning";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "border border-slate-950 bg-slate-950 text-white hover:bg-slate-800",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  ghost:
    "border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  warning: "border border-amber-950 bg-amber-950 text-white hover:bg-amber-900",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-4 text-base",
  lg: "min-h-12 px-5 text-base",
};

export function Button({
  children,
  className,
  fullWidth = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={classNames(
        "rounded-xl font-bold disabled:cursor-not-allowed disabled:opacity-60",
        sizeClassNames[size],
        variantClassNames[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
