import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";

const QuickNotes = () => {
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!note.trim()) return;
    
    // In a real app, this would save to a backend
    localStorage.setItem("quick-note", note);
    toast.success("Bilješka sačuvana");
  };

  useState(() => {
    const savedNote = localStorage.getItem("quick-note");
    if (savedNote) setNote(savedNote);
  });

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
