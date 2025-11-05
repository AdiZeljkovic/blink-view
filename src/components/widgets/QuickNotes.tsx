import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

const QuickNotes = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [note, setNote] = useState("");

  const handleSave = async () => {
    if (!note.trim()) {
      toast({
        title: "Upozorenje",
        description: "Bilješka ne može biti prazna",
        variant: "destructive",
      });
      return;
    }
    
    if (!supabase) {
      toast({
        title: "Greška",
        description: "Supabase nije konfigurisan",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("notes")
        .insert([{
          sadrzaj: note
        }]);

      if (error) throw error;
      
      setNote("");
      toast({
        title: "Uspjeh",
        description: "Bilješka sačuvana",
      });
      
      // Dispatch custom event to notify NotesList widget
      window.dispatchEvent(new Event("notesUpdated"));
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        title: "Greška",
        description: "Greška pri čuvanju bilješke",
        variant: "destructive",
      });
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
