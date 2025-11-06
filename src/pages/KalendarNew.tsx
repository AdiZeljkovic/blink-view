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
import { useSupabase } from "@/hooks/useSupabase";

interface Event {
  id: string;
  title: string;
  description: string;
  datum: string;
  vrijeme: string;
  color: string;
}

const KalendarNew = () => {
  const { supabase } = useSupabase();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    time: "12:00"
  });

  useEffect(() => {
    if (supabase) {
      loadEvents();
    }
  }, [supabase]);

  const loadEvents = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("datum", { ascending: true });

      if (error) throw error;

      if (data) {
        setEvents(data.map((e: any) => ({
          id: e.id,
          title: e.naslov,
          description: e.tip || "",
          datum: e.datum,
          vrijeme: e.vrijeme || "00:00",
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        })));
      }
    } catch (error) {
      console.error("Error loading calendar events:", error);
      toast.error("Greška pri učitavanju događaja");
    }
  };

  const addEvent = async () => {
    if (!supabase) return;
    if (!newEvent.title.trim()) {
      toast.error("Unesite naziv događaja");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert([{
          naslov: newEvent.title,
          datum: format(selectedDate, "yyyy-MM-dd"),
          vrijeme: newEvent.time,
          tip: newEvent.description || "dogadjaj"
        }])
        .select()
        .single();

      if (error) throw error;

      const newEventObj: Event = {
        id: data.id,
        title: data.naslov,
        description: data.tip || "",
        datum: data.datum,
        vrijeme: data.vrijeme,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      };

      setEvents([...events, newEventObj]);
      setNewEvent({ title: "", description: "", time: "12:00" });
      setIsDialogOpen(false);
      toast.success("Događaj dodan");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Greška pri dodavanju događaja");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEvents(events.filter(e => e.id !== id));
      toast.success("Događaj obrisan");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Greška pri brisanju događaja");
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(e => e.datum === dateStr).sort((a, b) => a.vrijeme.localeCompare(b.vrijeme));
  };

  const getUpcomingEvents = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return events
      .filter(e => e.datum >= today)
      .sort((a, b) => `${a.datum} ${a.vrijeme}`.localeCompare(`${b.datum} ${b.vrijeme}`))
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
                            <span className="text-sm font-bold text-primary">{event.vrijeme}</span>
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
                      onClick={() => setSelectedDate(new Date(event.datum))}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.datum), "dd.MM.yyyy")} • {event.vrijeme}
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
