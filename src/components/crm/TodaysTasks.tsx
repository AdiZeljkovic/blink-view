import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, Client } from "@/types/crm";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { isBefore, isToday, parseISO } from "date-fns";

interface TodaysTasksProps {
  tasks: Task[];
  clients: Client[];
}

const TodaysTasks = ({ tasks, clients }: TodaysTasksProps) => {
  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.ime || "Nepoznat";
  };

  const relevantTasks = tasks.filter(t => {
    if (t.completed) return false;
    const dueDate = parseISO(t.rok);
    return isToday(dueDate) || isBefore(dueDate, new Date());
  });

  const overdueTasks = relevantTasks.filter(t => isBefore(parseISO(t.rok), new Date()) && !isToday(parseISO(t.rok)));
  const todayTasks = relevantTasks.filter(t => isToday(parseISO(t.rok)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Današnji Zadaci & Kasni
        </CardTitle>
      </CardHeader>
      <CardContent>
        {relevantTasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nema zadataka za danas ili zakašnjelih
          </p>
        ) : (
          <div className="space-y-3">
            {overdueTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-destructive bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.naziv}</p>
                  <p className="text-xs text-muted-foreground">{getClientName(task.clientId)}</p>
                  <p className="text-xs text-destructive mt-1">Kasni od: {task.rok}</p>
                </div>
              </div>
            ))}
            {todayTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary bg-primary/10">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.naziv}</p>
                  <p className="text-xs text-muted-foreground">{getClientName(task.clientId)}</p>
                  <p className="text-xs text-primary mt-1">Rok: Danas</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysTasks;
