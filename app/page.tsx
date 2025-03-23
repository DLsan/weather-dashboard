"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Cloud,
  Umbrella,
  Eye,
  Gauge,
  AlertCircle,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Weather data interface
interface WeatherData {
  name: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  visibility: number
  clouds: {
    all: number
  }
  rain?: {
    "1h"?: number
    "3h"?: number
  }
  dt: number
}

// Forecast data interface
interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      humidity: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
    }
    dt_txt: string
    pop: number // probability of precipitation
  }>
  city: {
    name: string
    country: string
  }
}

// Country to major cities mapping
const COUNTRY_TO_CITIES = {
  india: ["Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai"],
  usa: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  uk: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool"],
  australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  canada: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  china: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"],
  japan: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo"],
  germany: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  france: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
  italy: ["Rome", "Milan", "Naples", "Turin", "Florence"],
  spain: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza"],
  brazil: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
  russia: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"],
  mexico: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana"],
}

// Common country names and their codes
const COUNTRY_NAMES = [
  "india",
  "usa",
  "uk",
  "australia",
  "canada",
  "china",
  "japan",
  "germany",
  "france",
  "italy",
  "spain",
  "brazil",
  "russia",
  "mexico",
  "united states",
  "united kingdom",
  "united states of america",
  "great britain",
  "england",
]

