import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskList = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    if (supabase) {
      loadTasks();
    }
  }, [supabase]);

  const loadTasks = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .is("client_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks((data || []).map((t: any) => ({
        id: t.id,
        text: t.naziv,
        completed: t.completed
      })));
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  const toggleTask = async (id: string) => {
    if (!supabase) return;

    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", id);

      if (error) throw error;

      const updated = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      setTasks(updated);
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "Greška",
        description: "Greška pri ažuriranju zadatka",
        variant: "destructive",
      });
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) {
      toast({
        title: "Upozorenje",
        description: "Unesite tekst zadatka",
        variant: "destructive",
      });
      return;
    }

    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{
          naziv: newTaskText,
          rok: new Date().toISOString().split("T")[0],
          completed: false
        }])
        .select()
        .single();

      if (error) throw error;

      setTasks([{ id: data.id, text: data.naziv, completed: data.completed }, ...tasks]);
      setNewTaskText("");
      toast({
        title: "Uspjeh",
        description: "Zadatak dodan",
      });
    } catch (error) {
      console.error("Failed to add task:", error);
      toast({
        title: "Greška",
        description: "Greška pri dodavanju zadatka",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== id));
      toast({
        title: "Uspjeh",
        description: "Zadatak obrisan",
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Greška",
        description: "Greška pri brisanju zadatka",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="widget-card space-y-5">
      <div className="flex items-center gap-3">
        <CheckSquare className="h-5 w-5 text-primary" />
        <h2 className="font-mono-heading text-xl">Današnji Zadaci</h2>
      </div>

      <div className="flex gap-2">
        <Input
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          placeholder="Dodaj novi zadatak..."
          className="flex-1 text-sm"
        />
        <Button onClick={addTask} size="icon" className="flex-shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="group flex items-start gap-3 py-1 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="mt-0.5 w-4 h-4 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all duration-300"
            />
            <span
              className={`flex-1 text-sm cursor-pointer transition-all duration-300 leading-relaxed ${
                task.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground group-hover:text-primary group-hover:translate-x-1"
              }`}
            >
              {task.text}
            </span>
            <Button
              onClick={() => deleteTask(task.id)}
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-7 w-7 flex-shrink-0"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            Nema zadataka za danas
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskList;
