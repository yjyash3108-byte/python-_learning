"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormSelectOption = {
  value: string;
  label: string;
};

interface FormSelectProps {
  name: string;
  id?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  options: FormSelectOption[];
}

export function FormSelect({
  name,
  id,
  required,
  defaultValue = "",
  placeholder = "Select…",
  options,
}: FormSelectProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <Select
        value={value || undefined}
        onValueChange={setValue}
      >
        <SelectTrigger id={id} className="w-full bg-transparent">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-[200] border-border bg-popover text-popover-foreground">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