function WeatherDashboard() {
  const [city, setCity] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestedCities, setSuggestedCities] = useState<string[]>([])
  const [unit, setUnit] = useState<"metric" | "imperial">("metric")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [apiKeyError, setApiKeyError] = useState(false)

  // API key would normally be stored in an environment variable
  // This key is likely invalid or has restrictions, so we'll handle that case
  const API_KEY = "4f0df61fc0bf153c68ff8b2e35116f0a"

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }
  }, [])

  // Save recent searches to localStorage when they change
  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
  }, [recentSearches])

  // Check if input might be a country instead of a city
  const checkIfCountry = (input: string): string[] | null => {
    const normalizedInput = input.trim().toLowerCase()

    // Special case mappings
    const specialCases = {
      us: "usa",
      "united states": "usa",
      "united states of america": "usa",
      america: "usa",
      england: "uk",
      "great britain": "uk",
      "united kingdom": "uk",
    }

    const searchTerm = specialCases[normalizedInput] || normalizedInput

    if (COUNTRY_TO_CITIES[searchTerm]) {
      return COUNTRY_TO_CITIES[searchTerm]
    }

    // Check if the input contains a country name
    for (const country of COUNTRY_NAMES) {
      if (normalizedInput.includes(country)) {
        return COUNTRY_TO_CITIES[country] || null
      }
    }

    return null
  }

  // Mock data for demonstration purposes
  const getMockWeatherData = (cityName: string): WeatherData => {
    const now = Math.floor(Date.now() / 1000)

    // Generate somewhat realistic temperature based on city name
    // This is just for demo purposes to make the mock data feel more realistic
    const cityHash = cityName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const baseTemp = 15 + (cityHash % 20) // Temperature between 15-35°C

    return {
      name: cityName,
      main: {
        temp: baseTemp,
        feels_like: baseTemp - 1 + Math.random() * 2,
        humidity: 40 + (cityHash % 50), // Humidity between 40-90%
        pressure: 1000 + (cityHash % 30), // Pressure between 1000-1030 hPa
      },
      weather: [
        {
          main: ["Clear", "Clouds", "Rain", "Mist"][cityHash % 4],
          description: ["clear sky", "scattered clouds", "light rain", "mist"][cityHash % 4],
          icon: ["01d", "03d", "10d", "50d"][cityHash % 4],
        },
      ],
      wind: {
        speed: 2 + (cityHash % 8), // Wind speed between 2-10 m/s
        deg: (cityHash * 10) % 360, // Wind direction 0-359 degrees
      },
      sys: {
        country: ["US", "GB", "DE", "FR", "JP", "AU", "CA", "IT"][cityHash % 8],
        sunrise: now - 3600 * 2,
        sunset: now + 3600 * 8,
      },
      visibility: 8000 + (cityHash % 3000), // Visibility between 8000-11000 meters
      clouds: {
        all: cityHash % 100, // Cloudiness 0-99%
      },
      dt: now,
    }
  }

  const getMockForecastData = (cityName: string): ForecastData => {
    const now = Math.floor(Date.now() / 1000)
    const list = []

    // Generate a city hash for consistent mock data
    const cityHash = cityName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const baseTemp = 15 + (cityHash % 20) // Base temperature between 15-35°C

    // Create 5 days of forecast data, 8 entries per day (3-hour intervals)
    for (let i = 0; i < 40; i++) {
      // Create a temperature curve that varies by time of day
      const hourOfDay = (Math.floor(i / 8) * 24 + (i % 8) * 3) % 24
      const timeVariation = Math.sin(((hourOfDay - 12) * Math.PI) / 12) * 5 // -5 to +5 degrees variation

      // Add some day-to-day variation
      const dayVariation = Math.sin(((i / 8) * Math.PI) / 2.5) * 3 // -3 to +3 degrees variation

      const temp = baseTemp + timeVariation + dayVariation

      // Weather condition varies by temperature
      const weatherIndex = Math.floor((temp - baseTemp + 8) / 4) % 4

      list.push({
        dt: now + i * 3600 * 3,
        main: {
          temp: temp,
          feels_like: temp - 1 + Math.random() * 2,
          humidity: 40 + ((cityHash + i) % 50),
        },
        weather: [
          {
            main: ["Clear", "Clouds", "Rain", "Mist"][weatherIndex],
            description: ["clear sky", "scattered clouds", "light rain", "mist"][weatherIndex],
            icon: ["01d", "03d", "10d", "50d"][weatherIndex],
          },
        ],
        wind: {
          speed: 2 + ((cityHash + i) % 8),
        },
        dt_txt: new Date((now + i * 3600 * 3) * 1000).toISOString(),
        pop: Math.max(0, Math.min(1, (weatherIndex - 1) * 0.3 + Math.random() * 0.2)),
      })
    }

    return {
      list,
      city: {
        name: cityName,
        country: ["US", "GB", "DE", "FR", "JP", "AU", "CA", "IT"][cityHash % 8],
      },
    }
  }

  // Function to fetch weather data
  const fetchWeatherData = async (searchCity: string) => {
    if (!searchCity.trim()) return

    setLoading(true)
    setError("")
    setSuggestedCities([])
    setApiKeyError(false)

    // Check if the input might be a country
    const possibleCities = checkIfCountry(searchCity)
    if (possibleCities) {
      setLoading(false)
      setSuggestedCities(possibleCities)
      setError(`"${searchCity}" appears to be a country, not a city. Please select one of these major cities:`)
      return
    }

    try {
      // Always try to fetch real data from the API first
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=${unit}&appid=${API_KEY}`,
      )

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          // API key is invalid or unauthorized
          setApiKeyError(true)
          throw new Error("API key is invalid or unauthorized. Switching to demo mode with mock data.")
        } else if (weatherResponse.status === 404) {
          throw new Error(`City "${searchCity}" not found. Please check the spelling or try a different city.`)
        } else {
          throw new Error(`Error fetching weather data: ${weatherResponse.statusText}`)
        }
      }

      const weatherResult = await weatherResponse.json()
      setWeatherData(weatherResult)

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&units=${unit}&appid=${API_KEY}`,
      )

      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data")
      }

      const forecastResult = await forecastResponse.json()
      setForecastData(forecastResult)

      // Update recent searches
      if (!recentSearches.includes(searchCity)) {
        const updatedSearches = [searchCity, ...recentSearches.slice(0, 4)]
        setRecentSearches(updatedSearches)
      }
    } catch (err) {
      console.error("Error fetching weather data:", err)

      if (apiKeyError) {
        // If there was an API key error, use mock data as fallback
        await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay
        setWeatherData(getMockWeatherData(searchCity))
        setForecastData(getMockForecastData(searchCity))
      } else {
        setError(err.message || "Failed to fetch weather data")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeatherData(city)
  }

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity)
    fetchWeatherData(selectedCity)
  }

  const handleRecentSearch = (searchCity: string) => {
    setCity(searchCity)
    fetchWeatherData(searchCity)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  // Group forecast data by day
  const getDailyForecast = () => {
    if (!forecastData) return []

    const dailyData = {}

    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString()

      if (!dailyData[date]) {
        dailyData[date] = {
          date: item.dt,
          temp_min: item.main.temp,
          temp_max: item.main.temp,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          precipitation: item.pop,
        }
      } else {
        dailyData[date].temp_min = Math.min(dailyData[date].temp_min, item.main.temp)
        dailyData[date].temp_max = Math.max(dailyData[date].temp_max, item.main.temp)

        // Use daytime icon if available
        if (item.weather[0].icon.includes("d")) {
          dailyData[date].icon = item.weather[0].icon
          dailyData[date].description = item.weather[0].description
        }
      }
    })

    return Object.values(dailyData).slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-2">Weather Dashboard</h1>
          <p className="text-white">Check detailed weather conditions for any location</p>

          {apiKeyError && (
            <Alert className="mt-4 max-w-md mx-auto bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-800 dark:text-amber-300">Demo Mode Active</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                Using simulated weather data. API key is invalid or unauthorized.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex w-full max-w-md mx-auto items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-gray-900 text-white border-gray-800"
            />
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>

          {error && !apiKeyError && (
            <Alert variant="destructive" className="mt-4 max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {suggestedCities.length > 0 && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedCities.map((suggestedCity) => (
                  <Button
                    key={suggestedCity}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCitySelect(suggestedCity)}
                    className="text-white border-gray-700 hover:bg-gray-800"
                  >
                    {suggestedCity}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {recentSearches.length > 0 && !error && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-white mr-2 mt-1">Recent:</span>
              {recentSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer text-white border-gray-700 hover:bg-gray-800"
                  onClick={() => handleRecentSearch(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4 flex justify-end">
          <Tabs value={unit} onValueChange={(value) => setUnit(value as "metric" | "imperial")}>
            <TabsList className="bg-gray-900">
              <TabsTrigger value="metric" className="data-[state=active]:bg-red-600 text-white">
                °C
              </TabsTrigger>
              <TabsTrigger value="imperial" className="data-[state=active]:bg-red-600 text-white">
                °F
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-black border border-gray-800">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 bg-gray-800" />
                <Skeleton className="h-4 w-1/2 bg-gray-800" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <Skeleton className="h-24 w-full bg-gray-800" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 w-full bg-gray-800" />
                    <Skeleton className="h-20 w-full bg-gray-800" />
                    <Skeleton className="h-20 w-full bg-gray-800" />
                    <Skeleton className="h-20 w-full bg-gray-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black border border-gray-800">
              <CardHeader>
                <Skeleton className="h-8 w-1/2 bg-gray-800" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full bg-gray-800" />
              </CardContent>
            </Card>
          </div>
        ) : weatherData ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Weather Card */}
            <Card className="bg-black border border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl flex items-center text-red-500">
                      <MapPin className="mr-2 h-5 w-5" />
                      {weatherData.name}, {weatherData.sys.country}
                    </CardTitle>
                    <CardDescription className="text-white">
                      {formatDate(weatherData.dt)} • Updated just now
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-500">
                      {Math.round(weatherData.main.temp)}°{unit === "metric" ? "C" : "F"}
                    </div>
                    <div className="text-sm text-white">Feels like {Math.round(weatherData.main.feels_like)}°</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <img
                    src={getWeatherIcon(weatherData.weather[0].icon) || "/placeholder.svg"}
                    alt={weatherData.weather[0].description}
                    className="h-16 w-16"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg?height=64&width=64"
                    }}
                  />
                  <div className="ml-2">
                    <div className="text-lg font-medium capitalize text-white">
                      {weatherData.weather[0].description}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center text-sm text-white">
                      <Thermometer className="h-4 w-4 mr-1 text-red-500" />
                      <span>Humidity</span>
                    </div>
                    <span className="text-lg font-medium text-white">{weatherData.main.humidity}%</span>
                    <Progress
                      value={weatherData.main.humidity}
                      className="h-1 mt-1 bg-gray-800"
                      indicatorClassName="bg-red-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center text-sm text-white">
                      <Wind className="h-4 w-4 mr-1 text-red-500" />
                      <span>Wind</span>
                    </div>
                    <span className="text-lg font-medium text-white">
                      {weatherData.wind.speed} {unit === "metric" ? "m/s" : "mph"}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      Direction: {getWindDirection(weatherData.wind.deg)} ({weatherData.wind.deg}°)
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center text-sm text-white">
                      <Cloud className="h-4 w-4 mr-1 text-red-500" />
                      <span>Cloudiness</span>
                    </div>
                    <span className="text-lg font-medium text-white">{weatherData.clouds.all}%</span>
                    <Progress
                      value={weatherData.clouds.all}
                      className="h-1 mt-1 bg-gray-800"
                      indicatorClassName="bg-red-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center text-sm text-white">
                      <Eye className="h-4 w-4 mr-1 text-red-500" />
                      <span>Visibility</span>
                    </div>
                    <span className="text-lg font-medium text-white">
                      {(weatherData.visibility / 1000).toFixed(1)} km
                    </span>
                    <Progress
                      value={(weatherData.visibility / 10000) * 100}
                      className="h-1 mt-1 bg-gray-800"
                      indicatorClassName="bg-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center text-sm text-white">
                      <Sunrise className="h-4 w-4 mr-1 text-red-500" />
                      <span>Sunrise</span>
                    </div>
                    <span className="text-lg font-medium text-white">{formatTime(weatherData.sys.sunrise)}</span>
                  </div>

                  <div className="flex flex-col gap-1 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center text-sm text-white">
                      <Sunset className="h-4 w-4 mr-1 text-red-500" />
                      <span>Sunset</span>
                    </div>
                    <span className="text-lg font-medium text-white">{formatTime(weatherData.sys.sunset)}</span>
                  </div>

                  <div className="flex flex-col gap-1 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center text-sm text-white">
                      <Umbrella className="h-4 w-4 mr-1 text-red-500" />
                      <span>Precipitation</span>
                    </div>
                    <span className="text-lg font-medium text-white">
                      {weatherData.rain ? `${weatherData.rain["1h"] || weatherData.rain["3h"] || 0} mm` : "0 mm"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center text-sm text-white">
                      <Gauge className="h-4 w-4 mr-1 text-red-500" />
                      <span>Pressure</span>
                    </div>
                    <span className="text-lg font-medium text-white">{weatherData.main.pressure} hPa</span>
                  </div>
                </div>

                {apiKeyError && (
                  <div className="mt-4 text-xs text-center text-red-400">
                    Using simulated weather data due to API key issues
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Forecast Card */}
            <Card className="bg-black border border-gray-800">
              <CardHeader>
                <CardTitle className="text-red-500">5-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                {forecastData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-5 gap-2">
                      {getDailyForecast().map((day, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center text-center p-2 rounded-lg border border-gray-800"
                        >
                          <div className="text-sm font-medium text-red-500">
                            {index === 0 ? "Today" : formatDate(day.date).split(",")[0]}
                          </div>
                          <img
                            src={getWeatherIcon(day.icon) || "/placeholder.svg"}
                            alt={day.description}
                            className="h-10 w-10 my-1"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder.svg?height=40&width=40"
                            }}
                          />
                          <div className="text-xs text-gray-400 capitalize">{day.description}</div>
                          <div className="flex justify-between w-full text-xs mt-1 text-white">
                            <span>{Math.round(day.temp_min)}°</span>
                            <span className="font-medium">{Math.round(day.temp_max)}°</span>
                          </div>
                          <div className="flex items-center text-xs text-red-400 mt-1">
                            <Droplets className="h-3 w-3 mr-1" />
                            <span>{Math.round(day.precipitation * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3 text-red-500">Hourly Forecast</h3>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {forecastData.list.slice(0, 8).map((item, index) => (
                          <div key={index} className="flex flex-col items-center min-w-[60px] text-center">
                            <div className="text-xs text-white">{formatTime(item.dt)}</div>
                            <img
                              src={getWeatherIcon(item.weather[0].icon) || "/placeholder.svg"}
                              alt={item.weather[0].description}
                              className="h-8 w-8 my-1"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/placeholder.svg?height=32&width=32"
                              }}
                            />
                            <div className="text-sm font-medium text-white">{Math.round(item.main.temp)}°</div>
                            <div className="flex items-center text-xs text-red-400 mt-1">
                              <Droplets className="h-3 w-3 mr-0.5" />
                              <span>{Math.round(item.pop * 100)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Temperature Trend Graph - Line Chart */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-red-500">Temperature Trend</h3>
                      <div className="mb-2 text-xs text-white">
                        <div className="flex justify-between">
                          <span>Hourly temperature variations</span>
                          <span>Next 24 hours</span>
                        </div>
                      </div>
                      <div className="h-64 w-full rounded-md bg-gray-900 p-4 flex flex-col">
                        <div className="flex-1 relative">
                          {/* Temperature range labels */}
                          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                            {(() => {
                              const temps = forecastData.list.slice(0, 8).map((i) => i.main.temp)
                              const minTemp = Math.floor(Math.min(...temps)) - 1
                              const maxTemp = Math.ceil(Math.max(...temps)) + 1
                              return (
                                <>
                                  <div>{maxTemp}°</div>
                                  <div>{Math.round((minTemp + maxTemp) / 2)}°</div>
                                  <div>{minTemp}°</div>
                                </>
                              )
                            })()}
                          </div>

                          {/* Grid lines */}
                          <div className="absolute left-6 right-0 top-0 h-full">
                            <div className="border-t border-gray-800 absolute top-0 w-full"></div>
                            <div className="border-t border-gray-800 absolute top-1/2 w-full"></div>
                            <div className="border-t border-gray-800 absolute bottom-0 w-full"></div>
                          </div>

                          {/* Temperature line chart */}
                          <div className="absolute left-6 right-0 bottom-0 top-0">
                            {(() => {
                              const temps = forecastData.list.slice(0, 8).map((i) => i.main.temp)
                              const minTemp = Math.min(...temps) - 1
                              const maxTemp = Math.max(...temps) + 1
                              const range = maxTemp - minTemp

                              // Calculate positions for the line
                              const points = forecastData.list.slice(0, 8).map((item, index) => {
                                const x = (index / 7) * 100 // percentage across x-axis
                                const y = 100 - ((item.main.temp - minTemp) / range) * 100 // percentage from top
                                return { x, y, temp: item.main.temp, time: formatTime(item.dt) }
                              })

                              // Create SVG path for the line
                              const pathD = points
                                .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x}% ${point.y}%`)
                                .join(" ")

                              // Create SVG path for the area under the line
                              const areaPathD = `${pathD} L 100% 100% L 0% 100% Z`

                              return (
                                <svg className="w-full h-full overflow-visible">
                                  {/* Area under the line with gradient */}
                                  <defs>
                                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="rgba(239, 68, 68, 0.5)" />{" "}
                                      {/* red-500 with opacity */}
                                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />{" "}
                                      {/* blue-500 with opacity */}
                                    </linearGradient>
                                  </defs>

                                  {/* Area fill under the line */}
                                  <path d={areaPathD} fill="url(#tempGradient)" strokeWidth="0" />

                                  {/* The temperature line */}
                                  <path
                                    d={pathD}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />

                                  {/* Temperature points with values */}
                                  {points.map((point, i) => (
                                    <g key={i}>
                                      {/* Temperature point */}
                                      <circle
                                        cx={`${point.x}%`}
                                        cy={`${point.y}%`}
                                        r="4"
                                        fill="#ef4444"
                                        stroke="#000"
                                        strokeWidth="1"
                                      />

                                      {/* Temperature value */}
                                      <text
                                        x={`${point.x}%`}
                                        y={`${point.y - 10}%`}
                                        fontSize="10"
                                        fill="white"
                                        textAnchor="middle"
                                      >
                                        {Math.round(point.temp)}°
                                      </text>
                                    </g>
                                  ))}
                                </svg>
                              )
                            })()}
                          </div>

                          {/* Time labels */}
                          <div className="absolute left-6 right-0 bottom-0 flex justify-between text-xs text-gray-400">
                            {forecastData.list.slice(0, 8).map((item, index) => (
                              <div key={index} className="text-center">
                                {formatTime(item.dt).split(":")[0]}
                                {index === 0 ? <span className="ml-1">(Now)</span> : ""}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400 text-center">
                        Line graph shows how temperature fluctuates throughout the day
                      </div>
                    </div>

                    {apiKeyError && (
                      <div className="mt-4 text-xs text-center text-red-400">
                        Using simulated forecast data due to API key issues
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center p-8 bg-black rounded-lg shadow border border-gray-800">
            <div className="text-6xl mb-4">🌤️</div>
            <h2 className="text-xl font-medium mb-2 text-red-500">Enter a city to get started</h2>
            <p className="text-white">Search for any city to see current weather conditions and forecast</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>Examples: London, Tokyo, New York, Sydney</p>
              <p className="mt-1">Note: Please enter city names, not countries</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeatherDashboard

