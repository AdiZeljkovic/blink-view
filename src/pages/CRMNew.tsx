import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Mail, Phone, Building2, Briefcase, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Client, Deal } from "@/types/crm";

const CRMNew = () => {
  const { supabase, isConfigured } = useSupabase();
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [openDealDialog, setOpenDealDialog] = useState(false);
  const [clientFormData, setClientFormData] = useState<Omit<Client, "id">>({
    ime: "",
    kompanija: "",
    email: "",
    telefon: "",
    adresa: "",
    biljeske: "",
  });
  const [dealFormData, setDealFormData] = useState({
    clientId: "",
    naziv: "",
    vrijednost: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (!supabase || !isConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (clientsError) throw clientsError;
        setClients(clientsData || []);

        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false });

        if (dealsError) throw dealsError;
        setDeals(dealsData || []);
      } catch (error) {
        console.error("Error loading CRM data:", error);
        toast({
          title: "Greška",
          description: "Nije moguće učitati podatke",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [supabase, isConfigured, toast]);


  const addClient = async () => {
    if (!clientFormData.ime || !clientFormData.email) {
      toast({
        title: "Upozorenje",
        description: "Ime i email su obavezni",
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
      const { data, error } = await supabase
        .from('clients')
        .insert([clientFormData])
        .select()
        .single();

      if (error) throw error;

      setClients([data, ...clients]);
      setClientFormData({
        ime: "",
        kompanija: "",
        email: "",
        telefon: "",
        adresa: "",
        biljeske: "",
      });
      setOpenClientDialog(false);
      toast({
        title: "Uspjeh",
        description: "Klijent je dodan",
      });
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Greška",
        description: "Nije moguće dodati klijenta",
        variant: "destructive",
      });
    }
  };

  const addDeal = async () => {
    if (!dealFormData.clientId || !dealFormData.naziv || !dealFormData.vrijednost) {
      toast({
        title: "Upozorenje",
        description: "Sva polja su obavezna",
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
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          client_id: dealFormData.clientId,
          naziv: dealFormData.naziv,
          vrijednost: parseFloat(dealFormData.vrijednost),
          status: "novi",
        }])
        .select()
        .single();

      if (error) throw error;

      setDeals([data, ...deals]);
      setDealFormData({
        clientId: "",
        naziv: "",
        vrijednost: "",
      });
      setOpenDealDialog(false);
      toast({
        title: "Uspjeh",
        description: "Posao je dodan",
      });
    } catch (error) {
      console.error("Error adding deal:", error);
      toast({
        title: "Greška",
        description: "Nije moguće dodati posao",
        variant: "destructive",
      });
    }
  };

  const moveDeal = async (dealId: string, newStatus: Deal["status"]) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus })
        .eq('id', dealId);

      if (error) throw error;

      setDeals(deals.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
    } catch (error) {
      console.error("Error moving deal:", error);
      toast({
        title: "Greška",
        description: "Nije moguće ažurirati posao",
        variant: "destructive",
      });
    }
  };

  const getDealsByStatus = (status: Deal["status"]) => {
    return deals.filter(d => d.status === status);
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.ime || "Nepoznat";
  };

  const statusConfig = [
    { value: "novi" as const, label: "Novi Kontakt", color: "bg-blue-500" },
    { value: "pregovori" as const, label: "Pregovori", color: "bg-yellow-500" },
    { value: "ponuda" as const, label: "Ponuda Poslana", color: "bg-purple-500" },
    { value: "dobijeno" as const, label: "Dobijeno", color: "bg-green-500" },
    { value: "izgubljeno" as const, label: "Izgubljeno", color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1600px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">CRM - Klijenti</h1>
            <Button 
              variant="link" 
              onClick={() => navigate("/crm")}
              className="p-0 h-auto mt-2"
            >
              ← Nazad na Dashboard
            </Button>
          </div>
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="clients" className="gap-2">
              <User className="w-4 h-4" />
              Klijenti
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Poslovi (Pipeline)
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-semibold">Svi Klijenti</h2>
              <Button onClick={() => setOpenClientDialog(true)} className="gap-2 shadow-glow-md">
                <Plus className="w-4 h-4" />
                Dodaj Klijenta
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12 text-muted-foreground">
                    Nema klijenata. Dodajte prvog klijenta.
                  </CardContent>
                </Card>
              ) : (
                clients.map((client) => (
                  <Card
                    key={client.id}
                    className="cursor-pointer hover:shadow-glow-md hover:-translate-y-1 transition-all duration-300 animate-scale-in"
                    onClick={() => navigate(`/crm/clients/${client.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {client.ime}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {client.kompanija && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{client.kompanija}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                      {client.telefon && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{client.telefon}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Deals Tab - Kanban Board */}
          <TabsContent value="deals" className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-semibold">Pipeline Poslova</h2>
              <Button onClick={() => setOpenDealDialog(true)} className="gap-2 shadow-glow-md">
                <Plus className="w-4 h-4" />
                Dodaj Posao
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {statusConfig.map((status) => (
                <div key={status.value} className="space-y-3">
                  <div className={`${status.color} text-white p-3 rounded-xl shadow-lg`}>
                    <h3 className="font-semibold text-sm text-center">{status.label}</h3>
                    <p className="text-xs text-center opacity-90 mt-1">
                      {getDealsByStatus(status.value).length} poslova
                    </p>
                  </div>
                  
                  <div className="space-y-2 min-h-[400px] p-2 rounded-xl bg-muted/20">
                    {getDealsByStatus(status.value).map((deal, index) => (
                      <Card 
                        key={deal.id} 
                        className="cursor-move hover:shadow-glow-sm transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2 mb-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">{deal.naziv}</h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {getClientName(deal.clientId)}
                              </p>
                              <p className="text-sm font-bold text-primary mt-1">
                                {deal.vrijednost.toFixed(2)} KM
                              </p>
                            </div>
                          </div>
                          
                          {/* Status Change Buttons */}
                          <div className="flex gap-1 mt-3">
                            {status.value !== "novi" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs flex-1"
                                onClick={() => {
                                  const prevIndex = statusConfig.findIndex(s => s.value === status.value) - 1;
                                  if (prevIndex >= 0) {
                                    moveDeal(deal.id, statusConfig[prevIndex].value);
                                  }
                                }}
                              >
                                ←
                              </Button>
                            )}
                            {status.value !== "izgubljeno" && status.value !== "dobijeno" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs flex-1"
                                onClick={() => {
                                  const nextIndex = statusConfig.findIndex(s => s.value === status.value) + 1;
                                  if (nextIndex < statusConfig.length) {
                                    moveDeal(deal.id, statusConfig[nextIndex].value);
                                  }
                                }}
                              >
                                →
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Client Dialog */}
      <Dialog open={openClientDialog} onOpenChange={setOpenClientDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-display">Novi Klijent</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ime">Ime *</Label>
              <Input
                id="ime"
                value={clientFormData.ime}
                onChange={(e) => setClientFormData({ ...clientFormData, ime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="kompanija">Kompanija</Label>
              <Input
                id="kompanija"
                value={clientFormData.kompanija}
                onChange={(e) => setClientFormData({ ...clientFormData, kompanija: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                value={clientFormData.telefon}
                onChange={(e) => setClientFormData({ ...clientFormData, telefon: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="adresa">Adresa</Label>
              <Input
                id="adresa"
                value={clientFormData.adresa}
                onChange={(e) => setClientFormData({ ...clientFormData, adresa: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="biljeske">Bilješke</Label>
              <Textarea
                id="biljeske"
                value={clientFormData.biljeske}
                onChange={(e) => setClientFormData({ ...clientFormData, biljeske: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={addClient} className="w-full">
            Dodaj Klijenta
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Deal Dialog */}
      <Dialog open={openDealDialog} onOpenChange={setOpenDealDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">Novi Posao</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deal-client">Klijent *</Label>
              <select
                id="deal-client"
                className="w-full p-2 rounded-lg border border-border bg-card"
                value={dealFormData.clientId}
                onChange={(e) => setDealFormData({ ...dealFormData, clientId: e.target.value })}
              >
                <option value="">Odaberite klijenta</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.ime} {c.kompanija && `(${c.kompanija})`}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="deal-naziv">Naziv Posla *</Label>
              <Input
                id="deal-naziv"
                value={dealFormData.naziv}
                onChange={(e) => setDealFormData({ ...dealFormData, naziv: e.target.value })}
                placeholder="Npr. Web dizajn, Konsultacije..."
              />
            </div>
            <div>
              <Label htmlFor="deal-vrijednost">Vrijednost (KM) *</Label>
              <Input
                id="deal-vrijednost"
                type="number"
                value={dealFormData.vrijednost}
                onChange={(e) => setDealFormData({ ...dealFormData, vrijednost: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={addDeal} className="w-full">
            Dodaj Posao
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMNew;
