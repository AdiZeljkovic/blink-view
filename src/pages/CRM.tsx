import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Mail, Phone, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Client {
  id: string;
  ime: string;
  kompanija: string;
  email: string;
  telefon: string;
  adresa: string;
  biljeske: string;
}

const CRM = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, "id">>({
    ime: "",
    kompanija: "",
    email: "",
    telefon: "",
    adresa: "",
    biljeske: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const saved = await storage.getJSON<Client[]>("crm-clients");
        if (saved) setClients(saved);
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };
    loadClients();
  }, []);

  const saveClients = async (newClients: Client[]) => {
    setClients(newClients);
    try {
      await storage.setJSON("crm-clients", newClients);
    } catch (error) {
      console.error("Error saving clients:", error);
      toast({
        title: "Greška",
        description: "Nije moguće sačuvati klijenta",
        variant: "destructive",
      });
    }
  };

  const addClient = async () => {
    if (!formData.ime || !formData.email) {
      toast({
        title: "Upozorenje",
        description: "Ime i email su obavezni",
        variant: "destructive",
      });
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      ...formData,
    };

    await saveClients([...clients, newClient]);
    setFormData({
      ime: "",
      kompanija: "",
      email: "",
      telefon: "",
      adresa: "",
      biljeske: "",
    });
    setOpen(false);
    toast({
      title: "Uspjeh",
      description: "Klijent je dodan",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1400px]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">CRM - Klijenti</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj Klijenta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novi Klijent</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ime">Ime *</Label>
                  <Input
                    id="ime"
                    value={formData.ime}
                    onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="kompanija">Kompanija</Label>
                  <Input
                    id="kompanija"
                    value={formData.kompanija}
                    onChange={(e) => setFormData({ ...formData, kompanija: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input
                    id="telefon"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="adresa">Adresa</Label>
                  <Input
                    id="adresa"
                    value={formData.adresa}
                    onChange={(e) => setFormData({ ...formData, adresa: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="biljeske">Bilješke</Label>
                  <Textarea
                    id="biljeske"
                    value={formData.biljeske}
                    onChange={(e) => setFormData({ ...formData, biljeske: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={addClient} className="w-full">
                Dodaj Klijenta
              </Button>
            </DialogContent>
          </Dialog>
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
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/crm/${client.id}`)}
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
      </main>
    </div>
  );
};

export default CRM;
