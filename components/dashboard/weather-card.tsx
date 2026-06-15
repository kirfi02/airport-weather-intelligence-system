"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface WeatherCardProps {
  title: string
  value: string | number
  unit: string
  icon: React.ReactNode
  trend?: "up" | "down" | "stable"
  className?: string
}

export function WeatherCard({
  title,
  value,
  unit,
  icon,
  trend,
  className,
}: WeatherCardProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
    const timer = setTimeout(() => setAnimate(false), 300)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 border border-primary/20",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
            {title}
          </p>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              className={cn(
                "text-5xl font-bold text-foreground transition-transform tracking-tight",
                animate && "value-update"
              )}
            >
              {value}
            </span>
            <span className="text-sm text-primary/60 font-mono">{unit}</span>
          </div>
          {trend && (
            <div className="mt-3 flex items-center gap-2">
              {trend === "up" && (
                <>
                  <svg
                    className="h-4 w-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <span className="text-xs text-red-300 font-mono">RISING</span>
                </>
              )}
              {trend === "down" && (
                <>
                  <svg
                    className="h-4 w-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="text-xs text-green-300 font-mono">FALLING</span>
                </>
              )}
              {trend === "stable" && (
                <>
                  <svg
                    className="h-4 w-4 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                  <span className="text-xs text-cyan-300 font-mono">STABLE</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/15 p-3 text-primary neon-border">{icon}</div>
      </div>
    </div>
  )
}
