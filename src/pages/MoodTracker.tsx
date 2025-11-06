import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

interface MoodEntry {
  datum: string;
  mood: string;
  emoji: string;
}

const MOODS = [
  { name: "Veoma sretan", emoji: "😄", value: "veoma-sretan" },
  { name: "Sretan", emoji: "🙂", value: "sretan" },
  { name: "Neutralno", emoji: "😐", value: "neutralno" },
  { name: "Tužan", emoji: "😕", value: "tuzan" },
  { name: "Veoma tužan", emoji: "😞", value: "veoma-tuzan" },
];

const MoodTracker = () => {
  const { supabase } = useSupabase();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (supabase) {
      loadEntries();
    }
  }, [supabase]);

  const loadEntries = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .order("datum", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((e: any) => ({
        datum: e.datum,
        mood: e.mood,
        emoji: e.emoji,
      }));
      
      setEntries(mapped);
      const todayEntry = mapped.find((e: MoodEntry) => e.datum === today);
      if (todayEntry) setTodayMood(todayEntry.mood);
    } catch (error) {
      console.error("Error loading mood entries:", error);
    }
  };

  const saveMood = async (moodValue: string, emoji: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("mood_entries")
        .upsert(
          {
            datum: today,
            mood: moodValue,
            emoji: emoji,
          },
          { onConflict: 'datum,user_id' }
        );

      if (error) throw error;

      setTodayMood(moodValue);
      loadEntries();
      toast({
        title: "Uspjeh",
        description: "Raspoloženje je zabilježeno",
      });
    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Greška",
        description: "Nije moguće zabilježiti raspoloženje",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1000px]">
        <h1 className="text-4xl font-bold mb-8 text-center">Mood Tracker</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Kako se osjećaš danas?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 flex-wrap">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => saveMood(mood.value, mood.emoji)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:scale-110 ${
                    todayMood === mood.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <span className="text-5xl mb-2">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Povijest Raspoloženja</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Još nema zabilježenih raspoloženja
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.datum}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(entry.datum).toLocaleDateString("bs-BA", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {MOODS.find((m) => m.value === entry.mood)?.name}
                      </p>
                    </div>
                    <span className="text-4xl">{entry.emoji}</span>
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

export default MoodTracker;