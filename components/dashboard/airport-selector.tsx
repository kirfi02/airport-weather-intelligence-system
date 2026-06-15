"use client"

import { cn } from "@/lib/utils"
import { airports, type Airport } from "@/lib/airports"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AirportSelectorProps {
  selectedAirport: Airport
  onAirportChange: (airport: Airport) => void
  className?: string
}

export function AirportSelector({
  selectedAirport,
  onAirportChange,
  className,
}: AirportSelectorProps) {
  const handleChange = (code: string) => {
    const airport = airports.find((a) => a.code === code)
    if (airport) {
      onAirportChange(airport)
    }
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-sm hidden sm:inline">Select Airport:</span>
      </div>
      <Select value={selectedAirport.code} onValueChange={handleChange}>
        <SelectTrigger className="w-[280px] bg-secondary/50 border-border/50 focus:ring-primary">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="font-mono text-primary font-bold">
                {selectedAirport.code}
              </span>
              <span className="text-muted-foreground">-</span>
              <span>{selectedAirport.city}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {airports.map((airport) => (
            <SelectItem
              key={airport.code}
              value={airport.code}
              className="focus:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary font-bold w-12">
                  {airport.code}
                </span>
                <div className="flex flex-col">
                  <span className="text-foreground">{airport.city}</span>
                  <span className="text-xs text-muted-foreground">
                    {airport.name}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
