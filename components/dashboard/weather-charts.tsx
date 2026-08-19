"use client"

import { cn } from "@/lib/utils"
import type { HourlyForecast } from "@/lib/weather-types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface WeatherChartsProps {
  forecasts: HourlyForecast[]
  className?: string
}

export function WeatherCharts({ forecasts, className }: WeatherChartsProps) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      hour12: true,
    })
  }

  const chartData = forecasts.slice(0, 12).map((forecast) => ({
    time: formatTime(forecast.time),
    temperature: forecast.temperature,
    windSpeed: forecast.windSpeed,
    humidity: forecast.humidity,
  }))

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number; name: string; color: string }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-3 text-sm">
          <p className="text-muted-foreground mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === "Temperature" ? "°C" : " km/h"}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
      <div className="glass-card rounded-xl p-6 border border-cyan-500/30">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
          <div>
            <h3 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
              Temperature Trend
            </h3>
            <p className="text-xs text-muted-foreground font-mono">Next 12 Hours</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
            <span className="text-xs text-cyan-300 font-mono">°C</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                domain={["auto", "auto"]}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#tempGradient)"
                name="Temperature"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#22d3ee",
                  stroke: "#0f172a",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-yellow-500/20">
          <div>
            <h3 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
              Wind Speed Trend
            </h3>
            <p className="text-xs text-muted-foreground font-mono">Next 12 Hours</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
            <span className="text-xs text-yellow-300 font-mono">km/h</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                domain={[0, "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#34d399"
                strokeWidth={2}
                name="Wind Speed"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#34d399",
                  stroke: "#0f172a",
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey={() => 20}
                stroke="#eab308"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Caution"
              />
              <Line
                type="monotone"
                dataKey={() => 30}
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="High Risk"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-yellow-500" style={{ borderStyle: "dashed" }} />
            <span className="text-yellow-300/80">CAUTION @ 20 km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-red-500" style={{ borderStyle: "dashed" }} />
            <span className="text-red-300/80">HIGH RISK @ 30 km/h</span>
          </div>
        </div>
      </div>
    </div>
  )
}
