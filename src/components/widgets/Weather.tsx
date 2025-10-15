import { Cloud, Sun, CloudRain } from "lucide-react";

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
    <div className="space-y-6">
      <h2 className="font-mono-heading text-2xl">Vrijeme</h2>
      
      <div className="flex items-center gap-6">
        <WeatherIcon className="h-12 w-12 text-foreground stroke-[1.5]" />
        <div>
          <div className="text-4xl font-medium">
            {weatherData.temperature}°C
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {weatherData.city}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
