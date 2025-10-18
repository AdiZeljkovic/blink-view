import { useState, useEffect } from "react";
import { LayoutGrid, Plus, Trash2, GripVertical, Tag, Clock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  label: string;
  columnId: string;
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
}

const defaultColumns: Column[] = [
  { id: "todo", title: "Za Uraditi", color: "hsl(0, 0%, 60%)" },
  { id: "in-progress", title: "U Toku", color: "hsl(221, 100%, 50%)" },
  { id: "review", title: "Pregled", color: "hsl(45, 100%, 50%)" },
  { id: "done", title: "Završeno", color: "hsl(142, 76%, 36%)" },
];

const priorityColors = {
  low: "hsl(142, 76%, 36%)",
  medium: "hsl(45, 100%, 50%)",
  high: "hsl(0, 84%, 60%)",
};

const Boards = () => {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("todo");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    label: "",
  });

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTasks = await storage.getJSON<Task[]>("kanban-tasks");
        const savedColumns = await storage.getJSON<Column[]>("kanban-columns");
        
        if (savedTasks) {
          setTasks(savedTasks);
        }
        if (savedColumns) {
          setColumns(savedColumns);
        }
      } catch (error) {
        console.error("Error loading kanban data:", error);
        toast.error("Greška pri učitavanju podataka");
      }
    };
    loadData();
  }, []);

  // Save tasks
  const saveTasks = async (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    await storage.setJSON("kanban-tasks", updatedTasks);
  };

  // Save columns
  const saveColumns = async (updatedColumns: Column[]) => {
    setColumns(updatedColumns);
    await storage.setJSON("kanban-columns", updatedColumns);
  };

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Unesite naziv zadatka");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      label: newTask.label,
      columnId: selectedColumn,
      createdAt: new Date().toISOString(),
    };

    saveTasks([...tasks, task]);
    setNewTask({ title: "", description: "", priority: "medium", label: "" });
    setIsDialogOpen(false);
    toast.success("Zadatak dodan");
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const updateTask = () => {
    if (!editingTask || !editingTask.title.trim()) {
      toast.error("Unesite naziv zadatka");
      return;
    }

    const updated = tasks.map(t => 
      t.id === editingTask.id ? editingTask : t
    );
    saveTasks(updated);
    setIsEditDialogOpen(false);
    setEditingTask(null);
    toast.success("Zadatak ažuriran");
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
    toast.success("Zadatak obrisan");
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (!draggedTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id === draggedTask ? { ...task, columnId } : task
    );
    saveTasks(updatedTasks);
    setDraggedTask(null);
    toast.success("Zadatak pomjeren");
  };

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter((task) => task.columnId === columnId);
  };

  const addColumn = () => {
    const title = prompt("Unesite naziv kolone:");
    if (!title?.trim()) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      title: title.trim(),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };

    saveColumns([...columns, newColumn]);
    toast.success("Kolona dodana");
  };

  const deleteColumn = (columnId: string) => {
    if (columns.length <= 1) {
      toast.error("Mora ostati bar jedna kolona");
      return;
    }

    const tasksInColumn = getTasksByColumn(columnId);
    if (tasksInColumn.length > 0) {
      toast.error("Kolona nije prazna. Prvo premjestite sve zadatke.");
      return;
    }

    saveColumns(columns.filter((col) => col.id !== columnId));
    toast.success("Kolona obrisana");
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Boards</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={addColumn} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Kolona
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novi Zadatak
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novi Zadatak</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="column">Kolona</Label>
                    <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                      <SelectTrigger id="column">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Naziv</Label>
                    <Input
                      id="title"
                      placeholder="Implementacija feature-a..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Opis</Label>
                    <Textarea
                      id="description"
                      placeholder="Detalji zadatka..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioritet</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: Task["priority"]) =>
                          setNewTask({ ...newTask, priority: value })
                        }
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Nizak</SelectItem>
                          <SelectItem value="medium">Srednji</SelectItem>
                          <SelectItem value="high">Visok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        placeholder="Feature, Bug, Design..."
                        value={newTask.label}
                        onChange={(e) => setNewTask({ ...newTask, label: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={addTask} className="w-full">
                    Dodaj Zadatak
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Uredi Zadatak</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Naziv Zadatka</Label>
                  <Input
                    id="edit-title"
                    placeholder="Naziv zadatka..."
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Opis</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Detaljan opis zadatka..."
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Prioritet</Label>
                    <Select
                      value={editingTask.priority}
                      onValueChange={(value: Task["priority"]) =>
                        setEditingTask({ ...editingTask, priority: value })
                      }
                    >
                      <SelectTrigger id="edit-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Nizak</SelectItem>
                        <SelectItem value="medium">Srednji</SelectItem>
                        <SelectItem value="high">Visok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-label">Label</Label>
                    <Input
                      id="edit-label"
                      placeholder="Feature, Bug..."
                      value={editingTask.label}
                      onChange={(e) => setEditingTask({ ...editingTask, label: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={updateTask} className="flex-1">
                    Sačuvaj Izmjene
                  </Button>
                  <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1">
                    Otkaži
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column, colIndex) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 animate-fade-in"
              style={{ animationDelay: `${colIndex * 100}ms` }}
            >
              <div className="widget-card">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h2 className="font-mono-heading text-lg">{column.title}</h2>
                    <span className="text-xs text-muted-foreground">
                      ({getTasksByColumn(column.id).length})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteColumn(column.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Drop Zone */}
                <div
                  className={cn(
                    "min-h-[500px] space-y-3 p-2 rounded-lg transition-colors",
                    draggedTask && "bg-muted/50"
                  )}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                >
                  {getTasksByColumn(column.id).map((task, taskIndex) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onClick={() => openEditDialog(task)}
                      className="group cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${taskIndex * 50}ms` }}
                    >
                      <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                        {/* Task Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {task.title}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Task Metadata */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {task.label && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                                <Tag className="w-3 h-3" />
                                {task.label}
                              </div>
                            )}
                            <div
                              className="px-2 py-1 rounded-md text-xs font-medium text-white"
                              style={{ backgroundColor: priorityColors[task.priority] }}
                            >
                              {task.priority === "low" && "Nizak"}
                              {task.priority === "medium" && "Srednji"}
                              {task.priority === "high" && "Visok"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(task.createdAt).toLocaleDateString("bs-BA")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {getTasksByColumn(column.id).length === 0 && (
                    <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                      Prevucite zadatke ovdje
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="widget-card">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{tasks.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Ukupno Zadataka</p>
            </div>
          </div>
          <div className="widget-card">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {tasks.filter((t) => t.priority === "high").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Visok Prioritet</p>
            </div>
          </div>
          <div className="widget-card">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {getTasksByColumn("in-progress").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">U Toku</p>
            </div>
          </div>
          <div className="widget-card">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {getTasksByColumn("done").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Završeno</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Boards;
