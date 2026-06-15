export interface CurrentWeather {
  temperature: number
  windSpeed: number
  humidity: number
  visibility: number
  weatherCode: number
  time: string
}

export interface HourlyForecast {
  time: string
  temperature: number
  windSpeed: number
  humidity: number
  visibility: number
  weatherCode: number
}

export interface WeatherData {
  current: CurrentWeather
  hourly: HourlyForecast[]
}

export interface RiskLevel {
  level: "normal" | "restricted" | "high"
  label: string
  description: string
  color: string
}

export interface OperationalScore {
  score: number
  status: "good" | "warning" | "critical"
  label: string
}

export interface AIPrediction {
  predictedTemperature: number
  trend: "rising" | "falling" | "stable"
  confidence: number
  recommendation: string
}

export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  }
  return descriptions[code] || "Unknown"
}

export function calculateRiskLevel(windSpeed: number, visibility: number): RiskLevel {
  if (windSpeed > 30 || visibility < 1000) {
    return {
      level: "high",
      label: "HIGH RISK",
      description: "Delay Advised - Unsafe conditions for operations",
      color: "red",
    }
  }
  if (windSpeed > 20 || visibility < 3000) {
    return {
      level: "restricted",
      label: "RESTRICTED",
      description: "Limited operations - Exercise caution",
      color: "yellow",
    }
  }
  return {
    level: "normal",
    label: "NORMAL",
    description: "All operations cleared - Safe conditions",
    color: "green",
  }
}

export function calculateOperationalScore(
  windSpeed: number,
  visibility: number,
  humidity: number,
  weatherCode: number
): OperationalScore {
  let score = 100

  // Wind penalty (0-40 points)
  if (windSpeed > 30) score -= 40
  else if (windSpeed > 20) score -= 25
  else if (windSpeed > 15) score -= 10

  // Visibility penalty (0-30 points)
  if (visibility < 1000) score -= 30
  else if (visibility < 3000) score -= 20
  else if (visibility < 5000) score -= 10

  // Humidity penalty (0-15 points)
  if (humidity > 90) score -= 15
  else if (humidity > 80) score -= 10
  else if (humidity > 70) score -= 5

  // Weather condition penalty (0-15 points)
  if (weatherCode >= 95) score -= 15 // Thunderstorm
  else if (weatherCode >= 61) score -= 10 // Rain
  else if (weatherCode >= 45) score -= 8 // Fog

  score = Math.max(0, Math.min(100, score))

  if (score >= 80) {
    return { score, status: "good", label: "Good" }
  }
  if (score >= 50) {
    return { score, status: "warning", label: "Warning" }
  }
  return { score, status: "critical", label: "Critical" }
}

export function generateAIPrediction(hourlyData: HourlyForecast[]): AIPrediction {
  if (hourlyData.length < 3) {
    return {
      predictedTemperature: hourlyData[0]?.temperature || 0,
      trend: "stable",
      confidence: 50,
      recommendation: "Insufficient data for prediction",
    }
  }

  // Simple moving average prediction
  const recentTemps = hourlyData.slice(0, 6).map((h) => h.temperature)
  const avg = recentTemps.reduce((a, b) => a + b, 0) / recentTemps.length
  
  // Calculate trend
  const firstHalf = recentTemps.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  const secondHalf = recentTemps.slice(3, 6).reduce((a, b) => a + b, 0) / 3
  const diff = secondHalf - firstHalf

  let trend: "rising" | "falling" | "stable" = "stable"
  if (diff > 1) trend = "rising"
  else if (diff < -1) trend = "falling"

  // Predicted temperature (simple linear projection)
  const predictedTemperature = Math.round((avg + diff) * 10) / 10

  // Confidence based on variance
  const variance = recentTemps.reduce((acc, t) => acc + Math.pow(t - avg, 2), 0) / recentTemps.length
  const confidence = Math.max(60, Math.min(95, 95 - variance * 2))

  // Generate recommendation
  let recommendation = ""
  const avgWindSpeed = hourlyData.slice(0, 6).reduce((a, h) => a + h.windSpeed, 0) / 6

  if (avgWindSpeed > 25) {
    recommendation = "Wind conditions expected to impact operations. Consider scheduling adjustments."
  } else if (trend === "rising" && predictedTemperature > 35) {
    recommendation = "Rising temperatures may affect aircraft performance. Monitor closely."
  } else if (trend === "falling" && predictedTemperature < 20) {
    recommendation = "Cooling trend detected. Standard operations expected to continue."
  } else {
    recommendation = "Stable conditions forecast. Operations can proceed as planned."
  }

  return {
    predictedTemperature,
    trend,
    confidence: Math.round(confidence),
    recommendation,
  }
}
