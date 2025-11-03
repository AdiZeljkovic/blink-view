import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";

const AdminBoards = () => {
  const { supabase } = useSupabase();
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    if (supabase) {
      loadData();
    }
  }, [supabase]);

  const loadData = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .order("pozicija", { ascending: true });

      if (error) throw error;

      if (data) {
        setColumns(data.map((b: any) => ({
          id: b.id,
          title: b.naziv,
          tasks: []
        })));
      }
    } catch (error) {
      console.error("Error loading boards:", error);
      toast.error("Greška pri učitavanju podataka");
    }
  };

  const addColumn = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from("boards")
        .insert([{ naziv: "Nova Kolona", boja: "#3b82f6", pozicija: columns.length }])
        .select()
        .single();

      if (error) throw error;

      setColumns([...columns, { id: data.id, title: data.naziv, tasks: [] }]);
      toast.success("Kolona dodana");
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Greška pri dodavanju kolone");
    }
  };

  const updateColumnTitle = async (id: string, title: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("boards")
        .update({ naziv: title })
        .eq("id", id);

      if (error) throw error;

      setColumns(columns.map(c => c.id === id ? { ...c, title } : c));
    } catch (error) {
      console.error("Error updating column:", error);
    }
  };

  const deleteColumn = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("boards")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setColumns(columns.filter(c => c.id !== id));
      toast.success("Kolona obrisana");
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Greška pri brisanju kolone");
    }
  };

  const addTask = async (columnId: string) => {
    // Tasks are managed in Boards.tsx directly with cards table
    toast.info("Dodajte taskove direktno na Boards stranici");
  };

  const updateTask = async (columnId: string, taskId: string, field: string, value: any) => {
    // Tasks are managed in Boards.tsx directly with cards table
  };

  const deleteTask = async (columnId: string, taskId: string) => {
    // Tasks are managed in Boards.tsx directly with cards table
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
