"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { airports } from "@/lib/airports"

interface RadarPanelProps {
  windSpeed: number
  visibility: number
  temperature: number
  selectedAirport?: string
  className?: string
}

// Aircraft/weather markers for the radar
interface RadarBlip {
  id: string
  x: number
  y: number
  type: "aircraft" | "weather" | "station"
  label?: string
}

// Map real-world coordinates (Northern Nigeria) to radar display coordinates
// Approximate bounds: Latitude 9-12°N, Longitude 7-10°E
const coordinatesToRadar = (latitude: number, longitude: number): { x: number; y: number } => {
  // Normalize coordinates to radar space (0-100)
  // Latitude: 10 (center) = 50%, range ~9-12
  // Longitude: 8.5 (center) = 50%, range ~7-10
  
  const latCenter = 10.5
  const lonCenter = 8.5
  const latRange = 3.5 // degrees
  const lonRange = 3.5 // degrees
  
  // Convert to percentage (50 = center)
  const x = 50 + ((longitude - lonCenter) / lonRange) * 35
  const y = 50 - ((latitude - latCenter) / latRange) * 35 // Invert Y since SVG Y increases downward
  
  // Clamp to radar bounds (15-85 to keep it within the visible area)
  return {
    x: Math.max(15, Math.min(85, x)),
    y: Math.max(15, Math.min(85, y)),
  }
}

