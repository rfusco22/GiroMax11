"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { countryValidationRules } from "@/lib/validation"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  selectedCountry: string
  onCountryChange: (countryCode: string) => void
  error?: string
  disabled?: boolean
}

export function PhoneInput({ value, onChange, selectedCountry, onCountryChange, error, disabled }: PhoneInputProps) {
  const [open, setOpen] = React.useState(false)

  const currentCountry = countryValidationRules.find((c) => c.code === selectedCountry)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove any non-digit characters except spaces and hyphens
    const cleaned = input.replace(/[^\d\s\-()]/g, "")
    onChange(cleaned)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[180px] justify-between bg-transparent"
              disabled={disabled}
            >
              {currentCountry ? (
                <span className="flex items-center gap-2">
                  <span className="text-lg">{currentCountry.flag}</span>
                  <span className="text-sm">{currentCountry.phoneCode}</span>
                </span>
              ) : (
                "Selecciona país"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Buscar país..." />
              <CommandList>
                <CommandEmpty>No se encontró el país.</CommandEmpty>
                <CommandGroup>
                  {countryValidationRules.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => {
                        onCountryChange(country.code)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedCountry === country.code ? "opacity-100" : "opacity-0")}
                      />
                      <span className="mr-2 text-lg">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-sm text-muted-foreground">{country.phoneCode}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex-1 space-y-1">
          <Input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder={currentCountry?.phoneExample || "Número de teléfono"}
            disabled={disabled || !currentCountry}
            className={cn(error && "border-red-500")}
          />
          {currentCountry && <p className="text-xs text-muted-foreground">Formato: {currentCountry.phoneFormat}</p>}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
