import { useState, useEffect } from "react";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const getGreeting = () => {
    if (hours < 12) return "Dobro jutro";
    if (hours < 18) return "Dobar dan";
    return "Dobro veče";
  };

  const formattedTime = time.toLocaleTimeString("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="text-center space-y-4">
      <div className="font-mono-heading text-5xl font-bold tracking-tight">
        {formattedTime}
      </div>
      <p className="text-base text-muted-foreground">
        Danas je dan za uspjeh.
      </p>
    </div>
  );
};

export default Clock;
