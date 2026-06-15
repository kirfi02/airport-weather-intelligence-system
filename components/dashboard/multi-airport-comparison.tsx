"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { airports } from "@/lib/airports"
import { fetchWeatherData } from "@/lib/weather-api"
import type { WeatherData } from "@/lib/weather-types"
import { calculateRiskLevel } from "@/lib/weather-types"

interface AirportWeatherSnapshot {
  code: string
  city: string
  data: WeatherData | null
  isLoading: boolean
}

export function MultiAirportComparison() {
  const [airportSnapshots, setAirportSnapshots] = useState<AirportWeatherSnapshot[]>(
    airports.map((airport) => ({
      code: airport.code,
      city: airport.city,
      data: null,
      isLoading: true,
    }))
  )

  // Fetch weather for all airports
  useEffect(() => {
    const fetchAllAirports = async () => {
      const snapshots = await Promise.all(
        airports.map(async (airport) => {
          try {
            const data = await fetchWeatherData(airport.latitude, airport.longitude)
            return {
              code: airport.code,
              city: airport.city,
              data,
              isLoading: false,
            }
          } catch {
            return {
              code: airport.code,
              city: airport.city,
              data: null,
              isLoading: false,
            }
          }
        })
      )
      setAirportSnapshots(snapshots)
    }

    fetchAllAirports()
  }, [])

  // Find hottest, coldest, windiest airports
  const getStats = () => {
    const validSnapshots = airportSnapshots.filter((s) => s.data)
    if (validSnapshots.length === 0) return null

    const temps = validSnapshots.map((s) => s.data!.current.temperature)
    const winds = validSnapshots.map((s) => s.data!.current.windSpeed)

    return {
      hottest: airportSnapshots[
        airportSnapshots.findIndex(
          (s) => s.data && s.data.current.temperature === Math.max(...temps)
        )
      ],
      coldest: airportSnapshots[
        airportSnapshots.findIndex(
          (s) => s.data && s.data.current.temperature === Math.min(...temps)
        )
      ],
      windiest: airportSnapshots[
        airportSnapshots.findIndex(
          (s) => s.data && s.data.current.windSpeed === Math.max(...winds)
        )
      ],
    }
  }

  const stats = getStats()

  const getRiskColor = (windSpeed: number, visibility: number) => {
    const riskLevel = calculateRiskLevel(windSpeed, visibility)
    if (riskLevel.level === "high") return "bg-red-500/10 border-red-500/30"
    if (riskLevel.level === "restricted") return "bg-yellow-500/10 border-yellow-500/30"
    return "bg-green-500/10 border-green-500/30"
  }

  const getRiskTextColor = (windSpeed: number, visibility: number) => {
    const riskLevel = calculateRiskLevel(windSpeed, visibility)
    if (riskLevel.level === "high") return "text-red-300"
    if (riskLevel.level === "restricted") return "text-yellow-300"
    return "text-green-300"
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-lg p-4 border border-cyan-500/30">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
              Hottest
            </p>
            <p className="text-2xl font-bold text-foreground">{stats.hottest.code}</p>
            <p className="text-sm text-primary/80 font-mono">
              {stats.hottest.data?.current.temperature}°C
            </p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-cyan-500/30">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
              Coldest
            </p>
            <p className="text-2xl font-bold text-foreground">{stats.coldest.code}</p>
            <p className="text-sm text-primary/80 font-mono">
              {stats.coldest.data?.current.temperature}°C
            </p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-yellow-500/30">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
              Windiest
            </p>
            <p className="text-2xl font-bold text-foreground">{stats.windiest.code}</p>
            <p className="text-sm text-yellow-300/80 font-mono">
              {stats.windiest.data?.current.windSpeed} km/h
            </p>
          </div>
        </div>
      )}

      {/* Airport Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {airportSnapshots.map((snapshot) => (
          <div
            key={snapshot.code}
            className={cn(
              "glass-card rounded-lg p-4 transition-all duration-300 border-2",
              snapshot.data &&
                getRiskColor(
                  snapshot.data.current.windSpeed,
                  snapshot.data.current.visibility
                )
            )}
          >
            {snapshot.isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-12 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ) : snapshot.data ? (
              <>
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-sm font-mono font-bold text-foreground uppercase">
                    {snapshot.code}
                  </p>
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded",
                      getRiskColor(
                        snapshot.data.current.windSpeed,
                        snapshot.data.current.visibility
                      )
                    )}
                  >
                    {calculateRiskLevel(
                      snapshot.data.current.windSpeed,
                      snapshot.data.current.visibility
                    ).label.split(" ")[0]}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground w-20">Temp</span>
                    <span className="text-foreground font-semibold">
                      {snapshot.data.current.temperature}°C
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground w-20">Wind</span>
                    <span
                      className={cn(
                        "font-semibold",
                        snapshot.data.current.windSpeed > 30
                          ? "text-red-300"
                          : snapshot.data.current.windSpeed > 20
                            ? "text-yellow-300"
                            : "text-green-300"
                      )}
                    >
                      {snapshot.data.current.windSpeed} km/h
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground w-20">Visibility</span>
                    <span className="text-foreground font-semibold">
                      {(snapshot.data.current.visibility / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground w-20">Humidity</span>
                    <span className="text-foreground font-semibold">
                      {snapshot.data.current.humidity}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Failed to load</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
