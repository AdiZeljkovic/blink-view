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
    <div className="widget-card space-y-5">
      <div className="flex items-center gap-3">
        <CloudSun className="h-5 w-5 text-primary" />
        <h2 className="font-mono-heading text-xl">Vrijeme</h2>
      </div>
      
      <div className="flex items-center gap-5">
        <WeatherIcon className="h-10 w-10 text-foreground stroke-[1.5]" />
        <div>
          <div className="text-3xl font-semibold font-mono-heading tracking-tight">
            {weatherData.temperature}°C
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {weatherData.city}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
