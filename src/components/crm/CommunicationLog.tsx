import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CommunicationEntry } from "@/types/crm";
import { MessageSquare, Phone, Mail, Users, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { sr } from "date-fns/locale";

interface CommunicationLogProps {
  clientId: string;
  entries: CommunicationEntry[];
  onAddEntry: (entry: Omit<CommunicationEntry, "id">) => void;
}

const CommunicationLog = ({ clientId, entries, onAddEntry }: CommunicationLogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    datum: new Date().toISOString().split("T")[0],
    tip: "email" as CommunicationEntry["tip"],
    sazetak: "",
  });

  const handleSubmit = () => {
    if (!formData.sazetak) return;
    
    onAddEntry({
      clientId,
      datum: formData.datum,
      tip: formData.tip,
      sazetak: formData.sazetak,
    });

    setFormData({
      datum: new Date().toISOString().split("T")[0],
      tip: "email",
      sazetak: "",
    });
    setOpen(false);
  };

  const getIcon = (tip: CommunicationEntry["tip"]) => {
    switch (tip) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "poziv":
        return <Phone className="h-4 w-4" />;
      case "sastanak":
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (tip: CommunicationEntry["tip"]) => {
    switch (tip) {
      case "email":
        return "Email";
      case "poziv":
        return "Poziv";
      case "sastanak":
        return "Sastanak";
    }
  };

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.datum).getTime() - new Date(a.datum).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Dnevnik Komunikacije
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novi Unos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Komunikacija</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="datum">Datum</Label>
                  <Input
                    id="datum"
                    type="date"
                    value={formData.datum}
                    onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tip">Tip Komunikacije</Label>
                  <Select
                    value={formData.tip}
                    onValueChange={(v) => setFormData({ ...formData, tip: v as CommunicationEntry["tip"] })}
                  >
                    <SelectTrigger id="tip">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="poziv">Poziv</SelectItem>
                      <SelectItem value="sastanak">Sastanak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sazetak">Sažetak</Label>
                  <Textarea
                    id="sazetak"
                    value={formData.sazetak}
                    onChange={(e) => setFormData({ ...formData, sazetak: e.target.value })}
                    placeholder="Opišite komunikaciju..."
                    rows={4}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Dodaj Unos
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedEntries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nema evidencije komunikacije
          </p>
        ) : (
          <div className="space-y-4">
            {sortedEntries.map(entry => (
              <div key={entry.id} className="flex gap-3 p-4 rounded-lg border border-border">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getIcon(entry.tip)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{getTypeLabel(entry.tip)}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(entry.datum), "d MMM yyyy", { locale: sr })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.sazetak}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunicationLog;
