import { CalendarIcon, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: string;
}

const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const savedEvents = localStorage.getItem("calendar-events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

  const todayEvents = events.filter(e => e.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const tomorrowEvents = events.filter(e => e.date === tomorrowStr).sort((a, b) => a.time.localeCompare(b.time));

  const todayDate = today.toLocaleDateString("sr-RS", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });

  const tomorrowDate = tomorrow.toLocaleDateString("sr-RS", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });

  const EventsList = ({ events, label }: { events: CalendarEvent[], label: string }) => (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{label}</h3>
      {events.length > 0 ? (
        <div className="space-y-2.5">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="flex gap-3 items-start group hover:translate-x-1 transition-all duration-300 animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-xs font-bold text-primary w-11 shrink-0 pt-0.5 group-hover:glow-primary transition-all duration-300">
                {event.time}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground leading-relaxed group-hover:text-primary transition-colors duration-300">
                  {event.title}
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic py-2">
          Nema događaja
        </p>
      )}
    </div>
  );

  return (
    <div className="widget-card space-y-5">
      <div className="flex items-center gap-3">
        <CalendarIcon className="h-5 w-5 text-primary" />
        <h2 className="font-mono-heading text-xl">Kalendar</h2>
      </div>
      
      <div className="space-y-5">
        <EventsList events={todayEvents} label={todayDate} />
        <EventsList events={tomorrowEvents} label={tomorrowDate} />
      </div>
    </div>
  );
};

export default Calendar;
