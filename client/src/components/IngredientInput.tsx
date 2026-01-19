import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { popularIngredients } from "@shared/schema";

interface IngredientInputProps {
  selectedIngredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
}

export function IngredientInput({ selectedIngredients, onAdd, onRemove }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredIngredients = popularIngredients
    .filter(ingredient => 
      ingredient.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedIngredients.includes(ingredient)
    )
    .slice(0, 8);

  const handleSelect = (ingredient: string) => {
    onAdd(ingredient);
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredIngredients.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredIngredients.length > 0) {
        handleSelect(filteredIngredients[highlightedIndex]);
      } else if (inputValue.trim()) {
        handleSelect(inputValue.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [inputValue]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative" data-testid="wrapper-ingredient-search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Добавление продуктов..."
            className="pl-10"
            data-testid="input-ingredient"
          />
        </div>
        
        {isOpen && inputValue && filteredIngredients.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-popover-border rounded-md shadow-lg overflow-hidden"
          >
            {filteredIngredients.map((ingredient, index) => (
              <button
                key={ingredient}
                type="button"
                onClick={() => handleSelect(ingredient)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                  index === highlightedIndex 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50"
                }`}
                data-testid={`option-ingredient-${ingredient}`}
              >
                {ingredient}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {popularIngredients
          .filter(i => !selectedIngredients.includes(i))
          .slice(0, 6)
          .map(ingredient => (
            <Badge
              key={ingredient}
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleSelect(ingredient)}
              data-testid={`badge-quick-${ingredient}`}
            >
              + {ingredient}
            </Badge>
          ))}
      </div>

      {selectedIngredients.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-3" data-testid="text-selected-label">Выбранные продукты:</p>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map(ingredient => (
              <Badge
                key={ingredient}
                variant="secondary"
                className="gap-1"
                data-testid={`badge-selected-${ingredient}`}
              >
                {ingredient}
                <button
                  type="button"
                  onClick={() => onRemove(ingredient)}
                  className="ml-1 hover:text-destructive transition-colors"
                  aria-label={`Удалить ${ingredient}`}
                  data-testid={`button-remove-${ingredient}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
