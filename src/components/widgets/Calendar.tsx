import { CalendarDays } from "lucide-react";

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  isToday: boolean;
}

const events: CalendarEvent[] = [
  { id: "1", time: "10:00", title: "Tim sastanak - Sprint planning", isToday: true },
  { id: "2", time: "14:00", title: "1-on-1 sa mentorom", isToday: true },
  { id: "3", time: "09:00", title: "Code review sesija", isToday: false },
  { id: "4", time: "15:30", title: "Prezentacija projekta", isToday: false },
];

const Calendar = () => {
  const today = new Date().toLocaleDateString("sr-RS", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });

  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("sr-RS", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });

  return (
    <div className="widget-card space-y-5">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="font-mono-heading text-xl">Kalendar</h2>
      </div>
      
      <div className="space-y-5">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            {today}
          </h3>
          <div className="space-y-2.5">
            {events.filter(e => e.isToday).map((event, index) => (
              <div key={event.id} className="flex gap-3 items-start group hover:translate-x-1 transition-all duration-300 animate-slide-up cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="text-xs font-bold text-primary w-11 shrink-0 pt-0.5 group-hover:glow-primary transition-all duration-300">
                  {event.time}
                </span>
                <span className="text-sm text-foreground leading-relaxed group-hover:text-primary transition-colors duration-300">
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            {tomorrow}
          </h3>
          <div className="space-y-2.5">
            {events.filter(e => !e.isToday).map((event, index) => (
              <div key={event.id} className="flex gap-3 items-start group hover:translate-x-1 transition-all duration-300 animate-slide-up cursor-pointer" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                <span className="text-xs font-bold text-primary w-11 shrink-0 pt-0.5 group-hover:glow-primary transition-all duration-300">
                  {event.time}
                </span>
                <span className="text-sm text-foreground leading-relaxed group-hover:text-primary transition-colors duration-300">
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
