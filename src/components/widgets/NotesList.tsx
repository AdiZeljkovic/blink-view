import { useState, useEffect } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSupabase } from "@/hooks/useSupabase";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

const NotesList = () => {
  const { supabase } = useSupabase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    if (supabase) {
      loadNotes();
    }

    // Listen for custom event when new note is added
    const handleNotesUpdate = () => {
      loadNotes();
    };

    window.addEventListener("notesUpdated", handleNotesUpdate);

    return () => {
      window.removeEventListener("notesUpdated", handleNotesUpdate);
    };
  }, [supabase]);

  const loadNotes = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotes((data || []).map((n: any) => ({
        id: n.id,
        content: n.sadrzaj,
        createdAt: n.created_at,
      })));
    } catch (error) {
      console.error("Failed to load notes:", error);
      toast.error("Greška pri učitavanju bilješki");
    }
  };

  const deleteNote = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotes(notes.filter(n => n.id !== id));
      setSelectedNote(null);
      toast.success("Bilješka obrisana");
      window.dispatchEvent(new Event("notesUpdated"));
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Greška pri brisanju bilješke");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("bs-BA", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <div className="widget-card">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-mono-heading">Moje Bilješke</h2>
        </div>

        <div className="space-y-2">
          {notes.map((note, index) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="group p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <p className="text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300">
                {note.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDate(note.createdAt)}
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-7 w-7"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-8 bg-muted/30 rounded-lg">
              Nemate sačuvanih bilješki
            </p>
          )}
        </div>
      </div>

      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bilješka</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {formatDate(selectedNote.createdAt)}
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {selectedNote.content}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => deleteNote(selectedNote.id)}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Obriši Bilješku
                </Button>
                <Button onClick={() => setSelectedNote(null)} variant="outline">
                  Zatvori
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesList;