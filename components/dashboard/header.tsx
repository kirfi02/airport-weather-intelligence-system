"use client"

import { cn } from "@/lib/utils"
import { AirportSelector } from "./airport-selector"
import type { Airport } from "@/lib/airports"

interface HeaderProps {
  selectedAirport: Airport
  onAirportChange: (airport: Airport) => void
  lastUpdated: Date | null
  isLoading: boolean
  className?: string
}

export function Header({
  selectedAirport,
  onAirportChange,
  lastUpdated,
  isLoading,
  className,
}: HeaderProps) {
  return (
    <header className={cn("glass-card rounded-xl p-6 border-b-2 border-primary/30", className)}>
      {/* Top Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Left: Title Section */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/20 p-2.5 neon-border">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
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

          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-3 text-xs mt-4 font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="h-2 w-2 rounded-full bg-green-400 pulse-glow" />
              <span className="text-green-300">API LIVE</span>
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

        {/* Right: Control Panel */}
        <div className="flex flex-col items-end gap-4">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
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
          </div>

          {/* Airport Selector */}
          <AirportSelector
            selectedAirport={selectedAirport}
            onAirportChange={onAirportChange}
          />

          {/* Location & Time Info */}
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
