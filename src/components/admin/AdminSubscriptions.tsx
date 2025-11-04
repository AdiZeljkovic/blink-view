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
import { Switch } from "@/components/ui/switch";
import { Trash2, RefreshCw } from "lucide-react";
import { Subscription } from "@/types/crm";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

interface AdminSubscriptionsProps {
  clientId: string;
  subscriptions: Subscription[];
  onUpdate: (subscriptions: Subscription[]) => void;
}

export const AdminSubscriptions = ({ clientId, subscriptions, onUpdate }: AdminSubscriptionsProps) => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [newSubscription, setNewSubscription] = useState<Partial<Subscription>>({
    nazivUsluge: "",
    mjesecniIznos: 0,
    danNaplate: 1,
    aktivna: true,
  });

  const addSubscription = async () => {
    if (!newSubscription.nazivUsluge || !newSubscription.mjesecniIznos || !supabase) return;

    const subscription = {
      client_id: clientId,
      naziv_usluge: newSubscription.nazivUsluge,
      mjesecni_iznos: newSubscription.mjesecniIznos,
      datum_pocetka: new Date().toISOString().split("T")[0],
      dan_naplate: newSubscription.danNaplate || 1,
      aktivna: true,
    };

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert([subscription])
        .select()
        .single();

      if (error) throw error;

      onUpdate([...subscriptions, {
        id: data.id,
        clientId: data.client_id,
        nazivUsluge: data.naziv_usluge,
        mjesecniIznos: data.mjesecni_iznos,
        datumPocetka: data.datum_pocetka,
        danNaplate: data.dan_naplate,
        aktivna: data.aktivna
      }]);
      setNewSubscription({ nazivUsluge: "", mjesecniIznos: 0, danNaplate: 1, aktivna: true });
      toast({
        title: "Uspjeh",
        description: "Pretplata kreirana!",
      });
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast({
        title: "Greška",
        description: "Greška pri kreiranju pretplate",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (subscriptionId: string) => {
    if (!supabase) return;

    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ aktivna: !subscription.aktivna })
        .eq("id", subscriptionId);

      if (error) throw error;

      onUpdate(
        subscriptions.map(s =>
          s.id === subscriptionId ? { ...s, aktivna: !s.aktivna } : s
        )
      );
    } catch (error) {
      console.error("Error toggling subscription:", error);
      toast({
        title: "Greška",
        description: "Greška pri ažuriranju pretplate",
        variant: "destructive",
      });
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscriptionId);

      if (error) throw error;

      onUpdate(subscriptions.filter(s => s.id !== subscriptionId));
      toast({
        title: "Uspjeh",
        description: "Pretplata obrisana!",
      });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast({
        title: "Greška",
        description: "Greška pri brisanju pretplate",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Nova Pretplata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="naziv-usluge">Naziv Usluge</Label>
            <Input
              id="naziv-usluge"
              value={newSubscription.nazivUsluge}
              onChange={(e) => setNewSubscription({ ...newSubscription, nazivUsluge: e.target.value })}
              placeholder="Održavanje sajta"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mjesecni-iznos">Mjesečni Iznos (KM)</Label>
              <Input
                id="mjesecni-iznos"
                type="number"
                value={newSubscription.mjesecniIznos}
                onChange={(e) => setNewSubscription({ ...newSubscription, mjesecniIznos: Number(e.target.value) })}
                placeholder="150"
              />
            </div>
            <div>
              <Label htmlFor="dan-naplate">Dan Naplate</Label>
              <Select
                value={String(newSubscription.danNaplate)}
                onValueChange={(value) => setNewSubscription({ ...newSubscription, danNaplate: Number(value) })}
              >
                <SelectTrigger id="dan-naplate">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day}.
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addSubscription} className="w-full">
            Kreiraj Pretplatu
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold">{subscription.nazivUsluge}</h4>
                  <p className="text-sm text-muted-foreground">
                    {subscription.mjesecniIznos} KM mjesečno • Naplata {subscription.danNaplate}. u mjesecu
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Početak: {subscription.datumPocetka}
                  </p>
                </div>
                <Button
                  onClick={() => deleteSubscription(subscription.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <Label htmlFor={`aktivna-${subscription.id}`}>Aktivna</Label>
                <Switch
                  id={`aktivna-${subscription.id}`}
                  checked={subscription.aktivna}
                  onCheckedChange={() => toggleActive(subscription.id)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
