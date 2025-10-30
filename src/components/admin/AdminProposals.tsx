import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FileText } from "lucide-react";
import { Proposal, ProposalItem } from "@/types/crm";

interface AdminProposalsProps {
  clientId: string;
  proposals: Proposal[];
  onUpdate: (proposals: Proposal[]) => void;
  deals: any[];
}

export const AdminProposals = ({ clientId, proposals, onUpdate, deals }: AdminProposalsProps) => {
  const [newProposal, setNewProposal] = useState<Partial<Proposal>>({
    naziv: "",
    dealId: "",
    stavke: [],
    status: "nacrt",
  });
  const [newItem, setNewItem] = useState<Partial<ProposalItem>>({
    opisUsluge: "",
    kolicina: 1,
    cijena: 0,
  });

  const addItem = () => {
    if (newItem.opisUsluge && newItem.cijena) {
      const item: ProposalItem = {
        id: Date.now().toString(),
        opisUsluge: newItem.opisUsluge,
        kolicina: newItem.kolicina || 1,
        cijena: newItem.cijena,
      };
      setNewProposal(prev => ({
        ...prev,
        stavke: [...(prev.stavke || []), item],
      }));
      setNewItem({ opisUsluge: "", kolicina: 1, cijena: 0 });
    }
  };

  const removeItem = (itemId: string) => {
    setNewProposal(prev => ({
      ...prev,
      stavke: (prev.stavke || []).filter(item => item.id !== itemId),
    }));
  };

  const calculateTotal = (stavke: ProposalItem[]) => {
    return stavke.reduce((sum, item) => sum + (item.kolicina * item.cijena), 0);
  };

  const addProposal = () => {
    if (newProposal.naziv && newProposal.stavke && newProposal.stavke.length > 0) {
      const proposal: Proposal = {
        id: Date.now().toString(),
        clientId,
        naziv: newProposal.naziv,
        dealId: newProposal.dealId,
        stavke: newProposal.stavke,
        ukupanIznos: calculateTotal(newProposal.stavke),
        status: newProposal.status as any,
        datumKreiranja: new Date().toISOString().split("T")[0],
      };
      onUpdate([...proposals, proposal]);
      setNewProposal({ naziv: "", dealId: "", stavke: [], status: "nacrt" });
    }
  };

  const updateProposalStatus = (proposalId: string, newStatus: Proposal["status"]) => {
    onUpdate(
      proposals.map(p =>
        p.id === proposalId ? { ...p, status: newStatus } : p
      )
    );
  };

  const deleteProposal = (proposalId: string) => {
    onUpdate(proposals.filter(p => p.id !== proposalId));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nova Ponuda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="naziv-ponude">Naziv Ponude</Label>
              <Input
                id="naziv-ponude"
                value={newProposal.naziv}
                onChange={(e) => setNewProposal({ ...newProposal, naziv: e.target.value })}
                placeholder="Web Dizajn Paket"
              />
            </div>
            <div>
              <Label htmlFor="deal-ponude">Povezani Posao (opcionalno)</Label>
              <Select
                value={newProposal.dealId}
                onValueChange={(value) => setNewProposal({ ...newProposal, dealId: value })}
              >
                <SelectTrigger id="deal-ponude">
                  <SelectValue placeholder="Odaberi posao" />
                </SelectTrigger>
                <SelectContent>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.naziv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Stavke Ponude</h4>
            <div className="grid grid-cols-12 gap-2 mb-2">
              <div className="col-span-5">
                <Input
                  value={newItem.opisUsluge}
                  onChange={(e) => setNewItem({ ...newItem, opisUsluge: e.target.value })}
                  placeholder="Opis usluge"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={newItem.kolicina}
                  onChange={(e) => setNewItem({ ...newItem, kolicina: Number(e.target.value) })}
                  placeholder="Količina"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={newItem.cijena}
                  onChange={(e) => setNewItem({ ...newItem, cijena: Number(e.target.value) })}
                  placeholder="Cijena"
                />
              </div>
              <div className="col-span-2">
                <Button onClick={addItem} variant="outline" className="w-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {newProposal.stavke && newProposal.stavke.length > 0 && (
              <div className="space-y-2 mt-3">
                {newProposal.stavke.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span>{item.opisUsluge} - {item.kolicina} x {item.cijena} KM</span>
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="text-right font-semibold pt-2 border-t">
                  Ukupno: {calculateTotal(newProposal.stavke)} KM
                </div>
              </div>
            )}
          </div>

          <Button onClick={addProposal} className="w-full">
            Kreiraj Ponudu
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{proposal.naziv}</h4>
                  <p className="text-sm text-muted-foreground">
                    {proposal.datumKreiranja} • {proposal.ukupanIznos} KM
                  </p>
                </div>
                <Button
                  onClick={() => deleteProposal(proposal.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1 mb-3">
                {proposal.stavke.map((item) => (
                  <div key={item.id} className="text-sm">
                    {item.opisUsluge} - {item.kolicina} x {item.cijena} KM
                  </div>
                ))}
              </div>

              <Select
                value={proposal.status}
                onValueChange={(value: any) => updateProposalStatus(proposal.id, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nacrt">Nacrt</SelectItem>
                  <SelectItem value="poslano">Poslano</SelectItem>
                  <SelectItem value="prihvaceno">Prihvaćeno</SelectItem>
                  <SelectItem value="odbijeno">Odbijeno</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
