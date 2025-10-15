import { Cloud, Sun, CloudRain, CloudSun } from "lucide-react";

const Weather = () => {
  // In a real app, this would fetch from a weather API
  const weatherData = {
    city: "Sarajevo",
    temperature: 18,
    condition: "sunny" as const,
  };

  const WeatherIcon = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
  }[weatherData.condition];

  return (
    <div className="widget-card">
      <div className="flex items-center gap-2 mb-6">
        <CloudSun className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-mono-heading">Vremenska Prognoza</h2>
      </div>
      
      <div className="text-center py-4">
        <div className="text-6xl font-bold font-mono-heading mb-2">{weatherData.temperature}°C</div>
        <div className="text-base text-muted-foreground">{weatherData.city}</div>
      </div>
    </div>
  );
};

export default Weather;