export function RadarPanel({
  windSpeed,
  visibility,
  temperature,
  selectedAirport = "ABV",
  className,
}: RadarPanelProps) {
  const [blips, setBlips] = useState<RadarBlip[]>([])
  const [sweepAngle, setSweepAngle] = useState(0)
  const [stationPosition, setStationPosition] = useState({ x: 50, y: 50 })

  // Update station position based on selected airport
  useEffect(() => {
    const airport = airports.find((a) => a.code === selectedAirport)
    if (airport) {
      const position = coordinatesToRadar(airport.latitude, airport.longitude)
      setStationPosition(position)
    }
  }, [selectedAirport])

  // Generate dynamic blips based on weather conditions
  useEffect(() => {
    const generateBlips = (): RadarBlip[] => {
      const newBlips: RadarBlip[] = [
        // Central station - positioned based on airport coordinates
        { id: "station", x: stationPosition.x, y: stationPosition.y, type: "station", label: selectedAirport },
      ]

      // Add aircraft blips based on visibility (more visible = more aircraft)
      const aircraftCount = Math.floor(visibility / 5000) + 2
      for (let i = 0; i < Math.min(aircraftCount, 5); i++) {
        const angle = (Math.PI * 2 * i) / aircraftCount + Math.random() * 0.5
        const distance = 20 + Math.random() * 25
        newBlips.push({
          id: `aircraft-${i}`,
          x: 50 + Math.cos(angle) * distance,
          y: 50 + Math.sin(angle) * distance,
          type: "aircraft",
        })
      }

      // Add weather markers based on wind speed
      if (windSpeed > 15) {
        const weatherCount = Math.floor(windSpeed / 10)
        for (let i = 0; i < Math.min(weatherCount, 3); i++) {
          const angle = Math.random() * Math.PI * 2
          const distance = 30 + Math.random() * 15
          newBlips.push({
            id: `weather-${i}`,
            x: 50 + Math.cos(angle) * distance,
            y: 50 + Math.sin(angle) * distance,
            type: "weather",
          })
        }
      }

      return newBlips
    }

    setBlips(generateBlips())
  }, [windSpeed, visibility, selectedAirport, stationPosition])

  // Animate sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 2) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("glass-card rounded-xl p-6 card-glow-cyan", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono font-bold uppercase text-primary tracking-widest">
          Aviation Monitoring
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 pulse-glow" />
          <span className="text-xs font-mono text-green-400">ACTIVE</span>
        </div>
      </div>

      {/* Radar Screen */}
      <div className="relative w-full aspect-square max-w-sm mx-auto">
        {/* Radar background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-primary/30 overflow-hidden">
          {/* Concentric rings */}
          {[1, 2, 3, 4].map((ring) => (
            <div
              key={ring}
              className="absolute rounded-full border border-primary/20"
              style={{
                width: `${ring * 25}%`,
                height: `${ring * 25}%`,
                left: `${50 - (ring * 25) / 2}%`,
                top: `${50 - (ring * 25) / 2}%`,
              }}
            />
          ))}

          {/* Crosshairs */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />

          {/* Diagonal lines */}
          <div
            className="absolute top-1/2 left-1/2 w-full h-px bg-primary/10 origin-left"
            style={{ transform: "rotate(45deg) translateX(-50%)" }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-full h-px bg-primary/10 origin-left"
            style={{ transform: "rotate(-45deg) translateX(-50%)" }}
          />

          {/* Rotating sweep */}
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-full origin-left"
            style={{ transform: `rotate(${sweepAngle}deg)` }}
          >
            <div
              className="absolute top-0 left-0 w-full h-1/2 origin-bottom"
              style={{
                background:
                  "conic-gradient(from -90deg, transparent 0deg, rgba(56, 189, 248, 0.4) 30deg, transparent 60deg)",
                transform: "translateY(-100%)",
              }}
            />
            {/* Sweep line */}
            <div
              className="absolute top-0 left-0 h-1/2 w-0.5 bg-gradient-to-t from-primary to-transparent origin-bottom"
              style={{ transform: "translateY(-100%)" }}
            />
          </div>

          {/* Radar blips */}
          {blips.map((blip) => {
            // Check if blip is in sweep zone for highlight effect
            const blipAngle =
              (Math.atan2(blip.y - 50, blip.x - 50) * 180) / Math.PI + 180
            const inSweep =
              Math.abs(((sweepAngle + 180) % 360) - blipAngle) < 30

            return (
              <div
                key={blip.id}
                className={cn(
                  "absolute transition-all duration-300",
                  inSweep && "scale-125"
                )}
                style={{
                  left: `${blip.x}%`,
                  top: `${blip.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {blip.type === "station" && (
                  <div className="relative">
                    <div className="h-4 w-4 rounded-full bg-primary shadow-lg shadow-primary/50" />
                    <div className="absolute inset-0 h-4 w-4 rounded-full border-2 border-primary/50 radar-ping" />
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary font-bold">
                      {blip.label}
                    </span>
                  </div>
                )}
                {blip.type === "aircraft" && (
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full blip-pulse",
                      inSweep
                        ? "bg-green-400 shadow-lg shadow-green-400/50"
                        : "bg-green-400/60"
                    )}
                  />
                )}
                {blip.type === "weather" && (
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full",
                      inSweep
                        ? "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                        : "bg-yellow-400/40"
                    )}
                  />
                )}
              </div>
            )
          })}

          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border border-primary/40 shadow-lg shadow-primary/20" />
        </div>

        {/* Corner labels */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/60">
          N
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/60">
          S
        </div>
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 text-[10px] font-mono text-primary/60">
          W
        </div>
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-[10px] font-mono text-primary/60">
          E
        </div>
      </div>

      {/* Status info below radar */}
      <div className="mt-4 text-center">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
          Northern Nigeria Aviation Monitoring
        </p>
        <div className="flex justify-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
            <span className="text-muted-foreground">Aircraft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
            <span className="text-muted-foreground">Weather</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
            <span className="text-muted-foreground">Station</span>
          </div>
        </div>
      </div>

      {/* Live data readout */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary/30 p-2 border border-primary/20">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">
            Wind
          </p>
          <p className="text-sm font-mono font-bold text-foreground">
            {windSpeed.toFixed(0)}
            <span className="text-primary/60 text-xs"> km/h</span>
          </p>
        </div>
        <div className="rounded-lg bg-secondary/30 p-2 border border-primary/20">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">
            Vis
          </p>
          <p className="text-sm font-mono font-bold text-foreground">
            {(visibility / 1000).toFixed(1)}
            <span className="text-primary/60 text-xs"> km</span>
          </p>
        </div>
        <div className="rounded-lg bg-secondary/30 p-2 border border-primary/20">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">
            Temp
          </p>
          <p className="text-sm font-mono font-bold text-foreground">
            {temperature.toFixed(0)}
            <span className="text-primary/60 text-xs">°C</span>
          </p>
        </div>
      </div>
    </div>
  )
}
