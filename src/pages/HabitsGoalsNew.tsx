import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Habit {
  id: string;
  naziv: string;
  grupa: string;
  completions: string[];
}

const HabitsGoalsNew = () => {
  const { supabase } = useSupabase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("zdravlje");
  const [groups] = useState(["zdravlje", "posao", "učenje", "sport", "ostalo"]);
  const { toast } = useToast();

  useEffect(() => {
    if (supabase) {
      loadHabits();
    }
  }, [supabase]);

  const loadHabits = async () => {
    if (!supabase) return;

    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false });

      if (habitsError) throw habitsError;

      if (habitsData) {
        // Load completions for each habit
        const habitsWithCompletions = await Promise.all(
          habitsData.map(async (h: any) => {
            const { data: completions, error: compError } = await supabase
              .from("habit_completions")
              .select("datum")
              .eq("habit_id", h.id);

            if (compError) console.error("Error loading completions:", compError);

            return {
              id: h.id,
              naziv: h.naziv,
              grupa: "ostalo", // We don't store grupa in the database yet
              completions: completions ? completions.map((c: any) => c.datum) : []
            };
          })
        );

        setHabits(habitsWithCompletions);
      }
    } catch (error) {
      console.error("Error loading habits:", error);
    }
  };

  const addHabit = async () => {
    if (!supabase) return;
    if (!newHabit.trim()) {
      toast({ title: "Upozorenje", description: "Unesite naziv navike", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("habits")
        .insert([{ naziv: newHabit, ciljna_frekvencija: 7 }])
        .select()
        .single();

      if (error) throw error;

      setHabits([...habits, {
        id: data.id,
        naziv: data.naziv,
        grupa: selectedGroup,
        completions: []
      }]);
      setNewHabit("");
      toast({ title: "Uspjeh", description: "Navika je dodana" });
    } catch (error) {
      console.error("Error adding habit:", error);
      toast({ title: "Greška", description: "Nije moguće dodati naviku", variant: "destructive" });
    }
  };

  const deleteHabit = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHabits(habits.filter((h) => h.id !== id));
      toast({ title: "Uspjeh", description: "Navika je obrisana" });
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast({ title: "Greška", description: "Nije moguće obrisati naviku", variant: "destructive" });
    }
  };

  const toggleDay = async (habitId: string, date: string) => {
    if (!supabase) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completions.includes(date);

    try {
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", habitId)
          .eq("datum", date);

        if (error) throw error;

        setHabits(habits.map(h =>
          h.id === habitId
            ? { ...h, completions: h.completions.filter(d => d !== date) }
            : h
        ));
      } else {
        // Add completion
        const { error } = await supabase
          .from("habit_completions")
          .insert([{ habit_id: habitId, datum: date }]);

        if (error) throw error;

        setHabits(habits.map(h =>
          h.id === habitId
            ? { ...h, completions: [...h.completions, date] }
            : h
        ));
      }
    } catch (error) {
      console.error("Error toggling day:", error);
      toast({ title: "Greška", description: "Nije moguće ažurirati naviku", variant: "destructive" });
    }
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
      if (habit.completions.includes(dateStr)) {
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
        return sum + getLast7Days().filter(d => h.completions.includes(d.date)).length;
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
                                  habit.completions.includes(day.date)
                                    ? "bg-primary border-primary shadow-glow-sm"
                                    : "border-border hover:border-primary/40"
                                }`}
                                onClick={() => toggleDay(habit.id, day.date)}
                              >
                                {habit.completions.includes(day.date) && (
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
