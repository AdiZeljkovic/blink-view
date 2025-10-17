import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

const QuickNotes = () => {
  const [note, setNote] = useState("");

  const handleSave = async () => {
    if (!note.trim()) {
      toast.error("Bilješka ne može biti prazna");
      return;
    }
    
    try {
      // Get existing notes
      const notes: Note[] = await storage.getJSON<Note[]>("quick-notes-list") || [];
      
      // Add new note
      const newNote: Note = {
        id: Date.now().toString(),
        content: note,
        createdAt: new Date().toISOString()
      };
      
      notes.unshift(newNote); // Add to beginning
      
      // Save to storage
      await storage.setJSON("quick-notes-list", notes);
      
      // Clear the textarea
      setNote("");
      
      toast.success("Bilješka sačuvana");
      
      // Dispatch custom event to notify NotesList widget
      window.dispatchEvent(new Event("notesUpdated"));
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Greška pri čuvanju bilješke. Provjerite Supabase vezu.");
    }
  };

  return (
    <div className="widget-card space-y-5">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="font-mono-heading text-xl">Dodaj Novu Bilješku</h2>
      </div>
      
      <div className="space-y-3">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Zapiši bilo šta..."
          className="min-h-[150px] resize-none border-border bg-background text-sm focus-visible:ring-primary"
        />
        <Button 
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm"
        >
          Sačuvaj
        </Button>
      </div>
    </div>
  );
};

export default QuickNotes;
