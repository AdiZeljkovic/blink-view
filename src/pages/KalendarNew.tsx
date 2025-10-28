import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Clock, Trash2, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const KalendarNew = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    time: "12:00"
  });

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
      date: format(selectedDate, "yyyy-MM-dd"),
      time: newEvent.time,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    await saveEvents([...events, event]);
    setNewEvent({ title: "", description: "", time: "12:00" });
    setIsDialogOpen(false);
    toast.success("Događaj dodan");
  };

  const deleteEvent = async (id: string) => {
    await saveEvents(events.filter(e => e.id !== id));
    toast.success("Događaj obrisan");
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getUpcomingEvents = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return events
      .filter(e => e.date >= today)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .slice(0, 10);
  };

  const selectedDayEvents = getEventsForDate(selectedDate);
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold font-display">Kalendar</h1>
          </div>
          
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-glow-md">
            <Plus className="w-4 h-4" />
            Dodaj Događaj
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left - Calendar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl border border-border shadow-lg animate-scale-in">
              <h2 className="text-lg font-display font-semibold mb-4">Odaberi Datum</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl"
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

          {/* Middle - Selected Day Events */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl border border-border shadow-lg animate-scale-in h-full">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-semibold">
                  {format(selectedDate, "EEEE, dd. MMMM", { locale: bs })}
                </h2>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nema događaja za ovaj dan</p>
                ) : (
                  selectedDayEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="group p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-glow-sm transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-1 h-full rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-primary">{event.time}</span>
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right - Upcoming Events */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl border border-border shadow-lg animate-scale-in h-full">
              <h2 className="text-lg font-display font-semibold mb-4">Nadolazeći Događaji</h2>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {upcomingEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nema nadolazećih događaja</p>
                ) : (
                  upcomingEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="group p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-glow-sm transition-all duration-300 cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setSelectedDate(new Date(event.date))}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.date), "dd.MM.yyyy")} • {event.time}
                          </p>
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">Novi Događaj</DialogTitle>
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
              <Label htmlFor="time">Vrijeme (HH:MM)</Label>
              <Input
                id="time"
                type="text"
                placeholder="15:34"
                value={newEvent.time}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[0-9:]*$/.test(value)) {
                    setNewEvent({ ...newEvent, time: value });
                  }
                }}
                className="font-mono"
              />
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
              <strong>Odabrani datum:</strong> {format(selectedDate, "EEEE, dd. MMMM yyyy", { locale: bs })}
            </div>
            <div className="flex gap-2">
              <Button onClick={addEvent} className="flex-1">
                Sačuvaj
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Otkaži
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KalendarNew;
