import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Gauge, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WeatherData {
  city: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
}

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
  icon: any;
}

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Refresh every 30 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    const apiKey = localStorage.getItem("weather-api-key");
    const city = localStorage.getItem("weather-city") || "Sarajevo";

    if (!apiKey) {
      setError("API ključ nije postavljen. Idite u Admin → Početna Stranica da ga postavite.");
      setLoading(false);
      return;
    }

    try {
      // Try OpenWeatherMap format first
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=hr`
      );

      if (!currentResponse.ok) {
        throw new Error("Neuspješno učitavanje vremenske prognoze. Provjerite API ključ.");
      }

      const currentData = await currentResponse.json();

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=hr`
      );

      const forecastData = await forecastResponse.json();

      // Map weather conditions
      const mapCondition = (main: string): "sunny" | "cloudy" | "rainy" | "snowy" => {
        const conditions: { [key: string]: "sunny" | "cloudy" | "rainy" | "snowy" } = {
          Clear: "sunny",
          Clouds: "cloudy",
          Rain: "rainy",
          Drizzle: "rainy",
          Snow: "snowy",
          Thunderstorm: "rainy",
        };
        return conditions[main] || "cloudy";
      };

      const mapIcon = (condition: string) => {
        const icons: { [key: string]: any } = {
          sunny: Sun,
          cloudy: Cloud,
          rainy: CloudRain,
          snowy: CloudSnow,
        };
        return icons[condition] || Cloud;
      };

      setCurrentWeather({
        city: currentData.name,
        temperature: Math.round(currentData.main.temp),
        condition: mapCondition(currentData.weather[0].main),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
        visibility: Math.round(currentData.visibility / 1000),
        pressure: currentData.main.pressure,
        feelsLike: Math.round(currentData.main.feels_like),
      });

      // Process forecast - get one per day
      const dailyForecasts: ForecastDay[] = [];
      const processedDays = new Set<string>();

      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();

        if (!processedDays.has(dayKey) && dailyForecasts.length < 3) {
          processedDays.add(dayKey);
          const dayNames = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          let dayLabel = "";
          if (date.toDateString() === tomorrow.toDateString()) {
            dayLabel = "Sutra";
          } else {
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            if (date.toDateString() === dayAfterTomorrow.toDateString()) {
              dayLabel = "Prekosutra";
            } else {
              dayLabel = dayNames[date.getDay()];
            }
          }

          const condition = mapCondition(item.weather[0].main);
          dailyForecasts.push({
            day: dayLabel,
            temp: Math.round(item.main.temp),
            condition,
            icon: mapIcon(condition),
          });
        }
      });

      setForecast(dailyForecasts);
      setError(null);
    } catch (err: any) {
      console.error("Weather fetch error:", err);
      setError(err.message || "Greška pri učitavanju vremena");
      toast.error("Greška pri učitavanju vremenske prognoze");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="widget-card">
        <div className="flex items-center gap-2 mb-6">
          <Cloud className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-xl font-mono-heading">Vremenska Prognoza</h2>
        </div>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Učitavam...</p>
        </div>
      </div>
    );
  }

  if (error || !currentWeather) {
    return (
      <div className="widget-card">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <h2 className="text-xl font-mono-heading">Vremenska Prognoza</h2>
        </div>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const WeatherIcon = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    snowy: CloudSnow
  }[currentWeather.condition];

  const conditionText = {
    sunny: "Sunčano",
    cloudy: "Oblačno",
    rainy: "Kišovito",
    snowy: "Snijeg"
  }[currentWeather.condition];

  return (
    <div className="widget-card">
      <div className="flex items-center gap-2 mb-6">
        <WeatherIcon className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-mono-heading">Vremenska Prognoza</h2>
      </div>
      
      {/* Current Weather */}
      <div className="text-center py-6 mb-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <WeatherIcon className="w-16 h-16 text-primary mx-auto mb-3" />
        <div className="text-5xl font-bold font-mono-heading mb-2">{currentWeather.temperature}°C</div>
        <div className="text-lg text-muted-foreground mb-1">{currentWeather.city}</div>
        <div className="text-sm text-primary font-semibold">{conditionText}</div>
        <div className="text-xs text-muted-foreground mt-2">Osjeća se kao {currentWeather.feelsLike}°C</div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <Droplets className="w-4 h-4 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Vlažnost</div>
            <div className="text-sm font-semibold">{currentWeather.humidity}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <Wind className="w-4 h-4 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Vjetar</div>
            <div className="text-sm font-semibold">{currentWeather.windSpeed} km/h</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <Eye className="w-4 h-4 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Vidljivost</div>
            <div className="text-sm font-semibold">{currentWeather.visibility} km</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <Gauge className="w-4 h-4 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Pritisak</div>
            <div className="text-sm font-semibold">{currentWeather.pressure} hPa</div>
          </div>
        </div>
      </div>

      {/* 3 Day Forecast */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Prognoza za 3 Dana</h3>
        <div className="space-y-2">
          {forecast.map((day, index) => {
            const Icon = day.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-sm font-medium">{day.day}</span>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">{day.temp}°C</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Weather;
