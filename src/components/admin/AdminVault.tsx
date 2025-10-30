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
import { Plus, Trash2, Lock, Eye, EyeOff } from "lucide-react";
import { VaultEntry } from "@/types/crm";

interface AdminVaultProps {
  clientId: string;
  vaultEntries: VaultEntry[];
  onUpdate: (entries: VaultEntry[]) => void;
}

export const AdminVault = ({ clientId, vaultEntries, onUpdate }: AdminVaultProps) => {
  const [newEntry, setNewEntry] = useState<Partial<VaultEntry>>({
    tip: "login",
    naziv: "",
    vrijednost: "",
    dodatneInformacije: "",
  });
  const [visibleEntries, setVisibleEntries] = useState<Set<string>>(new Set());

  const addEntry = () => {
    if (newEntry.naziv && newEntry.vrijednost) {
      const entry: VaultEntry = {
        id: Date.now().toString(),
        clientId,
        tip: newEntry.tip as any,
        naziv: newEntry.naziv,
        vrijednost: newEntry.vrijednost,
        dodatneInformacije: newEntry.dodatneInformacije,
      };
      onUpdate([...vaultEntries, entry]);
      setNewEntry({ tip: "login", naziv: "", vrijednost: "", dodatneInformacije: "" });
    }
  };

  const deleteEntry = (entryId: string) => {
    onUpdate(vaultEntries.filter(e => e.id !== entryId));
  };

  const toggleVisibility = (entryId: string) => {
    const newVisible = new Set(visibleEntries);
    if (newVisible.has(entryId)) {
      newVisible.delete(entryId);
    } else {
      newVisible.add(entryId);
    }
    setVisibleEntries(newVisible);
  };

  const getPlaceholder = (tip: string) => {
    switch (tip) {
      case "login":
        return "username:password";
      case "boja":
        return "#FF5733";
      case "link":
        return "https://example.com/logo.png";
      case "licenca":
        return "XXXX-XXXX-XXXX-XXXX";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Klijentski Trezor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sigurno skladište za pristupne podatke i informacije
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tip-unosa">Tip Unosa</Label>
            <Select
              value={newEntry.tip}
              onValueChange={(value: any) => setNewEntry({ ...newEntry, tip: value })}
            >
              <SelectTrigger id="tip-unosa">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="login">Login (korisničko ime/lozinka)</SelectItem>
                <SelectItem value="boja">Boje Brenda</SelectItem>
                <SelectItem value="link">Link (logo, dokumenti)</SelectItem>
                <SelectItem value="licenca">Licenca</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="naziv-unosa">Naziv</Label>
            <Input
              id="naziv-unosa"
              value={newEntry.naziv}
              onChange={(e) => setNewEntry({ ...newEntry, naziv: e.target.value })}
              placeholder="WordPress Login, Primarna Boja, Logo Link..."
            />
          </div>
          <div>
            <Label htmlFor="vrijednost-unosa">Vrijednost</Label>
            <Input
              id="vrijednost-unosa"
              type="text"
              value={newEntry.vrijednost}
              onChange={(e) => setNewEntry({ ...newEntry, vrijednost: e.target.value })}
              placeholder={getPlaceholder(newEntry.tip || "login")}
            />
          </div>
          <div>
            <Label htmlFor="dodatne-info">Dodatne Informacije</Label>
            <Textarea
              id="dodatne-info"
              value={newEntry.dodatneInformacije}
              onChange={(e) => setNewEntry({ ...newEntry, dodatneInformacije: e.target.value })}
              placeholder="Opcionalne bilješke..."
              rows={2}
            />
          </div>
          <Button onClick={addEntry} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj u Trezor
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {vaultEntries.map((entry) => (
          <Card key={entry.id} className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase text-primary">
                      {entry.tip}
                    </span>
                  </div>
                  <h4 className="font-semibold">{entry.naziv}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-sm bg-background px-2 py-1 rounded flex-1">
                      {visibleEntries.has(entry.id) ? entry.vrijednost : "••••••••"}
                    </code>
                    <Button
                      onClick={() => toggleVisibility(entry.id)}
                      variant="ghost"
                      size="sm"
                    >
                      {visibleEntries.has(entry.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {entry.dodatneInformacije && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {entry.dodatneInformacije}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => deleteEntry(entry.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
