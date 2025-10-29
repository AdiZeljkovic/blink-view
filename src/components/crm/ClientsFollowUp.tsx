import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Client } from "@/types/crm";
import { UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, parseISO } from "date-fns";

interface ClientsFollowUpProps {
  clients: Client[];
}

const ClientsFollowUp = ({ clients }: ClientsFollowUpProps) => {
  const navigate = useNavigate();
  
  const clientsNeedingFollowUp = clients.filter(client => {
    if (!client.datumZadnjegKontakta) return true;
    
    const daysSinceContact = differenceInDays(new Date(), parseISO(client.datumZadnjegKontakta));
    return daysSinceContact > 30;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Klijenti za Praćenje (30+ dana)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientsNeedingFollowUp.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Svi klijenti su kontaktirani u posljednjih 30 dana
          </p>
        ) : (
          <div className="space-y-2">
            {clientsNeedingFollowUp.slice(0, 5).map(client => {
              const daysSinceContact = client.datumZadnjegKontakta 
                ? differenceInDays(new Date(), parseISO(client.datumZadnjegKontakta))
                : null;
              
              return (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/crm/clients/${client.id}`)}
                >
                  <div>
                    <p className="font-medium text-sm">{client.ime}</p>
                    {client.kompanija && <p className="text-xs text-muted-foreground">{client.kompanija}</p>}
                    {daysSinceContact !== null ? (
                      <p className="text-xs text-orange-600 mt-1">{daysSinceContact} dana bez kontakta</p>
                    ) : (
                      <p className="text-xs text-red-600 mt-1">Nikada nije kontaktiran</p>
                    )}
                  </div>
                  <Button size="sm" variant="outline">
                    Kontaktiraj
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsFollowUp;
