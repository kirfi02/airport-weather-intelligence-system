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

export interface RiskThresholds {
  highWind: number
  restrictedWind: number
  highVisibility: number
  restrictedVisibility: number
}

export const DEFAULT_RISK_THRESHOLDS: RiskThresholds = {
  highWind: 30,
  restrictedWind: 20,
  highVisibility: 1000,
  restrictedVisibility: 3000,
}

export function calculateRiskLevel(
  windSpeed: number,
  visibility: number,
  thresholds: RiskThresholds = DEFAULT_RISK_THRESHOLDS
): RiskLevel {
  if (windSpeed > thresholds.highWind || visibility < thresholds.highVisibility) {
    return {
      level: "high",
      label: "HIGH RISK",
      description: "Delay Advised - Unsafe conditions for operations",
      color: "red",
    }
  }
  if (
    windSpeed > thresholds.restrictedWind ||
    visibility < thresholds.restrictedVisibility
  ) {
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

export function calculateForecastRiskLevel(
  hourlyData: HourlyForecast[],
  thresholds: RiskThresholds = DEFAULT_RISK_THRESHOLDS
): RiskLevel {
  const forecastWindow = hourlyData.slice(0, 7)
  if (forecastWindow.length === 0) {
    return {
      level: "normal",
      label: "LOADING",
      description: "Forecast data is loading",
      color: "green",
    }
  }

  const worstWind = Math.max(...forecastWindow.map((forecast) => forecast.windSpeed))
  const lowestVisibility = Math.min(...forecastWindow.map((forecast) => forecast.visibility))
  const highestHumidity = Math.max(...forecastWindow.map((forecast) => forecast.humidity))
  const includesRainOrSnow = forecastWindow.some((forecast) => forecast.weatherCode >= 61)
  const includesThunderstorm = forecastWindow.some((forecast) => forecast.weatherCode >= 95)
  const risk = calculateRiskLevel(worstWind, lowestVisibility, thresholds)

  if (includesThunderstorm || risk.level === "high") {
    return {
      level: "high",
      label: "HIGH RISK",
      description: "High operational risk expected within the next six hours - Delay advised",
      color: "red",
    }
  }

  if (risk.level === "restricted" || includesRainOrSnow || highestHumidity > 85) {
    return {
      level: "restricted",
      label: "RESTRICTED",
      description: "Weather-related operational caution expected within the next six hours",
      color: "yellow",
    }
  }

  return {
    level: "normal",
    label: "NORMAL",
    description: "No significant operational restrictions expected within the next six hours",
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

  if (windSpeed > 30) score -= 40
  else if (windSpeed > 20) score -= 25
  else if (windSpeed > 15) score -= 10

  if (visibility < 1000) score -= 30
  else if (visibility < 3000) score -= 20
  else if (visibility < 5000) score -= 10

  if (humidity > 90) score -= 15
  else if (humidity > 80) score -= 10
  else if (humidity > 70) score -= 5

  if (weatherCode >= 95) score -= 15
  else if (weatherCode >= 61) score -= 10
  else if (weatherCode >= 45) score -= 8

  score = Math.max(0, Math.min(100, score))

  if (score >= 80) {
    return { score, status: "good", label: "Good" }
  }
  if (score >= 50) {
    return { score, status: "warning", label: "Warning" }
  }
  return { score, status: "critical", label: "Critical" }
}

export function calculateForecastOperationalScore(
  hourlyData: HourlyForecast[]
): OperationalScore {
  const forecastWindow = hourlyData.slice(0, 7)
  if (forecastWindow.length === 0) {
    return { score: 0, status: "warning", label: "Loading" }
  }

  const averageWind =
    forecastWindow.reduce((sum, forecast) => sum + forecast.windSpeed, 0) /
    forecastWindow.length
  const lowestVisibility = Math.min(...forecastWindow.map((forecast) => forecast.visibility))
  const highestHumidity = Math.max(...forecastWindow.map((forecast) => forecast.humidity))
  const highestWeatherCode = Math.max(...forecastWindow.map((forecast) => forecast.weatherCode))

  return calculateOperationalScore(
    averageWind,
    lowestVisibility,
    highestHumidity,
    highestWeatherCode
  )
}

export function generateAIPrediction(hourlyData: HourlyForecast[]): AIPrediction {
  if (hourlyData.length < 4) {
    return {
      predictedTemperature: hourlyData[0]?.temperature || 0,
      trend: "stable",
      confidence: 50,
      recommendation: "Insufficient data for prediction",
    }
  }

  const forecastWindow = hourlyData.slice(0, 7)
  const temperatures = forecastWindow.map((forecast) => forecast.temperature)
  const meanX = (temperatures.length - 1) / 2
  const meanY = temperatures.reduce((sum, temperature) => sum + temperature, 0) / temperatures.length
  const slopeNumerator = temperatures.reduce(
    (sum, temperature, index) => sum + (index - meanX) * (temperature - meanY),
    0
  )
  const slopeDenominator = temperatures.reduce(
    (sum, _, index) => sum + (index - meanX) ** 2,
    0
  )
  const slope = slopeDenominator === 0 ? 0 : slopeNumerator / slopeDenominator
  const predictedTemperature = Math.round((temperatures[temperatures.length - 1] + slope) * 10) / 10

  let trend: "rising" | "falling" | "stable" = "stable"
  if (slope > 0.35) trend = "rising"
  else if (slope < -0.35) trend = "falling"

  const residualVariance = temperatures.reduce(
    (sum, temperature, index) => {
      const fittedTemperature = meanY + slope * (index - meanX)
      return sum + (temperature - fittedTemperature) ** 2
    },
    0
  ) / temperatures.length
  const maxWind = Math.max(...forecastWindow.map((forecast) => forecast.windSpeed))
  const minVisibility = Math.min(...forecastWindow.map((forecast) => forecast.visibility))
  const maxHumidity = Math.max(...forecastWindow.map((forecast) => forecast.humidity))
  const severeWeather = forecastWindow.some((forecast) => forecast.weatherCode >= 61)
  const confidencePenalty = residualVariance * 4 + (severeWeather ? 8 : 0)
  const confidence = Math.round(Math.max(55, Math.min(96, 94 - confidencePenalty)))

  let recommendation = "Forecast conditions remain suitable for planned operations."
  if (severeWeather || minVisibility < 3000 || maxWind > 30) {
    recommendation = "Forecast risk is expected within the next six hours. Review delays, runway usage, and crew briefings."
  } else if (maxWind > 20 || minVisibility < 5000 || maxHumidity > 85) {
    recommendation = "Marginal conditions may affect the next six hours. Monitor the next forecast update and prepare adjustments."
  } else if (trend === "rising" && predictedTemperature > 35) {
    recommendation = "A warming trend may affect aircraft performance. Monitor loading and departure conditions."
  } else if (trend === "falling" && predictedTemperature < 20) {
    recommendation = "A cooling trend is developing. Continue standard operations with increased observation."
  } else {
    recommendation = "Conditions are stable across the forecast window. Operations can proceed as planned."
  }

  return {
    predictedTemperature,
    trend,
    confidence: Math.round(confidence),
    recommendation,
  }
}
