import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const AdminBoards = () => {
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("kanban-columns");
    if (saved) setColumns(JSON.parse(saved));
  }, []);

  const addColumn = () => {
    const newColumn = {
      id: Date.now().toString(),
      title: "Nova Kolona",
      tasks: []
    };
    const updated = [...columns, newColumn];
    setColumns(updated);
    localStorage.setItem("kanban-columns", JSON.stringify(updated));
    toast.success("Kolona dodana");
  };

  const updateColumnTitle = (id: string, title: string) => {
    const updated = columns.map(c => 
      c.id === id ? { ...c, title } : c
    );
    setColumns(updated);
    localStorage.setItem("kanban-columns", JSON.stringify(updated));
  };

  const deleteColumn = (id: string) => {
    const updated = columns.filter(c => c.id !== id);
    setColumns(updated);
    localStorage.setItem("kanban-columns", JSON.stringify(updated));
    toast.success("Kolona obrisana");
  };

  const addTask = (columnId: string) => {
    const newTask = {
      id: Date.now().toString(),
      title: "",
      description: "",
      priority: "medium",
      labels: [],
      createdAt: new Date().toISOString()
    };
    const updated = columns.map(c => 
      c.id === columnId ? { ...c, tasks: [...c.tasks, newTask] } : c
    );
    setColumns(updated);
    localStorage.setItem("kanban-columns", JSON.stringify(updated));
  };

  const updateTask = (columnId: string, taskId: string, field: string, value: any) => {
    const updated = columns.map(c => {
      if (c.id === columnId) {
        return {
          ...c,
          tasks: c.tasks.map((t: any) => 
            t.id === taskId ? { ...t, [field]: value } : t
          )
        };
      }
      return c;
    });
    setColumns(updated);
    localStorage.setItem("kanban-columns", JSON.stringify(updated));
  };

  const deleteTask = (columnId: string, taskId: string) => {
    const updated = columns.map(c => {
      if (c.id === columnId) {
        return {
          ...c,
          tasks: c.tasks.filter((t: any) => t.id !== taskId)
        };
      }
      return c;
    });
    setColumns(updated);
    localStorage.setItem("kanban-columns", JSON.stringify(updated));
    toast.success("Task obrisan");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upravljanje Kanban Boardom</CardTitle>
              <CardDescription>Dodajte, uredite ili obrišite kolone i taskove</CardDescription>
            </div>
            <Button onClick={addColumn} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Kolona
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {columns.map((column) => (
          <Card key={column.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Input
                  value={column.title}
                  onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                  className="text-lg font-semibold max-w-xs"
                />
                <div className="flex gap-2">
                  <Button onClick={() => addTask(column.id)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj Task
                  </Button>
                  <Button
                    onClick={() => deleteColumn(column.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {column.tasks.map((task: any) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Naslov</Label>
                    <Input
                      value={task.title}
                      onChange={(e) => updateTask(column.id, task.id, "title", e.target.value)}
                      placeholder="Naslov taska"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opis</Label>
                    <Textarea
                      value={task.description}
                      onChange={(e) => updateTask(column.id, task.id, "description", e.target.value)}
                      placeholder="Opis taska"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Prioritet</Label>
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(column.id, task.id, "priority", e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3"
                      >
                        <option value="low">Nizak</option>
                        <option value="medium">Srednji</option>
                        <option value="high">Visok</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Labele (odvojene zarezom)</Label>
                      <Input
                        value={task.labels.join(", ")}
                        onChange={(e) => updateTask(column.id, task.id, "labels", e.target.value.split(",").map((l: string) => l.trim()))}
                        placeholder="bug, feature"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteTask(column.id, task.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Obriši Task
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBoards;
