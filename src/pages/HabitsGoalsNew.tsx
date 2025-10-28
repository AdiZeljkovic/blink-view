import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Habit {
  id: string;
  naziv: string;
  grupa: string;
  completed: { [date: string]: boolean };
}

const HabitsGoalsNew = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("zdravlje");
  const [groups] = useState(["zdravlje", "posao", "učenje", "sport", "ostalo"]);
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
      toast({ title: "Greška", description: "Nije moguće sačuvati navike", variant: "destructive" });
    }
  };

  const addHabit = async () => {
    if (!newHabit.trim()) {
      toast({ title: "Upozorenje", description: "Unesite naziv navike", variant: "destructive" });
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      naziv: newHabit,
      grupa: selectedGroup,
      completed: {},
    };

    await saveHabits([...habits, habit]);
    setNewHabit("");
    toast({ title: "Uspjeh", description: "Navika je dodana" });
  };

  const deleteHabit = async (id: string) => {
    await saveHabits(habits.filter((h) => h.id !== id));
    toast({ title: "Uspjeh", description: "Navika je obrisana" });
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

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (habit.completed[dateStr]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getGroupStats = () => {
    return groups.map(group => {
      const groupHabits = habits.filter(h => h.grupa === group);
      const total = groupHabits.length * 7;
      const completed = groupHabits.reduce((sum, h) => {
        return sum + getLast7Days().filter(d => h.completed[d.date]).length;
      }, 0);
      return {
        grupa: group.charAt(0).toUpperCase() + group.slice(1),
        procenat: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  };

  const last7Days = getLast7Days();
  const groupedHabits = groups.map(group => ({
    group,
    habits: habits.filter(h => h.grupa === group)
  })).filter(g => g.habits.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1600px]">
        <h1 className="text-4xl font-bold font-display mb-8">Navike i Ciljevi</h1>

        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="tracker" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Praćenje
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Statistika
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="animate-fade-in">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-display">Dodaj Novu Naviku</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="Npr. Čitanje, Vježbanje, Meditacija..."
                    onKeyPress={(e) => e.key === "Enter" && addHabit()}
                    className="flex-1"
                  />
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(g => (
                        <SelectItem key={g} value={g}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addHabit} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Dodaj
                  </Button>
                </div>
              </CardContent>
            </Card>

            {groupedHabits.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  Dodajte prvu naviku da počnete sa praćenjem
                </CardContent>
              </Card>
            ) : (
              groupedHabits.map(({ group, habits: groupHabits }) => (
                <Card key={group} className="mb-6">
                  <CardHeader>
                    <CardTitle className="font-display text-primary">
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {groupHabits.map((habit) => (
                      <div key={habit.id} className="border border-border rounded-xl p-4 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{habit.naziv}</h3>
                            <p className="text-sm text-muted-foreground">
                              Streak: {getStreak(habit)} dana 🔥
                            </p>
                          </div>
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
                                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                                  habit.completed[day.date]
                                    ? "bg-primary border-primary shadow-glow-sm"
                                    : "border-border hover:border-primary/40"
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
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Statistika po Grupama</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getGroupStats()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grupa" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="procenat" name="Uspješnost (%)">
                      {getGroupStats().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 70}, 70%, 50%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HabitsGoalsNew;
