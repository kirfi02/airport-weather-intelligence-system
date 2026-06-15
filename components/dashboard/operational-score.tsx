"use client"

import { cn } from "@/lib/utils"
import type { OperationalScore as OperationalScoreType } from "@/lib/weather-types"

interface OperationalScoreProps {
  score: OperationalScoreType
  className?: string
}

export function OperationalScore({ score, className }: OperationalScoreProps) {
  const getColor = () => {
    if (score.status === "good") return "text-green-400"
    if (score.status === "warning") return "text-yellow-400"
    return "text-red-400"
  }

  const getStrokeColor = () => {
    if (score.status === "good") return "stroke-green-400"
    if (score.status === "warning") return "stroke-yellow-400"
    return "stroke-red-400"
  }

  const getTrackColor = () => {
    if (score.status === "good") return "stroke-green-400/20"
    if (score.status === "warning") return "stroke-yellow-400/20"
    return "stroke-red-400/20"
  }

  // Calculate stroke dashoffset for circular progress
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score.score / 100) * circumference

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Operational Score
      </h3>

      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              className={getTrackColor()}
            />
            {/* Progress arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn(getStrokeColor(), "transition-all duration-1000")}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold", getColor())}>
              {score.score}%
            </span>
            <span className={cn("text-sm font-medium", getColor())}>
              {score.label}
            </span>
          </div>
        </div>

        <div className="mt-4 w-full">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Critical</span>
            <span>Warning</span>
            <span>Good</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30" />
          <div
            className="h-0.5 bg-white/50 mt-1 transition-all duration-500"
            style={{ marginLeft: `${score.score}%`, width: "2px" }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-muted-foreground">Below 50%</div>
            <div className="text-red-400 font-medium">Critical</div>
          </div>
          <div>
            <div className="text-muted-foreground">50-79%</div>
            <div className="text-yellow-400 font-medium">Warning</div>
          </div>
          <div>
            <div className="text-muted-foreground">80-100%</div>
            <div className="text-green-400 font-medium">Good</div>
          </div>
        </div>
      </div>
    </div>
  )
}
