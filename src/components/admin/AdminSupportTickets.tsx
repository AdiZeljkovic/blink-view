import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Trash2, LifeBuoy, AlertCircle } from "lucide-react";
import { SupportTicket } from "@/types/crm";

interface AdminSupportTicketsProps {
  clientId: string;
  tickets: SupportTicket[];
  onUpdate: (tickets: SupportTicket[]) => void;
}

export const AdminSupportTickets = ({ clientId, tickets, onUpdate }: AdminSupportTicketsProps) => {
  const [newTicket, setNewTicket] = useState<Partial<SupportTicket>>({
    opisProblema: "",
    prioritet: "srednji",
    status: "otvoren",
  });

  const addTicket = () => {
    if (newTicket.opisProblema) {
      const ticket: SupportTicket = {
        id: Date.now().toString(),
        clientId,
        opisProblema: newTicket.opisProblema,
        prioritet: newTicket.prioritet as any,
        status: "otvoren",
        datumKreiranja: new Date().toISOString().split("T")[0],
      };
      onUpdate([...tickets, ticket]);
      setNewTicket({ opisProblema: "", prioritet: "srednji", status: "otvoren" });
    }
  };

  const updateTicketStatus = (ticketId: string, newStatus: SupportTicket["status"]) => {
    onUpdate(
      tickets.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              datumRješavanja: newStatus === "riješen" ? new Date().toISOString().split("T")[0] : undefined,
            }
          : t
      )
    );
  };

  const updateTicketPriority = (ticketId: string, newPriority: SupportTicket["prioritet"]) => {
    onUpdate(
      tickets.map(t =>
        t.id === ticketId ? { ...t, prioritet: newPriority } : t
      )
    );
  };

  const deleteTicket = (ticketId: string) => {
    onUpdate(tickets.filter(t => t.id !== ticketId));
  };

  const getPriorityColor = (prioritet: string) => {
    switch (prioritet) {
      case "visok":
        return "destructive";
      case "srednji":
        return "default";
      case "nizak":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "otvoren":
        return "destructive";
      case "u_radu":
        return "default";
      case "riješen":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Novi Tiket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="opis-problema">Opis Problema</Label>
            <Textarea
              id="opis-problema"
              value={newTicket.opisProblema}
              onChange={(e) => setNewTicket({ ...newTicket, opisProblema: e.target.value })}
              placeholder="Detaljno opišite problem..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="prioritet-tiketa">Prioritet</Label>
            <Select
              value={newTicket.prioritet}
              onValueChange={(value: any) => setNewTicket({ ...newTicket, prioritet: value })}
            >
              <SelectTrigger id="prioritet-tiketa">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nizak">Nizak</SelectItem>
                <SelectItem value="srednji">Srednji</SelectItem>
                <SelectItem value="visok">Visok</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addTicket} className="w-full">
            Kreiraj Tiket
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getPriorityColor(ticket.prioritet)}>
                      {ticket.prioritet === "visok" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {ticket.prioritet}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{ticket.opisProblema}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Kreirano: {ticket.datumKreiranja}
                    {ticket.datumRješavanja && ` • Riješeno: ${ticket.datumRješavanja}`}
                  </p>
                </div>
                <Button
                  onClick={() => deleteTicket(ticket.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                <div>
                  <Label className="text-xs">Prioritet</Label>
                  <Select
                    value={ticket.prioritet}
                    onValueChange={(value: any) => updateTicketPriority(ticket.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nizak">Nizak</SelectItem>
                      <SelectItem value="srednji">Srednji</SelectItem>
                      <SelectItem value="visok">Visok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={ticket.status}
                    onValueChange={(value: any) => updateTicketStatus(ticket.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="otvoren">Otvoren</SelectItem>
                      <SelectItem value="u_radu">U radu</SelectItem>
                      <SelectItem value="riješen">Riješen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
