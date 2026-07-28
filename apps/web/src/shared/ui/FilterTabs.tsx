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
      className="flex w-full flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 md:w-fit md:flex-nowrap">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={classNames(
              "min-h-11 min-w-0 flex-1 basis-[calc(50%-0.25rem)] rounded-lg px-3 text-sm font-bold transition-colors focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-slate-950 md:min-h-9 md:min-w-24 md:flex-none md:basis-auto md:text-xs",
              isSelected
                ? "bg-slate-950 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950",
            )}>
            {option.label} ({option.count})
          </button>
        );
      })}
    </div>
  );
}
