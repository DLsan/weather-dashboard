"use client"

import type React from "react"

import { useState } from "react"
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Search, Sun, Wind } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock weather data
const weatherData = {
  current: {
    city: "San Francisco",
    temperature: 18,
    condition: "Partly Cloudy",
    humidity: 72,
    windSpeed: 12,
    feelsLike: 17,
    uvIndex: 4,
    visibility: 10,
    pressure: 1012,
  },
  forecast: [
    { day: "Mon", temp: 18, condition: "cloudy", high: 20, low: 14 },
    { day: "Tue", temp: 20, condition: "sunny", high: 22, low: 15 },
    { day: "Wed", temp: 17, condition: "rainy", high: 19, low: 13 },
    { day: "Thu", temp: 16, condition: "drizzle", high: 18, low: 12 },
    { day: "Fri", temp: 19, condition: "sunny", high: 21, low: 14 },
  ],
  hourly: [
    { time: "Now", temp: 18, condition: "cloudy" },
    { time: "1 PM", temp: 19, condition: "cloudy" },
    { time: "2 PM", temp: 19, condition: "cloudy" },
    { time: "3 PM", temp: 20, condition: "sunny" },
    { time: "4 PM", temp: 19, condition: "sunny" },
    { time: "5 PM", temp: 18, condition: "sunny" },
    { time: "6 PM", temp: 17, condition: "cloudy" },
    { time: "7 PM", temp: 16, condition: "cloudy" },
  ],
}

// Weather icon mapping
const WeatherIcon = ({ condition, className = "w-6 h-6" }: { condition: string; className?: string }) => {
  switch (condition.toLowerCase()) {
    case "sunny":
      return <Sun className={className} />
    case "cloudy":
      return <Cloud className={className} />
    case "rainy":
      return <CloudRain className={className} />
    case "drizzle":
      return <CloudDrizzle className={className} />
    case "snowy":
      return <CloudSnow className={className} />
    case "stormy":
      return <CloudLightning className={className} />
    case "foggy":
      return <CloudFog className={className} />
    case "windy":
      return <Wind className={className} />
    default:
      return <Cloud className={className} />
  }
}

export default function WeatherDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentWeather, setCurrentWeather] = useState(weatherData.current)
  const [forecast, setForecast] = useState(weatherData.forecast)
  const [hourly, setHourly] = useState(weatherData.hourly)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would fetch data from a weather API
    console.log(`Searching for ${searchQuery}`)
    // For demo purposes, we'll just update the city name
    if (searchQuery.trim()) {
      setCurrentWeather({ ...currentWeather, city: searchQuery })
      setSearchQuery("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Weather Dashboard</h1>
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-800"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Weather Card */}
          <Card className="col-span-full lg:col-span-1 bg-white dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{currentWeather.city}</CardTitle>
              <CardDescription>Current Weather</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <WeatherIcon
                  condition={currentWeather.condition}
                  className="h-24 w-24 text-blue-500 dark:text-blue-400"
                />
                <div className="text-center">
                  <div className="text-5xl font-bold">{currentWeather.temperature}°C</div>
                  <div className="text-xl text-muted-foreground">{currentWeather.condition}</div>
                </div>
                <div className="grid w-full grid-cols-2 gap-4 pt-4">
                  <div className="flex flex-col items-center gap-1 rounded-lg border p-2">
                    <span className="text-sm text-muted-foreground">Feels Like</span>
                    <span className="text-lg font-medium">{currentWeather.feelsLike}°C</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg border p-2">
                    <span className="text-sm text-muted-foreground">Humidity</span>
                    <span className="text-lg font-medium">{currentWeather.humidity}%</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg border p-2">
                    <span className="text-sm text-muted-foreground">Wind</span>
                    <span className="text-lg font-medium">{currentWeather.windSpeed} km/h</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg border p-2">
                    <span className="text-sm text-muted-foreground">UV Index</span>
                    <span className="text-lg font-medium">{currentWeather.uvIndex}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast and Hourly Tabs */}
          <Card className="col-span-full lg:col-span-2 bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="daily">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="daily">5-Day Forecast</TabsTrigger>
                  <TabsTrigger value="hourly">Hourly Forecast</TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="pt-4">
                  <div className="grid grid-cols-5 gap-2">
                    {forecast.map((day) => (
                      <div key={day.day} className="flex flex-col items-center rounded-lg p-2 text-center">
                        <span className="font-medium">{day.day}</span>
                        <WeatherIcon
                          condition={day.condition}
                          className="my-2 h-8 w-8 text-blue-500 dark:text-blue-400"
                        />
                        <span className="text-lg font-bold">{day.temp}°</span>
                        <div className="flex w-full justify-between text-xs text-muted-foreground">
                          <span>{day.low}°</span>
                          <span>{day.high}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="hourly" className="pt-4">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {hourly.map((hour) => (
                      <div
                        key={hour.time}
                        className="flex min-w-[80px] flex-col items-center rounded-lg p-2 text-center"
                      >
                        <span className="font-medium">{hour.time}</span>
                        <WeatherIcon
                          condition={hour.condition}
                          className="my-2 h-8 w-8 text-blue-500 dark:text-blue-400"
                        />
                        <span className="text-lg font-bold">{hour.temp}°</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Weather Map Card */}
          <Card className="col-span-full bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Weather Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>Weather map would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

