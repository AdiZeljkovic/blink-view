import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await storage.getJSON<Task[]>("task-list");
        if (savedTasks) {
          setTasks(savedTasks);
        }
      } catch (error) {
        console.error("Failed to load tasks:", error);
        toast.error("Greška pri učitavanju zadataka");
      }
    };
    loadTasks();
  }, []);

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      setTasks(updatedTasks);
      await storage.setJSON("task-list", updatedTasks);
    } catch (error) {
      console.error("Failed to save tasks:", error);
      toast.error("Greška pri čuvanju zadataka. Provjerite Supabase vezu.");
    }
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updated);
  };

  const addTask = () => {
    if (!newTaskText.trim()) {
      toast.error("Unesite tekst zadatka");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false
    };

    saveTasks([...tasks, newTask]);
    setNewTaskText("");
    toast.success("Zadatak dodan");
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
    toast.success("Zadatak obrisan");
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
