"use client"

import { cn } from "@/lib/utils"
import { AirportSelector } from "./airport-selector"
import type { Airport } from "@/lib/airports"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { RiskThresholds } from "@/lib/weather-types"
import { AirportWeatherLogo } from "./airport-weather-logo"

interface HeaderProps {
  selectedAirport: Airport
  onAirportChange: (airport: Airport) => void
  lastUpdated: Date | null
  isLoading: boolean
  onRefresh: () => void
  riskThresholds: RiskThresholds
  onRiskThresholdsChange: (thresholds: RiskThresholds) => void
  className?: string
}

export function Header({
  selectedAirport,
  onAirportChange,
  lastUpdated,
  isLoading,
  onRefresh,
  riskThresholds,
  onRiskThresholdsChange,
  className,
}: HeaderProps) {
  return (
    <header className={cn("glass-card rounded-xl p-6 border-b-2 border-primary/30", className)}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-1.5 neon-border">
              <AirportWeatherLogo className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground neon-text tracking-tight">
                AIRPORT WEATHER INTELLIGENCE
              </h1>
              <p className="text-xs text-primary/80 font-mono uppercase tracking-widest mt-1">
                Northern Nigeria Aviation Operations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs mt-4 font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="h-2 w-2 rounded-full bg-green-400 pulse-glow" />
              <span className="text-green-300">LOCAL DATA</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="h-2 w-2 rounded-full bg-blue-400 pulse-glow" />
              <span className="text-blue-300">ML READY</span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
                <svg
                  className="h-3 w-3 animate-spin text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-primary">UPDATING...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary text-sm font-mono transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            >
              REFRESH DATA
            </button>
            <button
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8,Weather Data Export\n" +
                  `Airport: ${selectedAirport.code}\n` +
                  `Timestamp: ${new Date().toISOString()}\n`;
                const link = document.createElement('a');
                link.setAttribute('href', csvContent);
                link.setAttribute('download', `weather-${selectedAirport.code}-${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
              }}
              className="px-4 py-2 rounded-lg bg-success/20 hover:bg-success/30 border border-success/50 text-success text-sm font-mono transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-success/20"
            >
              EXPORT DATA
            </button>
            <Dialog>
              <DialogTrigger asChild>
                <button className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/50 text-primary text-sm font-mono transition-all duration-300">
                  SETTINGS
                </button>
              </DialogTrigger>
              <DialogContent className="border-primary/30 bg-slate-950 text-foreground">
                <DialogHeader>
                  <DialogTitle className="font-mono uppercase tracking-wider text-primary">
                    Operational Alert Settings
                  </DialogTitle>
                  <DialogDescription>
                    Adjust local thresholds used by the risk and sound alerts.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  {([
                    ["highWind", "High-risk wind", "km/h"],
                    ["restrictedWind", "Restricted wind", "km/h"],
                    ["highVisibility", "High-risk visibility", "metres"],
                    ["restrictedVisibility", "Restricted visibility", "metres"],
                  ] as const).map(([key, label, unit]) => (
                    <label key={key} className="grid gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {label}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={riskThresholds[key]}
                          onChange={(event) =>
                            onRiskThresholdsChange({
                              ...riskThresholds,
                              [key]: Math.max(1, Number(event.target.value)),
                            })
                          }
                          className="w-full rounded-md border border-primary/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                        />
                        <span className="normal-case text-primary/70">{unit}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <AirportSelector
            selectedAirport={selectedAirport}
            onAirportChange={onAirportChange}
          />

          <div className="text-right text-xs text-muted-foreground font-mono space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <svg
                className="h-3 w-3"
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
              </svg>
              <span>
                {selectedAirport.latitude.toFixed(4)}°N, {selectedAirport.longitude.toFixed(4)}°E
              </span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 justify-end">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {lastUpdated.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
