import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Gauge } from "lucide-react";

const Weather = () => {
  // In a real app, this would fetch from a weather API
  const currentWeather = {
    city: "Sarajevo",
    temperature: 18,
    condition: "sunny" as const,
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    pressure: 1013,
    feelsLike: 16
  };

  const forecast = [
    { day: "Sutra", temp: 20, condition: "cloudy", icon: Cloud },
    { day: "Prekosutra", temp: 17, condition: "rainy", icon: CloudRain },
    { day: "3 Dana", temp: 15, condition: "cloudy", icon: Cloud }
  ];

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
