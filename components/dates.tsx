"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

export function DateRangePicker({ dateRange, setDateRange }: {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}) {

  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={setDateRange}
      numberOfMonths={1}
      className="rounded-xl border border-white/40 shadow-sm bg-white/80"
    />
  );
}
