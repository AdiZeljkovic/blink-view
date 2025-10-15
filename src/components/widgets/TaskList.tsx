import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const initialTasks: Task[] = [
  { id: "1", text: "Pregledati e-poštu", completed: false },
  { id: "2", text: "Završiti projektnu dokumentaciju", completed: false },
  { id: "3", text: "Sastanak sa timom u 14:00", completed: false },
  { id: "4", text: "Ažurirati Homelab setup", completed: true },
];

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="font-mono-heading text-2xl">Današnji Zadaci</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 group">
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
              className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor={task.id}
              className={cn(
                "flex-1 text-base cursor-pointer transition-colors",
                task.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground group-hover:text-primary"
              )}
            >
              {task.text}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
