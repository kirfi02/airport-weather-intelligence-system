"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Header } from "@/components/dashboard/header"
import { WeatherCard } from "@/components/dashboard/weather-card"
import { WeatherCharts } from "@/components/dashboard/weather-charts"
import { ForecastTable } from "@/components/dashboard/forecast-table"
import { RiskPanel } from "@/components/dashboard/risk-panel"
import { OperationalScore } from "@/components/dashboard/operational-score"
import { AIPrediction } from "@/components/dashboard/ai-prediction"
import { RadarPanel } from "@/components/dashboard/radar-panel"
import { LoadingScreen } from "@/components/dashboard/loading-screen"
import { useSoundAlerts } from "@/hooks/use-sound-alerts"
import { airports, type Airport } from "@/lib/airports"
import { fetchWeatherData } from "@/lib/weather-api"
import {
  type WeatherData,
  type RiskLevel,
  type OperationalScore as OperationalScoreType,
  type AIPrediction as AIPredictionType,
  calculateRiskLevel,
  calculateOperationalScore,
  generateAIPrediction,
  getWeatherDescription,
} from "@/lib/weather-types"

// Demo mode airport cycle order
const DEMO_AIRPORTS = ["KAN", "ABV", "JOS", "BCU"]
const DEMO_INTERVAL = 8000 // 8 seconds per airport

