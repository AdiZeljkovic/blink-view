import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useSupabase } from "@/hooks/useSupabase";
import { Calendar, Briefcase, CheckSquare, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AggregatedTask {
  id: string;
  naziv: string;
  source: "calendar" | "crm" | "project" | "habit" | "manual";
  completed: boolean;
  priority?: string;
  clientName?: string;
}

const MyDayWidget = () => {
  const { supabase } = useSupabase();
  const [tasks, setTasks] = useState<AggregatedTask[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (supabase) {
      loadAllTasks();
    }
  }, [supabase]);

  const loadAllTasks = async () => {
    if (!supabase) return;

    const today = new Date().toISOString().split("T")[0];
    const allTasks: AggregatedTask[] = [];

    try {
      // Calendar events
      const { data: calendarEvents } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("datum", today);

      (calendarEvents || []).forEach(e => allTasks.push({
        id: `cal-${e.id}`,
        naziv: e.naslov,
        source: "calendar",
        completed: false,
      }));

      // CRM tasks
      const { data: crmTasks } = await supabase
        .from("tasks")
        .select("*, clients(ime)")
        .eq("rok", today)
        .not("completed", "eq", true);

      (crmTasks || []).forEach((t: any) => {
        allTasks.push({
          id: `crm-${t.id}`,
          naziv: t.naziv,
          source: "crm",
          completed: t.completed,
          clientName: t.clients?.ime,
        });
      });

      // Habits
      const { data: habits } = await supabase
        .from("habits")
        .select("*");

      const { data: habitCompletions } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("datum", today);

      (habits || []).forEach((habit: any) => {
        const completedToday = (habitCompletions || []).some(
          (c: any) => c.habit_id === habit.id
        );
        if (!completedToday) {
          allTasks.push({
            id: `habit-${habit.id}`,
            naziv: habit.naziv,
            source: "habit",
            completed: false,
          });
        }
      });

      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "calendar": return <Calendar className="h-3 w-3" />;
      case "crm": return <Briefcase className="h-3 w-3" />;
      case "project": return <CheckSquare className="h-3 w-3" />;
      case "habit": return <Target className="h-3 w-3" />;
      default: return <CheckSquare className="h-3 w-3" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "calendar": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "crm": return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "project": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "habit": return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const toggleTask = async (taskId: string) => {
    // This would need more sophisticated logic to update the actual source
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            Moj Dan
          </span>
          <Badge variant="secondary">
            {completedCount}/{totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nema zadataka za danas 🎉
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.naziv}
                  </p>
                  {task.clientName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Klijent: {task.clientName}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className={`shrink-0 ${getSourceColor(task.source)}`}>
                  {getSourceIcon(task.source)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyDayWidget;