import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Clock, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { bs } from "date-fns/locale";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: string;
}

type ViewMode = "month" | "week" | "day";

const Kalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    time: "12:00"
  });

  // Load events from storage
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const savedEvents = await storage.getJSON<Event[]>("calendar-events");
        if (savedEvents) {
          setEvents(savedEvents);
        }
      } catch (error) {
        console.error("Error loading calendar events:", error);
        toast.error("Greška pri učitavanju događaja");
      }
    };
    loadEvents();
  }, []);

  // Save events to storage
  const saveEvents = async (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
    try {
      await storage.setJSON("calendar-events", updatedEvents);
    } catch (error) {
      console.error("Error saving calendar events:", error);
      toast.error("Greška pri čuvanju događaja");
    }
  };

  const addEvent = async () => {
    if (!newEvent.title.trim()) {
      toast.error("Unesite naziv događaja");
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: format(eventDate, "yyyy-MM-dd"),
      time: newEvent.time,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    await saveEvents([...events, event]);
    setNewEvent({ title: "", description: "", time: "12:00" });
    setEventDate(new Date());
    setIsDialogOpen(false);
    toast.success("Događaj dodan");
  };

  const deleteEvent = async (id: string) => {
    await saveEvents(events.filter(e => e.id !== id));
    toast.success("Događaj obrisan");
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(e => e.date === dateStr);
  };

  const getDayEvents = () => {
    return getEventsForDate(selectedDate);
  };

  const getWeekDates = () => {
    const curr = new Date(selectedDate);
    const first = curr.getDate() - curr.getDay() + 1;
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(curr.setDate(first + i));
      dates.push(date);
    }
    return dates;
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Kalendar</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (open) setEventDate(selectedDate);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Dodaj Događaj
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novi Događaj</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Naziv</Label>
                  <Input
                    id="title"
                    placeholder="Sastanak, zakazani termin..."
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-date">Datum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !eventDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventDate ? format(eventDate, "PPP", { locale: bs }) : "Odaberite datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={eventDate}
                        onSelect={(date) => date && setEventDate(date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Vrijeme (HH:MM - 24h format)</Label>
                  <Input
                    id="time"
                    type="text"
                    placeholder="15:34"
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    value={newEvent.time}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow typing numbers and colon
                      if (value === '' || /^[0-9:]*$/.test(value)) {
                        setNewEvent({ ...newEvent, time: value });
                      }
                    }}
                    onBlur={(e) => {
                      // Format time on blur
                      const value = e.target.value;
                      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
                      if (!timeRegex.test(value) && value !== '') {
                        toast.error("Unesite vrijeme u formatu HH:MM (npr. 15:34)");
                        setNewEvent({ ...newEvent, time: "12:00" });
                      }
                    }}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Primjer: 09:30, 15:45, 23:00</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Opis (opcionalno)</Label>
                  <Textarea
                    id="description"
                    placeholder="Detalji događaja..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <strong>Odabrani datum:</strong> {format(eventDate, "EEEE, dd. MMMM yyyy", { locale: bs })}
                </div>
                <Button onClick={addEvent} className="w-full">
                  Sačuvaj
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            onClick={() => setViewMode("month")}
            className="transition-all duration-300"
          >
            Mjesec
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() => setViewMode("week")}
            className="transition-all duration-300"
          >
            Sedmica
          </Button>
          <Button
            variant={viewMode === "day" ? "default" : "outline"}
            onClick={() => setViewMode("day")}
            className="transition-all duration-300"
          >
            Dan
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar - Left Column */}
          <div className="lg:col-span-1">
            <div className="widget-card">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className={cn("p-3 pointer-events-auto")}
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasEvents: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "hsl(var(--primary))"
                  }
                }}
              />
            </div>
          </div>

          {/* Events Display - Right Column */}
          <div className="lg:col-span-2">
            <div className="widget-card">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-mono-heading">
                  {viewMode === "month" && `Svi događaji - ${format(selectedDate, "MMMM yyyy")}`}
                  {viewMode === "week" && `Sedmični pregled`}
                  {viewMode === "day" && format(selectedDate, "EEEE, dd. MMMM yyyy")}
                </h2>
              </div>

              {/* Month View */}
              {viewMode === "month" && (
                <div className="space-y-3">
                  {events
                    .filter(e => e.date.startsWith(format(selectedDate, "yyyy-MM")))
                    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
                    .map((event, index) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all duration-300 group animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div 
                          className="w-1 h-full rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                {event.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(event.date), "dd.MM.yyyy")} • {event.time}
                              </p>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEvent(event.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {events.filter(e => e.date.startsWith(format(selectedDate, "yyyy-MM"))).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nema događaja za ovaj mjesec</p>
                  )}
                </div>
              )}

              {/* Week View */}
              {viewMode === "week" && (
                <div className="space-y-4">
                  {getWeekDates().map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all duration-300 animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <h3 className="font-semibold text-sm mb-3">
                          {format(date, "EEEE, dd.MM.yyyy")}
                        </h3>
                        {dayEvents.length > 0 ? (
                          <div className="space-y-2">
                            {dayEvents.map(event => (
                              <div key={event.id} className="flex items-center gap-2 text-sm group">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: event.color }}
                                />
                                <span className="font-medium">{event.time}</span>
                                <span className="group-hover:text-primary transition-colors">{event.title}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nema događaja</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Day View */}
              {viewMode === "day" && (
                <div className="space-y-3">
                  {getDayEvents()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((event, index) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all duration-300 group animate-scale-in"
                        style={{ animationDelay: `${index * 75}ms` }}
                      >
                        <div 
                          className="w-1 h-full rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary">{event.time}</span>
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                  {event.title}
                                </h3>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEvent(event.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {getDayEvents().length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nema događaja za ovaj dan</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kalendar;
