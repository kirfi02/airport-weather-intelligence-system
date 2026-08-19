"use client"

import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/weather-types"

interface RiskPanelProps {
  risk: RiskLevel
  className?: string
}

export function RiskPanel({ risk, className }: RiskPanelProps) {
  const statusClass = {
    normal: "status-normal",
    restricted: "status-warning",
    high: "status-critical",
  }[risk.level]

  const iconColor = {
    normal: "text-green-400",
    restricted: "text-yellow-400",
    high: "text-red-400",
  }[risk.level]

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300 border",
        risk.level === "normal" && "border-green-500/30",
        risk.level === "restricted" && "border-yellow-500/30",
        risk.level === "high" && "border-red-500/30",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
          ALERT STATUS
        </h3>
        <div className={cn("h-3 w-3 rounded-full pulse-glow", iconColor)} />
      </div>

      <div
        className={cn(
          "rounded-lg border-2 p-6 text-center transition-all duration-500",
          statusClass
        )}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          {risk.level === "normal" && (
            <svg
              className="h-8 w-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {risk.level === "restricted" && (
            <svg
              className="h-8 w-8 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {risk.level === "high" && (
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div className="text-3xl font-bold tracking-widest mb-2 font-mono">
          {risk.level === "normal" && "NORMAL OPERATIONS"}
          {risk.level === "restricted" && "RESTRICTED OPERATIONS"}
          {risk.level === "high" && "HIGH RISK – DELAY ADVISED"}
        </div>
        <p className="text-sm leading-relaxed opacity-90 font-mono">{risk.description}</p>
      </div>
    </div>
  )
}
