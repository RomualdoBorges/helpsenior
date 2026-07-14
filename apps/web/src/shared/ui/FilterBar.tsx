import { Button } from "./Button";

interface FilterOption<T extends string> {
  count: number;
  label: string;
  value: T;
}

interface FilterBarProps<T extends string> {
  filterLabel?: string;
  itemLabel: string;
  onChange: (value: T) => void;
  options: readonly FilterOption<T>[];
  selectedValue: T;
  title: string;
  totalCount: number;
  visibleCount: number;
}

export function FilterBar<T extends string>({
  filterLabel = "Filtrar lista",
  itemLabel,
  onChange,
  options,
  selectedValue,
  title,
  totalCount,
  visibleCount,
}: FilterBarProps<T>) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="m-0 text-xl font-bold text-slate-950">{title}</h3>

        <p className="mt-1 text-sm font-bold text-slate-500">
          {visibleCount} de {totalCount} {itemLabel}
          {totalCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={filterLabel}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              size="sm"
              variant={isSelected ? "primary" : "secondary"}
              className="rounded-full">
              {option.label} ({option.count})
            </Button>
          );
        })}
      </div>
    </div>
  );
}
