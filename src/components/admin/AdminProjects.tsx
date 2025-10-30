import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, FolderKanban, CheckCircle2, Play } from "lucide-react";
import { Project, ProjectTask } from "@/types/crm";
import { useNavigate } from "react-router-dom";

interface AdminProjectsProps {
  clientId: string;
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
}

export const AdminProjects = ({ clientId, projects, onUpdate }: AdminProjectsProps) => {
  const navigate = useNavigate();
  const [newProject, setNewProject] = useState<Partial<Project>>({
    naziv: "",
    status: "planirano",
    budzet: 0,
    zadaci: [],
  });
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Partial<ProjectTask>>({
    naziv: "",
    opis: "",
  });

  const addProject = () => {
    if (newProject.naziv) {
      const project: Project = {
        id: Date.now().toString(),
        clientId,
        naziv: newProject.naziv,
        status: newProject.status as any,
        budzet: newProject.budzet || 0,
        rok: newProject.rok,
        datumPocetka: new Date().toISOString().split("T")[0],
        zadaci: [],
      };
      onUpdate([...projects, project]);
      setNewProject({ naziv: "", status: "planirano", budzet: 0, zadaci: [] });
    }
  };

  const updateProjectStatus = (projectId: string, newStatus: Project["status"]) => {
    onUpdate(
      projects.map(p =>
        p.id === projectId ? { ...p, status: newStatus } : p
      )
    );
  };

  const deleteProject = (projectId: string) => {
    onUpdate(projects.filter(p => p.id !== projectId));
  };

  const addTaskToProject = (projectId: string) => {
    if (newTask.naziv) {
      const task: ProjectTask = {
        id: Date.now().toString(),
        projectId,
        naziv: newTask.naziv,
        opis: newTask.opis || "",
        rok: newTask.rok,
        completed: false,
      };
      onUpdate(
        projects.map(p =>
          p.id === projectId
            ? { ...p, zadaci: [...p.zadaci, task] }
            : p
        )
      );
      setNewTask({ naziv: "", opis: "" });
    }
  };

  const toggleTaskComplete = (projectId: string, taskId: string) => {
    onUpdate(
      projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              zadaci: p.zadaci.map(t =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
          : p
      )
    );
  };

  const deleteTask = (projectId: string, taskId: string) => {
    onUpdate(
      projects.map(p =>
        p.id === projectId
          ? { ...p, zadaci: p.zadaci.filter(t => t.id !== taskId) }
          : p
      )
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Novi Projekat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="naziv-projekta">Naziv Projekta</Label>
              <Input
                id="naziv-projekta"
                value={newProject.naziv}
                onChange={(e) => setNewProject({ ...newProject, naziv: e.target.value })}
                placeholder="Web Aplikacija"
              />
            </div>
            <div>
              <Label htmlFor="budzet">Budžet (KM)</Label>
              <Input
                id="budzet"
                type="number"
                value={newProject.budzet}
                onChange={(e) => setNewProject({ ...newProject, budzet: Number(e.target.value) })}
                placeholder="5000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="rok-projekta">Rok</Label>
            <Input
              id="rok-projekta"
              type="date"
              value={newProject.rok}
              onChange={(e) => setNewProject({ ...newProject, rok: e.target.value })}
            />
          </div>
          <Button onClick={addProject} className="w-full">
            Kreiraj Projekat
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{project.naziv}</h4>
                  <p className="text-sm text-muted-foreground">
                    Budžet: {project.budzet} KM
                    {project.rok && ` • Rok: ${project.rok}`}
                  </p>
                </div>
                <Button
                  onClick={() => deleteProject(project.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Select
                value={project.status}
                onValueChange={(value: any) => updateProjectStatus(project.id, value)}
              >
                <SelectTrigger className="mb-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planirano">Planirano</SelectItem>
                  <SelectItem value="u_toku">U toku</SelectItem>
                  <SelectItem value="na_cekanju">Na čekanju</SelectItem>
                  <SelectItem value="zavrseno">Završeno</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() =>
                  setExpandedProject(expandedProject === project.id ? null : project.id)
                }
                variant="outline"
                size="sm"
                className="w-full mb-3"
              >
                {expandedProject === project.id ? "Sakrij" : "Prikaži"} Zadatke ({project.zadaci.length})
              </Button>

              {expandedProject === project.id && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="space-y-2">
                    <Input
                      value={newTask.naziv}
                      onChange={(e) => setNewTask({ ...newTask, naziv: e.target.value })}
                      placeholder="Naziv zadatka"
                    />
                    <Textarea
                      value={newTask.opis}
                      onChange={(e) => setNewTask({ ...newTask, opis: e.target.value })}
                      placeholder="Opis zadatka"
                      rows={2}
                    />
                    <Input
                      type="date"
                      value={newTask.rok}
                      onChange={(e) => setNewTask({ ...newTask, rok: e.target.value })}
                    />
                    <Button
                      onClick={() => addTaskToProject(project.id)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj Zadatak
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {project.zadaci.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-2 p-2 bg-muted rounded"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskComplete(project.id, task.id)}
                        />
                        <div className="flex-1">
                          <p className={task.completed ? "line-through text-muted-foreground" : ""}>
                            {task.naziv}
                          </p>
                          {task.opis && (
                            <p className="text-xs text-muted-foreground">{task.opis}</p>
                          )}
                          {task.rok && (
                            <p className="text-xs text-muted-foreground">Rok: {task.rok}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => {
                            // Store the task info in localStorage for the focus timer
                            localStorage.setItem("focus-timer-task", JSON.stringify({
                              projectId: project.id,
                              projectName: project.naziv,
                              taskId: task.id,
                              taskName: task.naziv,
                            }));
                            navigate("/focus-timer");
                          }}
                          variant="ghost"
                          size="sm"
                          title="Pokreni Fokus Timer"
                        >
                          <Play className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          onClick={() => deleteTask(project.id, task.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
