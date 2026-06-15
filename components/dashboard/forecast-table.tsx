"use client"

import { cn } from "@/lib/utils"
import type { HourlyForecast } from "@/lib/weather-types"
import { getWeatherDescription } from "@/lib/weather-types"

interface ForecastTableProps {
  forecasts: HourlyForecast[]
  className?: string
}

export function ForecastTable({ forecasts, className }: ForecastTableProps) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getWindClass = (windSpeed: number) => {
    if (windSpeed > 30) return "text-red-400"
    if (windSpeed > 20) return "text-yellow-400"
    return "text-green-400"
  }

  const getVisibilityClass = (visibility: number) => {
    if (visibility < 1000) return "text-red-400"
    if (visibility < 3000) return "text-yellow-400"
    return "text-green-400"
  }

  // Show next 8 hours
  const displayForecasts = forecasts.slice(0, 8)

  // Get status badge for conditions
  const getStatusBadge = (windSpeed: number, visibility: number) => {
    if (windSpeed > 30 || visibility < 1000) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
          Alert
        </span>
      )
    }
    if (windSpeed > 20 || visibility < 3000) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
          Caution
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-green-500/20 text-green-300 border border-green-500/30">
        Clear
      </span>
    )
  }

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300 card-glow-cyan border border-primary/20",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/20">
        <h3 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
          Operational Forecast
        </h3>
        <span className="text-xs font-mono text-primary/60 uppercase">
          Next 8 Hours
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/30">
              <th className="text-left py-3 px-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Time
              </th>
              <th className="text-left py-3 px-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Condition
              </th>
              <th className="text-right py-3 px-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Temp
              </th>
              <th className="text-right py-3 px-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Wind
              </th>
              <th className="text-right py-3 px-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Visibility
              </th>
              <th className="text-right py-3 px-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Humidity
              </th>
              <th className="text-center py-3 px-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {displayForecasts.map((forecast, index) => (
              <tr
                key={forecast.time}
                className={cn(
                  "border-b border-border/30 transition-colors hover:bg-muted/30",
                  index === 0 && "bg-primary/5"
                )}
              >
                <td className="py-3 px-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {formatTime(forecast.time)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(forecast.time)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-foreground">
                    {getWeatherDescription(forecast.weatherCode)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-sm font-medium text-foreground">
                    {forecast.temperature}°C
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      getWindClass(forecast.windSpeed)
                    )}
                  >
                    {forecast.windSpeed} km/h
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      getVisibilityClass(forecast.visibility)
                    )}
                  >
                    {(forecast.visibility / 1000).toFixed(1)} km
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-sm font-mono text-foreground">
                    {forecast.humidity}%
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  {getStatusBadge(forecast.windSpeed, forecast.visibility)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
            <span className="text-green-300/80">Clear</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
            <span className="text-yellow-300/80">Caution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
            <span className="text-red-300/80">Alert</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          Wind {">"} 30 km/h or Visibility {"<"} 1 km triggers Alert
        </span>
      </div>
    </div>
  )
}
