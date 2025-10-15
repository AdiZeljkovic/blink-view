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
    <div className="space-y-6">
      <h2 className="font-mono-heading text-2xl">Kalendar</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {today}
          </h3>
          <div className="space-y-3">
            {events.filter(e => e.isToday).map((event) => (
              <div key={event.id} className="flex gap-4">
                <span className="text-sm font-medium text-primary w-12 shrink-0">
                  {event.time}
                </span>
                <span className="text-sm text-foreground">
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {tomorrow}
          </h3>
          <div className="space-y-3">
            {events.filter(e => !e.isToday).map((event) => (
              <div key={event.id} className="flex gap-4">
                <span className="text-sm font-medium text-primary w-12 shrink-0">
                  {event.time}
                </span>
                <span className="text-sm text-foreground">
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
