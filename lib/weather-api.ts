import type { WeatherData, HourlyForecast, CurrentWeather } from "./weather-types"

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

interface OpenMeteoResponse {
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    weather_code: number[]
    wind_speed_10m: number[]
    visibility: number[]
  }
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    hourly: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility",
    timezone: "auto",
    forecast_days: "2",
  })

  const response = await fetch(`${OPEN_METEO_URL}?${params}`)
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }

  const data: OpenMeteoResponse = await response.json()

  // Get current visibility from hourly data (closest to current time)
  const currentTime = new Date(data.current.time)
  const currentHourIndex = data.hourly.time.findIndex((t) => {
    const hourTime = new Date(t)
    return hourTime >= currentTime
  })
  const currentVisibility = data.hourly.visibility[Math.max(0, currentHourIndex)] || 10000

  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m * 10) / 10,
    windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
    humidity: Math.round(data.current.relative_humidity_2m),
    visibility: Math.round(currentVisibility),
    weatherCode: data.current.weather_code,
    time: data.current.time,
  }

  // Get next 24 hours of forecast
  const now = new Date()
  const hourly: HourlyForecast[] = data.hourly.time
    .map((time, index) => ({
      time,
      temperature: Math.round(data.hourly.temperature_2m[index] * 10) / 10,
      windSpeed: Math.round(data.hourly.wind_speed_10m[index] * 10) / 10,
      humidity: Math.round(data.hourly.relative_humidity_2m[index]),
      visibility: Math.round(data.hourly.visibility[index]),
      weatherCode: data.hourly.weather_code[index],
    }))
    .filter((forecast) => new Date(forecast.time) >= now)
    .slice(0, 24)

  return { current, hourly }
}
