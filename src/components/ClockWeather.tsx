import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface WeatherData {
  city: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

const ClockWeather = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    const apiKey = localStorage.getItem("weather-api-key");
    const city = localStorage.getItem("weather-city") || "Sarajevo";

    if (!apiKey) {
      setError("API ključ nije postavljen");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=hr`
      );

      if (!response.ok) throw new Error("Greška pri učitavanju vremena");

      const data = await response.json();

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

      setWeather({
        city: data.name,
        temperature: Math.round(data.main.temp),
        condition: mapCondition(data.weather[0].main),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        feelsLike: Math.round(data.main.feels_like),
      });
      setError(null);
    } catch (err: any) {
      console.error("Weather fetch error:", err);
      setError("Greška");
    } finally {
      setLoading(false);
    }
  };

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const date = time.toLocaleDateString("bs-BA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const WeatherIcon = weather
    ? {
        sunny: Sun,
        cloudy: Cloud,
        rainy: CloudRain,
        snowy: CloudSnow,
      }[weather.condition]
    : Cloud;

  const conditionText = weather
    ? {
        sunny: "Sunčano",
        cloudy: "Oblačno",
        rainy: "Kišovito",
        snowy: "Snijeg",
      }[weather.condition]
    : "";

  return (
    <div className="text-center py-12 animate-fade-in">
      {/* Clock */}
      <div className="text-8xl font-display font-bold tracking-tight mb-4 gradient-text animate-scale-in">
        {hours}
        <span className="animate-pulse mx-1">:</span>
        {minutes}
      </div>
      <div className="text-xl text-muted-foreground font-medium tracking-wide mb-8">{date}</div>

      {/* Weather */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Cloud className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Učitavam vremensku prognozu...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      ) : weather ? (
        <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm shadow-glow-sm animate-scale-in">
          <WeatherIcon className="w-12 h-12 text-primary" />
          <div className="text-left">
            <div className="text-4xl font-bold font-display">{weather.temperature}°C</div>
            <div className="text-sm text-muted-foreground">{weather.city} • {conditionText}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ClockWeather;
