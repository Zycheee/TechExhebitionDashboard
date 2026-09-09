"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface LifewoodDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  variant?: "standard" | "pill" | "compact";
  isActivePill?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
}

// Radix Select rejects empty string values, so we map internally
const EMPTY_VALUE_KEY = "__EMPTY_VALUE__";
const toRadixValue = (v: string | undefined | null): string => {
  if (v === "" || v === undefined || v === null) return EMPTY_VALUE_KEY;
  return String(v);
};
const fromRadixValue = (v: string): string => {
  if (v === EMPTY_VALUE_KEY) return "";
  return v;
};

export function LifewoodDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  variant = "standard",
  isActivePill = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  disabled = false,
  name,
  id,
  "aria-label": ariaLabel,
}: LifewoodDropdownProps) {
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  const radixValue = toRadixValue(value);

  const getTriggerStyles = () => {
    switch (variant) {
      case "pill":
        if (isActivePill) {
          return "inline-flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full border-[1.5px] border-[#133020] bg-[#133020] text-white text-[12.5px] font-semibold shadow-xs hover:bg-[#046241] hover:border-[#046241] focus:outline-none focus:ring-2 focus:ring-[#046241]/30 transition-all cursor-pointer";
        }
        return "inline-flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full border-[1.5px] border-[#D8D2C8] bg-white text-[#555555] text-[12.5px] font-medium shadow-xs hover:border-[#133020]/40 hover:text-[#133020] focus:outline-none focus:border-[#046241] focus:ring-2 focus:ring-[#046241]/20 transition-all cursor-pointer";

      case "compact":
        return "inline-flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-md border border-[#D8D2C8] bg-white text-xs font-bold text-[#133020] shadow-xs hover:border-[#046241]/60 focus:outline-none focus:border-[#046241] focus:ring-2 focus:ring-[#046241]/20 transition-all cursor-pointer";

      case "standard":
      default:
        return "inline-flex w-full items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[#D8D2C8] bg-white text-xs font-semibold text-[#133020] shadow-xs hover:border-[#046241]/60 focus:outline-none focus:border-[#046241] focus:ring-2 focus:ring-[#046241]/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#F5EEDB]";
    }
  };

  const getChevronStyles = () => {
    if (variant === "pill" && isActivePill) {
      return "w-3.5 h-3.5 text-[#FFB347] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180";
    }
    if (variant === "compact") {
      return "w-3 h-3 text-[#133020] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180";
    }
    if (variant === "pill") {
      return "w-3.5 h-3.5 text-[#666666] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180";
    }
    return "w-3.5 h-3.5 text-[#133020] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180";
  };

  return (
    <div className={`relative inline-block ${variant === "standard" ? "w-full" : ""} ${className}`}>
      <SelectPrimitive.Root
        value={radixValue}
        onValueChange={(val) => onChange(fromRadixValue(val))}
        disabled={disabled}
        name={name}
      >
        <SelectPrimitive.Trigger
          id={id}
          aria-label={ariaLabel}
          className={`group font-manrope ${getTriggerStyles()} ${triggerClassName}`}
        >
          <span className="truncate block text-left flex-1">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <SelectPrimitive.Icon asChild>
            <ChevronDown className={getChevronStyles()} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={5}
            className={`z-[999999] min-w-[var(--radix-select-trigger-width)] max-w-[28rem] overflow-hidden rounded-xl border-[1.5px] border-[#D8D2C8] bg-white shadow-[0_12px_36px_rgba(19,48,32,0.16)] p-1.5 font-manrope animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 ${contentClassName}`}
          >
            <SelectPrimitive.Viewport className="p-0.5 max-h-72 overflow-y-auto">
              {options.map((opt) => {
                const optRadixVal = toRadixValue(opt.value);
                return (
                  <SelectPrimitive.Item
                    key={optRadixVal}
                    value={optRadixVal}
                    disabled={opt.disabled}
                    className="relative flex w-full cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-[#133020] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-[#F5EEDB] data-[highlighted]:text-[#046241] data-[state=checked]:bg-[#046241]/10 data-[state=checked]:text-[#046241] data-[state=checked]:font-bold"
                  >
                    <SelectPrimitive.ItemText>
                      {opt.label}
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="shrink-0 text-[#046241]">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                );
              })}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
