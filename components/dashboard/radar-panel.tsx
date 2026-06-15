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
const coordinatesToRadar = (latitude: number, longitude: number): { x: number; y: number } => {
  const latCenter = 10.5
  const lonCenter = 8.5
  const latRange = 3.5
  const lonRange = 3.5
  
  // Convert to SVG coordinates (0-200 scale, center at 100,100)
  const normalizedX = ((longitude - lonCenter) / lonRange) * 70
  const normalizedY = -((latitude - latCenter) / latRange) * 70
  
  return {
    x: 100 + normalizedX,
    y: 100 + normalizedY,
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
  const [stationPosition, setStationPosition] = useState({ x: 100, y: 100 })

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
        const distance = 30 + Math.random() * 35
        newBlips.push({
          id: `aircraft-${i}`,
          x: 100 + Math.cos(angle) * distance,
          y: 100 + Math.sin(angle) * distance,
          type: "aircraft",
        })
      }

      // Add weather markers based on wind speed
      if (windSpeed > 15) {
        const weatherCount = Math.floor(windSpeed / 10)
        for (let i = 0; i < Math.min(weatherCount, 3); i++) {
          const angle = Math.random() * Math.PI * 2
          const distance = 45 + Math.random() * 20
          newBlips.push({
            id: `weather-${i}`,
            x: 100 + Math.cos(angle) * distance,
            y: 100 + Math.sin(angle) * distance,
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
      setSweepAngle((prev) => (prev + 3) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("glass-card rounded-xl p-6 card-glow-cyan border border-primary/20", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/20">
        <h3 className="text-xs font-mono font-bold uppercase text-primary tracking-widest">
          Aviation Monitoring Radar
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 pulse-glow" />
          <span className="text-xs font-mono text-green-300">ACTIVE</span>
        </div>
      </div>

      {/* Radar Screen - SVG based */}
      <div className="relative w-full max-w-sm mx-auto">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-full border-2 border-primary/40"
        >
          {/* Concentric rings */}
          {[1, 2, 3, 4].map((ring) => (
            <circle
              key={`ring-${ring}`}
              cx="100"
              cy="100"
              r={ring * 25}
              fill="none"
              stroke="rgba(56, 189, 248, 0.2)"
              strokeWidth="0.5"
            />
          ))}

          {/* Crosshairs */}
          <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.5" />

          {/* Diagonal lines (45 degrees) */}
          <line x1="100" y1="0" x2="200" y2="100" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5" />
          <line x1="100" y1="200" x2="0" y2="100" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="100" y2="200" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5" />

          {/* Rotating sweep */}
          <g style={{ transform: `rotate(${sweepAngle}deg)`, transformOrigin: "100px 100px", transition: "none" }}>
            <path
              d="M 100,100 L 100,20 A 80,80 0 0,1 156.57,43.43 Z"
              fill="rgba(56, 189, 248, 0.2)"
              stroke="none"
            />
            <line x1="100" y1="100" x2="100" y2="20" stroke="rgba(56, 189, 248, 0.8)" strokeWidth="1" />
          </g>

          {/* Radar blips */}
          {blips.map((blip) => {
            const isStation = blip.type === "station"
            const isAircraft = blip.type === "aircraft"
            const isWeather = blip.type === "weather"

            // Check if blip is in sweep zone for highlight effect
            const blipAngle = (Math.atan2(blip.y - 100, blip.x - 100) * 180) / Math.PI
            const normalizedSweepAngle = (sweepAngle + 180) % 360
            const angleDiff = Math.abs(normalizedSweepAngle - blipAngle)
            const inSweep = angleDiff < 40 || angleDiff > 320

            return (
              <g key={blip.id}>
                {isStation && (
                  <>
                    <circle cx={blip.x} cy={blip.y} r="3" fill="rgba(56, 189, 248, 1)" opacity={inSweep ? 1 : 0.8} />
                    <circle cx={blip.x} cy={blip.y} r="3" fill="none" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1" />
                    {/* Pulsing animation via CSS */}
                    <circle
                      cx={blip.x}
                      cy={blip.y}
                      r="3"
                      fill="none"
                      stroke="rgba(56, 189, 248, 1)"
                      strokeWidth="1"
                      opacity={inSweep ? 1 : 0.3}
                      className="radar-ping"
                    />
                    <text
                      x={blip.x}
                      y={blip.y + 10}
                      textAnchor="middle"
                      className="text-[8px] font-mono font-bold fill-primary"
                      dominantBaseline="middle"
                    >
                      {blip.label}
                    </text>
                  </>
                )}
                {isAircraft && (
                  <circle
                    cx={blip.x}
                    cy={blip.y}
                    r="2"
                    fill={inSweep ? "rgba(34, 197, 94, 1)" : "rgba(34, 197, 94, 0.6)"}
                    className={inSweep ? "blip-pulse" : ""}
                  />
                )}
                {isWeather && (
                  <circle
                    cx={blip.x}
                    cy={blip.y}
                    r="2.5"
                    fill={inSweep ? "rgba(234, 179, 8, 1)" : "rgba(234, 179, 8, 0.4)"}
                  />
                )}
              </g>
            )
          })}

          {/* Outer glow ring */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
        </svg>

        {/* Corner labels */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/60 font-bold">
          N
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/60 font-bold">
          S
        </div>
        <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] font-mono text-primary/60 font-bold">
          W
        </div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] font-mono text-primary/60 font-bold">
          E
        </div>
      </div>

      {/* Status info below radar */}
      <div className="mt-4 text-center">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
          Northern Nigeria Aviation Monitoring
        </p>
        <div className="flex justify-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
            <span className="text-muted-foreground/80">Aircraft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
            <span className="text-muted-foreground/80">Weather</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <span className="text-muted-foreground/80">Station</span>
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
