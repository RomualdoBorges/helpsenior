import { classNames } from "./classNames";

interface FilterTabOption<T extends string> {
  count: number;
  label: string;
  value: T;
}

interface FilterTabsProps<T extends string> {
  ariaLabel: string;
  onChange: (value: T) => void;
  options: FilterTabOption<T>[];
  value: T;
}

export function FilterTabs<T extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: FilterTabsProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex w-fit max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-0.5">
      {options.map((option, index) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={classNames(
              "relative min-h-9 min-w-24 shrink-0 px-2 text-xs font-bold transition-colors focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-slate-950",
              index > 0 &&
                "before:absolute before:inset-y-3 before:left-0 before:w-px before:bg-slate-200",
              isSelected
                ? "rounded-lg bg-slate-950 text-white shadow-sm before:hidden"
                : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950",
            )}>
            {option.label} ({option.count})
          </button>
        );
      })}
    </div>
  );
}
