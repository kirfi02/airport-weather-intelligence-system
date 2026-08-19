"use client"

import { cn } from "@/lib/utils"

interface RunwayConfig {
  name: string
  heading: number
}

interface RunwayAnalysis {
  runway: RunwayConfig
  headwind: number
  crosswind: number
  isOptimal: boolean
}

interface RunwayAnalysisProps {
  windSpeed: number
  windDirection: number
  className?: string
}

const RUNWAY_CONFIGS: RunwayConfig[] = [
  { name: "01/19", heading: 10 },
  { name: "03/21", heading: 30 },
  { name: "06/24", heading: 60 },
]

export function RunwayAnalysis({
  windSpeed,
  windDirection,
  className,
}: RunwayAnalysisProps) {
  const analyzeRunway = (runway: RunwayConfig): RunwayAnalysis => {
    const headingDiff = ((windDirection - runway.heading + 180) % 360) - 180

    const headwind = windSpeed * Math.cos((headingDiff * Math.PI) / 180)

    const crosswind = Math.abs(windSpeed * Math.sin((headingDiff * Math.PI) / 180))

    const isOptimal = headwind > 0 && crosswind < 10

    return {
      runway,
      headwind: Math.round(headwind * 10) / 10,
      crosswind: Math.round(crosswind * 10) / 10,
      isOptimal,
    }
  }

  const analyses = RUNWAY_CONFIGS.map(analyzeRunway)
  const optimalRunway = analyses.find((a) => a.isOptimal)

  const getWindDirectionName = (angle: number): string => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    const index = Math.round((angle / 360) * directions.length) % directions.length
    return directions[index]
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="glass-card rounded-xl p-6 border border-primary/30">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/20">
          <h3 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
            Runway Wind Analysis
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {windDirection}°
            </p>
            <p className="text-xs font-mono text-primary/60">
              {getWindDirectionName(windDirection)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(56, 189, 248, 0.2)"
                strokeWidth="1"
              />

              <text
                x="50"
                y="10"
                textAnchor="middle"
                className="text-xs font-mono fill-primary/60"
              >
                N
              </text>
              <text
                x="90"
                y="53"
                textAnchor="middle"
                className="text-xs font-mono fill-primary/60"
              >
                E
              </text>
              <text
                x="50"
                y="95"
                textAnchor="middle"
                className="text-xs font-mono fill-primary/60"
              >
                S
              </text>
              <text
                x="10"
                y="53"
                textAnchor="middle"
                className="text-xs font-mono fill-primary/60"
              >
                W
              </text>

              <g transform={`rotate(${windDirection} 50 50)`}>
                <line
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="15"
                  stroke="rgba(56, 189, 248, 0.8)"
                  strokeWidth="2"
                />
                <polygon
                  points="50,10 48,18 52,18"
                  fill="rgba(56, 189, 248, 0.8)"
                />
              </g>

              <circle cx="50" cy="50" r="3" fill="rgba(56, 189, 248, 0.6)" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Wind Speed
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{windSpeed}</p>
            <p className="text-xs text-primary/60 font-mono">km/h</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Direction
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {getWindDirectionName(windDirection)}
            </p>
            <p className="text-xs text-primary/60 font-mono">{windDirection}°</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border border-primary/30">
        <div className="mb-4 pb-3 border-b border-primary/20">
          <h4 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
            Runway Performance
          </h4>
        </div>

        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.runway.name}
              className={cn(
                "p-4 rounded-lg border transition-all duration-300",
                analysis.isOptimal
                  ? "bg-green-500/10 border-green-500/40 ring-1 ring-green-500/30"
                  : "bg-muted/20 border-muted/40"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-mono font-bold text-foreground">
                    RWY {analysis.runway.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    ({analysis.runway.heading}°)
                  </p>
                </div>
                {analysis.isOptimal && (
                  <span className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-xs font-mono font-bold text-green-300 uppercase">
                    ✓ Optimal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="text-muted-foreground uppercase tracking-widest">
                    Headwind
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold mt-1",
                      analysis.headwind > 0
                        ? "text-green-300"
                        : analysis.headwind < -10
                          ? "text-red-300"
                          : "text-yellow-300"
                    )}
                  >
                    {analysis.headwind > 0 ? "+" : ""}
                    {analysis.headwind} km/h
                  </p>
                  {analysis.headwind > 0 ? (
                    <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                      Favorable
                    </p>
                  ) : (
                    <p className="text-red-300/60 text-[10px] mt-0.5">
                      Tailwind Risk
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground uppercase tracking-widest">
                    Crosswind
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold mt-1",
                      analysis.crosswind < 10
                        ? "text-green-300"
                        : analysis.crosswind < 15
                          ? "text-yellow-300"
                          : "text-red-300"
                    )}
                  >
                    {analysis.crosswind} km/h
                  </p>
                  {analysis.crosswind < 10 ? (
                    <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                      Acceptable
                    </p>
                  ) : (
                    <p className="text-yellow-300/60 text-[10px] mt-0.5">
                      Marginal
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    analysis.isOptimal
                      ? "bg-green-400 w-full"
                      : analysis.headwind > 0 && analysis.crosswind < 15
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  )}
                  style={{
                    width: `${Math.min(100, (analysis.headwind / windSpeed) * 100 + 50)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-primary/20">
          {optimalRunway ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-xs font-mono text-green-300 font-bold uppercase tracking-wider">
                Recommended Runway
              </p>
              <p className="text-lg font-bold text-green-400 mt-1">
                RWY {optimalRunway.runway.name}
              </p>
              <p className="text-xs text-green-300/70 mt-1">
                Headwind: +{optimalRunway.headwind} km/h | Crosswind: {optimalRunway.crosswind}{" "}
                km/h
              </p>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs font-mono text-yellow-300 font-bold uppercase tracking-wider">
                Caution
              </p>
              <p className="text-sm text-yellow-300 mt-1">
                No runway with optimal conditions. Check all runways carefully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
