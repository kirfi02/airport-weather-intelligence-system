import type { WeatherData, HourlyForecast } from "./weather-types"

const FORECAST_HOURS = 24

const round = (value: number, decimals = 1) => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

const getWeatherCode = (hour: number, airportSeed: number) => {
  const cycle = (hour + airportSeed) % 24
  if (cycle >= 4 && cycle <= 6) return 45
  if (cycle >= 15 && cycle <= 17) return 61
  if (cycle === 22) return 80
  if (cycle % 7 === 0) return 2
  return cycle % 3 === 0 ? 1 : 0
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  refreshSeed = 0
): Promise<WeatherData> {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  const airportSeed = Math.abs(Math.round(latitude * 10 + longitude * 10))
  const temperatureBase = 25 + (latitude - 9) * 0.7 + (longitude - 7) * 0.25
  const windBase = 9 + (airportSeed % 7)
  const refreshVariation = Math.sin(refreshSeed * 12.9898 + airportSeed) * 0.8

  const hourly: HourlyForecast[] = Array.from({ length: FORECAST_HOURS }, (_, index) => {
    const time = new Date(now.getTime() + index * 60 * 60 * 1000)
    const hour = time.getUTCHours()
    const daylight = Math.sin(((hour - 6) / 24) * Math.PI * 2)
    const weatherCode = getWeatherCode(hour, airportSeed)
    const rainOrFog = weatherCode >= 45

    return {
      time: time.toISOString(),
      temperature: round(temperatureBase + daylight * 5 + Math.sin((index + airportSeed) / 8) + refreshVariation),
      windSpeed: round(Math.max(3, windBase + Math.sin((index + airportSeed) / 4) * 4 + refreshVariation)),
      humidity: Math.round(Math.min(96, Math.max(42, 68 - daylight * 12 + (rainOrFog ? 12 : 0)))),
      visibility: Math.round(rainOrFog ? 4500 + Math.abs(Math.sin(index)) * 2500 : 9000 + Math.abs(Math.cos(index)) * 5000),
      weatherCode,
    }
  })

  return { current: hourly[0], hourly }
}
