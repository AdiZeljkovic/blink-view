import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface Habit {
  id: string;
  naziv: string;
  completed: { [date: string]: boolean };
}

const HabitsGoals = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const saved = await storage.getJSON<Habit[]>("habits-data");
        if (saved) setHabits(saved);
      } catch (error) {
        console.error("Error loading habits:", error);
      }
    };
    loadHabits();
  }, []);

  const saveHabits = async (newHabits: Habit[]) => {
    setHabits(newHabits);
    try {
      await storage.setJSON("habits-data", newHabits);
    } catch (error) {
      console.error("Error saving habits:", error);
      toast({
        title: "Greška",
        description: "Nije moguće sačuvati navike",
        variant: "destructive",
      });
    }
  };

  const addHabit = async () => {
    if (!newHabit.trim()) {
      toast({
        title: "Upozorenje",
        description: "Unesite naziv navike",
        variant: "destructive",
      });
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      naziv: newHabit,
      completed: {},
    };

    await saveHabits([...habits, habit]);
    setNewHabit("");
    toast({
      title: "Uspjeh",
      description: "Navika je dodana",
    });
  };

  const deleteHabit = async (id: string) => {
    await saveHabits(habits.filter((h) => h.id !== id));
    toast({
      title: "Uspjeh",
      description: "Navika je obrisana",
    });
  };

  const toggleDay = async (habitId: string, date: string) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          completed: {
            ...h.completed,
            [date]: !h.completed[date],
          },
        };
      }
      return h;
    });
    await saveHabits(updated);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("bs-BA", { weekday: "short" }),
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1400px]">
        <h1 className="text-4xl font-bold mb-8">Navike i Ciljevi</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dodaj Novu Naviku</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                placeholder="Npr. Čitanje, Vježbanje, Meditacija..."
                onKeyPress={(e) => e.key === "Enter" && addHabit()}
              />
              <Button onClick={addHabit}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Praćenje Navika (Posljednjih 7 Dana)</CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Dodajte prvu naviku da počnete sa praćenjem
              </div>
            ) : (
              <div className="space-y-6">
                {habits.map((habit) => (
                  <div key={habit.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">{habit.naziv}</h3>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteHabit(habit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {last7Days.map((day) => (
                        <div key={day.date} className="flex flex-col items-center gap-2">
                          <span className="text-xs text-muted-foreground">{day.label}</span>
                          <div
                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                              habit.completed[day.date]
                                ? "bg-primary border-primary"
                                : "border-border hover:border-primary"
                            }`}
                            onClick={() => toggleDay(habit.id, day.date)}
                          >
                            {habit.completed[day.date] && (
                              <Checkbox checked={true} className="pointer-events-none" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Streak:{" "}
                      {Object.values(habit.completed).filter(Boolean).length} dana
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HabitsGoals;
