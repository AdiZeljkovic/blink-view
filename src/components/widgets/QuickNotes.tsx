import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <h2 className="font-mono-heading text-2xl">Brze Bilješke</h2>
      
      <div className="space-y-4">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Zapiši bilo šta..."
          className="min-h-[120px] resize-none border-border bg-card focus-visible:ring-primary"
        />
        <Button 
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          Sačuvaj
        </Button>
      </div>
    </div>
  );
};

export default QuickNotes;
