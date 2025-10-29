import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import type { Client, Invoice } from "@/types/crm";

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    brojFakture: "",
    iznos: "",
    datumIzdavanja: new Date().toISOString().split("T")[0],
    rokPlacanja: "",
    status: "nacrt" as Invoice["status"],
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const clients = await storage.getJSON<Client[]>("crm-clients");
        const foundClient = clients?.find((c) => c.id === clientId);
        if (foundClient) {
          setClient(foundClient);
        } else {
          navigate("/crm");
        }

        const allInvoices = await storage.getJSON<Invoice[]>("crm-invoices") || [];
        setInvoices(allInvoices.filter((inv) => inv.clientId === clientId));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [clientId, navigate]);

  const saveClient = async () => {
    if (!client) return;
    try {
      const clients = await storage.getJSON<Client[]>("crm-clients") || [];
      const updated = clients.map((c) => (c.id === client.id ? client : c));
      await storage.setJSON("crm-clients", updated);
      setEditMode(false);
      toast({ title: "Uspjeh", description: "Podaci klijenta su ažurirani" });
    } catch (error) {
      toast({ title: "Greška", description: "Nije moguće ažurirati klijenta", variant: "destructive" });
    }
  };

  const addInvoice = async () => {
    if (!formData.brojFakture || !formData.iznos) {
      toast({ title: "Upozorenje", description: "Popunite sva polja", variant: "destructive" });
      return;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      clientId: clientId!,
      brojFakture: formData.brojFakture,
      iznos: parseFloat(formData.iznos),
      datumIzdavanja: formData.datumIzdavanja,
      rokPlacanja: formData.rokPlacanja,
      status: formData.status,
    };

    try {
      const allInvoices = await storage.getJSON<Invoice[]>("crm-invoices") || [];
      const updated = [...allInvoices, newInvoice];
      await storage.setJSON("crm-invoices", updated);
      setInvoices([...invoices, newInvoice]);
      setFormData({
        brojFakture: "",
        iznos: "",
        datumIzdavanja: new Date().toISOString().split("T")[0],
        rokPlacanja: "",
        status: "nacrt",
      });
      setOpen(false);
      toast({ title: "Uspjeh", description: "Faktura je dodana" });
    } catch (error) {
      toast({ title: "Greška", description: "Nije moguće dodati fakturu", variant: "destructive" });
    }
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "placeno":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "kasni":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "poslano":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (!client) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1400px]">
        <Button variant="ghost" onClick={() => navigate("/crm/clients")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad na Klijente
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Podaci o Klijentu</CardTitle>
              {editMode ? (
                <div className="space-x-2">
                  <Button onClick={saveClient}>Sačuvaj</Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Otkaži
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditMode(true)}>Uredi</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ime</Label>
                <Input
                  value={client.ime}
                  onChange={(e) => setClient({ ...client, ime: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Kompanija</Label>
                <Input
                  value={client.kompanija}
                  onChange={(e) => setClient({ ...client, kompanija: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input
                  value={client.telefon}
                  onChange={(e) => setClient({ ...client, telefon: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div className="col-span-2">
                <Label>Adresa</Label>
                <Input
                  value={client.adresa}
                  onChange={(e) => setClient({ ...client, adresa: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div className="col-span-2">
                <Label>Bilješke</Label>
                <Textarea
                  value={client.biljeske}
                  onChange={(e) => setClient({ ...client, biljeske: e.target.value })}
                  disabled={!editMode}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Fakture
              </CardTitle>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Faktura
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Faktura</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="brojFakture">Broj Fakture</Label>
                      <Input
                        id="brojFakture"
                        value={formData.brojFakture}
                        onChange={(e) => setFormData({ ...formData, brojFakture: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="iznos">Iznos (KM)</Label>
                      <Input
                        id="iznos"
                        type="number"
                        value={formData.iznos}
                        onChange={(e) => setFormData({ ...formData, iznos: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="datumIzdavanja">Datum Izdavanja</Label>
                      <Input
                        id="datumIzdavanja"
                        type="date"
                        value={formData.datumIzdavanja}
                        onChange={(e) => setFormData({ ...formData, datumIzdavanja: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rokPlacanja">Rok Plaćanja</Label>
                      <Input
                        id="rokPlacanja"
                        type="date"
                        value={formData.rokPlacanja}
                        onChange={(e) => setFormData({ ...formData, rokPlacanja: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData({ ...formData, status: v as Invoice["status"] })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nacrt">Nacrt</SelectItem>
                          <SelectItem value="poslano">Poslano</SelectItem>
                          <SelectItem value="placeno">Plaćeno</SelectItem>
                          <SelectItem value="kasni">Kasni</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addInvoice} className="w-full">
                    Dodaj Fakturu
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broj Fakture</TableHead>
                  <TableHead>Iznos</TableHead>
                  <TableHead>Datum Izdavanja</TableHead>
                  <TableHead>Rok Plaćanja</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nema faktura za ovog klijenta
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.brojFakture}</TableCell>
                      <TableCell>{inv.iznos.toFixed(2)} KM</TableCell>
                      <TableCell>{inv.datumIzdavanja}</TableCell>
                      <TableCell>{inv.rokPlacanja}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(inv.status)}`}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientDetail;
