import { useState, useEffect } from "react";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const date = time.toLocaleDateString("bs-BA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="text-8xl font-display font-bold tracking-tight mb-4 gradient-text animate-scale-in">
        {hours}
        <span className="animate-pulse mx-1">:</span>
        {minutes}
      </div>
      <div className="text-xl text-muted-foreground font-medium tracking-wide">{date}</div>
    </div>
  );
};

export default Clock;
