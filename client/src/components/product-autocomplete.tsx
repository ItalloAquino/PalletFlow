import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@shared/schema";

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string, product?: Product) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ProductAutocomplete({
  value,
  onChange,
  placeholder = "Digite o código do produto",
  disabled = false,
}: ProductAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products/search", { q: searchTerm }],
    enabled: searchTerm.length > 0,
  });

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSelect = (productCode: string) => {
    const selectedProduct = products?.find(p => p.code === productCode);
    setSearchTerm(productCode);
    onChange(productCode, selectedProduct);
    setOpen(false);
  };

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue);
    onChange(inputValue);
    if (inputValue) {
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-8"
          />
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            {products && products.length > 0 && (
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.code}
                    onSelect={() => handleSelect(product.code)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{product.code}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