export default function Dashboard() {
  const [selectedAirport, setSelectedAirport] = useState<Airport>(airports[0])
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Loading screen state
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(false)
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const demoIndexRef = useRef(0)
  
  // Sound alerts
  const { soundEnabled, toggleSound, checkRiskChange, initializeAudio } = useSoundAlerts()

  const loadWeatherData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchWeatherData(
        selectedAirport.latitude,
        selectedAirport.longitude
      )
      setWeatherData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
    } finally {
      setIsLoading(false)
    }
  }, [selectedAirport])

  useEffect(() => {
    if (isInitialized) {
      loadWeatherData()
    }
  }, [loadWeatherData, isInitialized])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!isInitialized) return
    const interval = setInterval(loadWeatherData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadWeatherData, isInitialized])

  // Calculate derived values
  const riskLevel: RiskLevel = weatherData
    ? calculateRiskLevel(
        weatherData.current.windSpeed,
        weatherData.current.visibility
      )
    : { level: "normal", label: "LOADING", description: "Loading...", color: "green" }

  const operationalScore: OperationalScoreType = weatherData
    ? calculateOperationalScore(
        weatherData.current.windSpeed,
        weatherData.current.visibility,
        weatherData.current.humidity,
        weatherData.current.weatherCode
      )
    : { score: 0, status: "warning", label: "Loading" }

  const aiPrediction: AIPredictionType = weatherData
    ? generateAIPrediction(weatherData.hourly)
    : {
        predictedTemperature: 0,
        trend: "stable",
        confidence: 0,
        recommendation: "Loading weather data...",
      }

  // Check for risk changes and trigger sound
  useEffect(() => {
    if (weatherData) {
      checkRiskChange(riskLevel.level)
    }
  }, [riskLevel.level, weatherData, checkRiskChange])

  // Demo mode logic
  const startDemoMode = useCallback(() => {
    initializeAudio() // Enable audio context on user interaction
    setIsDemoMode(true)
    demoIndexRef.current = 0
    
    // Start cycling through airports
    const cycleAirport = () => {
      const airportCode = DEMO_AIRPORTS[demoIndexRef.current]
      const airport = airports.find(a => a.code === airportCode)
      if (airport) {
        setSelectedAirport(airport)
      }
      demoIndexRef.current = (demoIndexRef.current + 1) % DEMO_AIRPORTS.length
    }
    
    // Initial airport
    cycleAirport()
    
    // Set interval for cycling
    demoIntervalRef.current = setInterval(cycleAirport, DEMO_INTERVAL)
  }, [initializeAudio])

  const stopDemoMode = useCallback(() => {
    setIsDemoMode(false)
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
  }, [])

  // Cleanup demo mode on unmount
  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current)
      }
    }
  }, [])

  // Determine temperature trend
  const getTempTrend = (): "up" | "down" | "stable" => {
    if (!weatherData || weatherData.hourly.length < 2) return "stable"
    const current = weatherData.current.temperature
    const nextHour = weatherData.hourly[1]?.temperature ?? current
    if (nextHour > current + 0.5) return "up"
    if (nextHour < current - 0.5) return "down"
    return "stable"
  }

  // Handle loading screen completion
  const handleLoadingComplete = useCallback(() => {
    setShowLoadingScreen(false)
    setIsInitialized(true)
  }, [])

  // Show loading screen
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Control Bar - Demo Mode & Sound Toggle */}
        <div className="flex items-center justify-end gap-3">
          {/* Demo Mode Indicator */}
          {isDemoMode && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 demo-pulse">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono text-red-300 uppercase tracking-wider">
                Demo Mode Active
              </span>
            </div>
          )}

          {/* Demo Mode Button */}
          <button
            onClick={isDemoMode ? stopDemoMode : startDemoMode}
            className={`px-4 py-2 rounded-lg text-sm font-mono transition-all duration-300 btn-aviation ${
              isDemoMode
                ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300"
                : "bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary"
            }`}
          >
            {isDemoMode ? "Stop Demo Mode" : "Start Demo Mode"}
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded-lg text-sm font-mono transition-all duration-300 sound-toggle flex items-center gap-2 ${
              soundEnabled ? "active" : "inactive"
            }`}
          >
            {soundEnabled ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
            Sound: {soundEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {/* Header */}
        <Header
          selectedAirport={selectedAirport}
          onAirportChange={setSelectedAirport}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
        />

        {/* Error State */}
        {error && (
          <div className="glass-card rounded-xl p-6 border-red-500/50 bg-red-500/10 card-glow-red">
            <div className="flex items-center gap-3 text-red-400">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium">Error Loading Weather Data</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
              <button
                onClick={loadWeatherData}
                className="ml-auto px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-sm btn-aviation"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* METRIC CARDS ROW */}
        <div className={`grid gap-4 grid-cols-2 lg:grid-cols-5 ${isDemoMode ? "slide-fade" : ""}`}>
          <WeatherCard
            title="Temperature"
            value={weatherData?.current.temperature ?? "--"}
            unit="°C"
            trend={getTempTrend()}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <WeatherCard
            title="Wind Speed"
            value={weatherData?.current.windSpeed ?? "--"}
            unit="km/h"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            }
          />
          <WeatherCard
            title="Humidity"
            value={weatherData?.current.humidity ?? "--"}
            unit="%"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            }
          />
          <WeatherCard
            title="Visibility"
            value={
              weatherData
                ? (weatherData.current.visibility / 1000).toFixed(1)
                : "--"
            }
            unit="km"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            }
          />
          <div className="hidden lg:block">
            <OperationalScore score={operationalScore} />
          </div>
        </div>

        {/* Mobile Operational Score */}
        <div className="lg:hidden">
          <OperationalScore score={operationalScore} />
        </div>

        {/* CENTRAL MONITORING PANEL WITH RADAR */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Radar System */}
          {weatherData && (
            <div className="lg:col-span-1">
              <RadarPanel
                windSpeed={weatherData.current.windSpeed}
                visibility={weatherData.current.visibility}
                temperature={weatherData.current.temperature}
                selectedAirport={selectedAirport.code}
              />
            </div>
          )}

          {/* Charts Section */}
          <div className="lg:col-span-2">
            {weatherData && <WeatherCharts forecasts={weatherData.hourly} />}
          </div>
        </div>

        {/* BOTTOM PANELS: ALERTS AND AI PREDICTIONS */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Risk/Alert Panel (Left) */}
          <RiskPanel risk={riskLevel} />

          {/* AI Prediction Panel (Center) */}
          <AIPrediction prediction={aiPrediction} />

          {/* Current Weather Description (Right) */}
          {weatherData && (
            <div className="glass-card-accent rounded-xl p-6 flex flex-col justify-center card-glow-cyan">
              <p className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider mb-2">
                Current Conditions
              </p>
              <p className="text-2xl font-bold text-foreground mb-3">
                {getWeatherDescription(weatherData.current.weatherCode)}
              </p>
              <div className="flex items-center gap-2 text-sm text-primary/80">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span className="font-mono">
                  {selectedAirport.code} - {selectedAirport.city}
                </span>
              </div>
              {/* Mini stats */}
              <div className="mt-4 pt-4 border-t border-primary/20 grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Pressure:</span>
                  <span className="ml-2 text-foreground">1013 hPa</span>
                </div>
                <div>
                  <span className="text-muted-foreground">UV Index:</span>
                  <span className="ml-2 text-foreground">Moderate</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FORECAST TABLE */}
        {weatherData && (
          <div>
            <h2 className="text-sm font-mono font-bold uppercase text-primary mb-4 tracking-wider">
              Hourly Forecast
            </h2>
            <ForecastTable forecasts={weatherData.hourly} />
          </div>
        )}

        {/* FOOTER - SYSTEM STATUS */}
        <footer className="glass-card rounded-xl p-4 border-t border-primary/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 pulse-glow" />
                <span className="text-green-300">SYSTEM ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-400 pulse-glow" />
                <span className="text-blue-300">API CONNECTED</span>
              </div>
              {isDemoMode && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-red-300">DEMO ACTIVE</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-center flex-1">
              Airport Weather Intelligence System | Northern Nigeria Aviation
            </p>
            <div className="text-right text-muted-foreground">
              <div>Final Year Project - Intelligent Decision Support</div>
              <div className="text-primary/60 text-xs" suppressHydrationWarning>
                {lastUpdated ? lastUpdated.toLocaleString() : "Initializing..."}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
