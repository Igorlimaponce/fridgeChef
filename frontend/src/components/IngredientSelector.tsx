import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { INGREDIENTS } from "@/constants/languages";
import { useLanguage } from "@/contexts/LanguageContext";

interface IngredientSelectorProps {
  onSelect: (ingredient: string) => void;
  disabled?: boolean;
}

export function IngredientSelector({ onSelect, disabled }: IngredientSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const { language, t } = useLanguage();

  const ingredients = INGREDIENTS.map((i) => ({
    value: i[language],
    label: i[language],
  })).sort((a, b) => a.label.localeCompare(b.label));

  const handleSelect = (currentValue: string) => {
    onSelect(currentValue);
    setValue("");
    setInputValue("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {t("selectIngredient")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={t("searchIngredients")} 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-4 text-sm">
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">{t("notFound")}</p>
                {inputValue && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSelect(inputValue)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    {t("add")} "{inputValue}"
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup heading={t("ingredients")}>
              {ingredients.map((ingredient) => (
                <CommandItem
                  key={ingredient.value}
                  value={ingredient.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === ingredient.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {ingredient.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
