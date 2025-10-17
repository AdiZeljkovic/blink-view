import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { storage } from "@/lib/storage";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: string;
}

const AdminKalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [widgetTitle, setWidgetTitle] = useState("Kalendar");

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedEvents = await storage.getJSON<Event[]>("calendar-events");
        const savedTitle = localStorage.getItem("kalendar-widget-title");
        
        if (savedEvents) {
          setEvents(savedEvents);
        }
        
        if (savedTitle) setWidgetTitle(savedTitle);
      } catch (error) {
        console.error("Error loading calendar data:", error);
      }
    };
    loadData();
  }, []);

  const addEvent = async () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "12:00",
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    const updated = [...events, newEvent];
    setEvents(updated);
    try {
      await storage.setJSON("calendar-events", updated);
    } catch (error) {
      toast.error("Greška pri dodavanju događaja");
    }
  };

  const updateEvent = async (id: string, field: keyof Event, value: string) => {
    const updated = events.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    );
    setEvents(updated);
    try {
      await storage.setJSON("calendar-events", updated);
    } catch (error) {
      toast.error("Greška pri ažuriranju događaja");
    }
  };

  const deleteEvent = async (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    try {
      await storage.setJSON("calendar-events", updated);
      toast.success("Događaj obrisan");
    } catch (error) {
      toast.error("Greška pri brisanju događaja");
    }
  };

  const saveTitle = () => {
    localStorage.setItem("kalendar-widget-title", widgetTitle);
    toast.success("Naslov sačuvan");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Postavke Stranice</CardTitle>
          <CardDescription>Uredite osnovne postavke Kalendar stranice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Naslov Stranice</Label>
            <Input
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              placeholder="Kalendar"
            />
          </div>
          <Button onClick={saveTitle}>Sačuvaj</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Događaji</CardTitle>
              <CardDescription>Dodajte, uredite ili obrišite događaje u kalendaru</CardDescription>
            </div>
            <Button onClick={addEvent} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj Događaj
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {events
            .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
            .map((event) => (
            <div key={event.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Naziv</Label>
                  <Input
                    value={event.title}
                    onChange={(e) => updateEvent(event.id, "title", e.target.value)}
                    placeholder="Sastanak, termin..."
                  />
                </div>
                <div>
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={event.date}
                    onChange={(e) => updateEvent(event.id, "date", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Vrijeme</Label>
                  <Input
                    type="time"
                    value={event.time}
                    onChange={(e) => updateEvent(event.id, "time", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Boja</Label>
                  <Input
                    type="color"
                    value={event.color.startsWith('#') ? event.color : '#3b82f6'}
                    onChange={(e) => updateEvent(event.id, "color", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea
                  value={event.description}
                  onChange={(e) => updateEvent(event.id, "description", e.target.value)}
                  placeholder="Detalji događaja..."
                  rows={2}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(event.date), "dd.MM.yyyy")} u {event.time}
                </span>
                <Button
                  onClick={() => deleteEvent(event.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Obriši
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminKalendar;
