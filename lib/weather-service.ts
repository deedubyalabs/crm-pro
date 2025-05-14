import { supabase, handleSupabaseError } from "./supabase"
import type { WeatherData, NewWeatherData } from "@/types/scheduler"

export const weatherService = {
  async getWeatherData(locationId: string, startDate: Date, endDate: Date): Promise<WeatherData[]> {
    try {
      const { data, error } = await supabase
        .from("weather_data")
        .select("*")
        .eq("location_id", locationId)
        .gte("forecast_date", startDate.toISOString().split("T")[0])
        .lte("forecast_date", endDate.toISOString().split("T")[0])
        .order("forecast_date")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async saveWeatherData(weatherData: NewWeatherData[]): Promise<WeatherData[]> {
    try {
      const { data, error } = await supabase.from("weather_data").upsert(weatherData).select()

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getWeatherForecast(
    location: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      date: string
      temperature: number
      condition: string
      precipitation: number
      windSpeed: number
    }[]
  > {
    try {
      // First check if we have the data in our database
      const locationId = this.normalizeLocationId(location)
      const storedData = await this.getWeatherData(locationId, startDate, endDate)

      if (storedData.length > 0) {
        // Convert stored data to the expected format
        return storedData.map((data) => ({
          date: data.forecast_date,
          temperature: data.temperature_high || 70, // Default value if null
          condition: data.weather_condition || "clear",
          precipitation: data.precipitation_amount || 0,
          windSpeed: data.wind_speed || 0,
        }))
      }

      // If we don't have data, fetch from external API
      // For now, we'll generate mock data
      const forecast = this.generateMockWeatherData(location, startDate, endDate)

      // Store the data for future use
      const dataToStore: NewWeatherData[] = forecast.map((f) => ({
        location_id: locationId,
        forecast_date: f.date,
        temperature_high: f.temperature,
        temperature_low: f.temperature - 10, // Mock low temp
        precipitation_probability: f.precipitation > 0 ? 80 : 0,
        precipitation_amount: f.precipitation,
        wind_speed: f.windSpeed,
        weather_condition: f.condition,
        source: "mock",
      }))

      await this.saveWeatherData(dataToStore)

      return forecast
    } catch (error) {
      console.error("Error fetching weather forecast:", error)
      // Return default weather data in case of error
      return this.generateMockWeatherData(location, startDate, endDate)
    }
  },

  // Helper to normalize location IDs
  normalizeLocationId(location: string): string {
    return location.toLowerCase().replace(/\s+/g, "_")
  },

  // Generate mock weather data for testing
  generateMockWeatherData(
    location: string,
    startDate: Date,
    endDate: Date,
  ): {
    date: string
    temperature: number
    condition: string
    precipitation: number
    windSpeed: number
  }[] {
    const forecast: {
      date: string
      temperature: number
      condition: string
      precipitation: number
      windSpeed: number
    }[] = []

    const conditions = ["clear", "cloudy", "rain", "snow"]
    const currentDate = new Date(startDate)
    const endDateValue = new Date(endDate)

    while (currentDate <= endDateValue) {
      const dateString = currentDate.toISOString().split("T")[0]

      // Generate random weather data
      const randomConditionIndex = Math.floor(Math.random() * conditions.length)
      const condition = conditions[randomConditionIndex]

      let precipitation = 0
      if (condition === "rain") {
        precipitation = Math.random() * 1.5 // Up to 1.5 inches
      } else if (condition === "snow") {
        precipitation = Math.random() * 6 // Up to 6 inches
      }

      const windSpeed = Math.random() * 25 // Up to 25 mph

      // Temperature varies by condition
      let temperature = 70 // Default
      switch (condition) {
        case "clear":
          temperature = 65 + Math.random() * 20 // 65-85
          break
        case "cloudy":
          temperature = 60 + Math.random() * 15 // 60-75
          break
        case "rain":
          temperature = 50 + Math.random() * 15 // 50-65
          break
        case "snow":
          temperature = 20 + Math.random() * 15 // 20-35
          break
      }

      forecast.push({
        date: dateString,
        temperature,
        condition,
        precipitation,
        windSpeed,
      })

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return forecast
  },
}
