"use client"

import { useState } from "react"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface MonthSelectorProps {
  value: string // formato: YYYY-MM
  onChange: (value: string) => void
}

export default function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const [date, setDate] = useState<Date>(() => {
    return value ? parse(value, "yyyy-MM", new Date()) : new Date()
  })

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      onChange(format(newDate, "yyyy-MM"))
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[240px] justify-start text-left font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(parse(value, "yyyy-MM", new Date()), "MMMM yyyy", {
              locale: es,
            })
          ) : (
            <span>Selecciona un mes</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="month"
          selected={date}
          onSelect={handleSelect}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
