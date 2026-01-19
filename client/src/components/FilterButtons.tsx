import { Button } from "@/components/ui/button";

interface FilterButtonsProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T | undefined;
  onSelect: (value: T | undefined) => void;
  formatOption?: (option: T) => string;
}

export function FilterButtons<T extends string>({
  label,
  options,
  selected,
  onSelect,
  formatOption = (opt) => opt,
}: FilterButtonsProps<T>) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            variant={selected === option ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(selected === option ? undefined : option)}
            className="transition-all"
            data-testid={`button-filter-${option}`}
          >
            {formatOption(option)}
          </Button>
        ))}
      </div>
    </div>
  );
}
