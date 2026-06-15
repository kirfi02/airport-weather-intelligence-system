"use client"

import { cn } from "@/lib/utils"
import type { AIPrediction as AIPredictionType } from "@/lib/weather-types"

interface AIPredictionProps {
  prediction: AIPredictionType
  className?: string
}

export function AIPrediction({ prediction, className }: AIPredictionProps) {
  const trendIcon = {
    rising: (
      <svg
        className="h-5 w-5 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    falling: (
      <svg
        className="h-5 w-5 text-green-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
        />
      </svg>
    ),
    stable: (
      <svg
        className="h-5 w-5 text-cyan-400"
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
    ),
  }

  return (
    <div
      className={cn(
        "glass-card-accent rounded-xl p-6 transition-all duration-300 card-glow-cyan border border-primary/30",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2 neon-border">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
              AI Decision Support
            </h3>
            <p className="text-xs text-primary/60 font-mono">
              ML-Powered Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 pulse-glow" />
          <span className="text-[10px] font-mono text-blue-300 uppercase">Active</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Predicted Temperature
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">
                {prediction.predictedTemperature}
              </span>
              <span className="text-muted-foreground">°C</span>
              {trendIcon[prediction.trend]}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Trend</p>
            <p
              className={cn(
                "text-sm font-medium capitalize",
                prediction.trend === "rising" && "text-red-400",
                prediction.trend === "falling" && "text-green-400",
                prediction.trend === "stable" && "text-cyan-400"
              )}
            >
              {prediction.trend}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Prediction Confidence
            </p>
            <span className="text-sm font-medium text-primary">
              {prediction.confidence}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
              style={{ width: `${prediction.confidence}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            AI Recommendation
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {prediction.recommendation}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-green-400/80">
            <div className="h-2 w-2 rounded-full bg-green-400 pulse-glow" />
            <span>Model: Weather-LSTM v2.1</span>
          </div>
          <span className="text-muted-foreground/60">Updated: Real-time</span>
        </div>
      </div>
    </div>
  )
}
