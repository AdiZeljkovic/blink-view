import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, FileText, CheckSquare, Briefcase, User, StickyNote, Trash2, MessageSquare, FileCheck, FolderKanban, RefreshCw, Lock, LifeBuoy } from "lucide-react";
import CommunicationLog from "@/components/crm/CommunicationLog";
import { AdminProposals } from "@/components/admin/AdminProposals";
import { AdminProjects } from "@/components/admin/AdminProjects";
import { AdminSubscriptions } from "@/components/admin/AdminSubscriptions";
import { AdminVault } from "@/components/admin/AdminVault";
import { AdminSupportTickets } from "@/components/admin/AdminSupportTickets";
import type { Client, Invoice, Task, Deal, CommunicationEntry, Proposal, Project, Subscription, VaultEntry, SupportTicket } from "@/types/crm";

const ClientDetailNew = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [communications, setCommunications] = useState<CommunicationEntry[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    brojFakture: "",
    iznos: "",
    datumIzdavanja: new Date().toISOString().split("T")[0],
    rokPlacanja: "",
    status: "nacrt" as Invoice["status"],
  });
  const [taskFormData, setTaskFormData] = useState({
    naziv: "",
    rok: new Date().toISOString().split("T")[0],
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

        const allTasks = await storage.getJSON<Task[]>("crm-tasks") || [];
        setTasks(allTasks.filter((t) => t.clientId === clientId));

        const allDeals = await storage.getJSON<Deal[]>("crm-deals") || [];
        setDeals(allDeals.filter((d) => d.clientId === clientId));

        const allComms = await storage.getJSON<CommunicationEntry[]>("crm-communications") || [];
        setCommunications(allComms.filter((c) => c.clientId === clientId));

        const allProposals = await storage.getJSON<Proposal[]>("crm-proposals") || [];
        setProposals(allProposals.filter((p) => p.clientId === clientId));

        const allProjects = await storage.getJSON<Project[]>("crm-projects") || [];
        setProjects(allProjects.filter((p) => p.clientId === clientId));

        const allSubscriptions = await storage.getJSON<Subscription[]>("crm-subscriptions") || [];
        setSubscriptions(allSubscriptions.filter((s) => s.clientId === clientId));

        const allVault = await storage.getJSON<VaultEntry[]>("crm-vault") || [];
        setVaultEntries(allVault.filter((v) => v.clientId === clientId));

        const allTickets = await storage.getJSON<SupportTicket[]>("crm-tickets") || [];
        setTickets(allTickets.filter((t) => t.clientId === clientId));
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
    if (!invoiceFormData.brojFakture || !invoiceFormData.iznos) {
      toast({ title: "Upozorenje", description: "Popunite sva polja", variant: "destructive" });
      return;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      clientId: clientId!,
      brojFakture: invoiceFormData.brojFakture,
      iznos: parseFloat(invoiceFormData.iznos),
      datumIzdavanja: invoiceFormData.datumIzdavanja,
      rokPlacanja: invoiceFormData.rokPlacanja,
      status: invoiceFormData.status,
    };

    try {
      const allInvoices = await storage.getJSON<Invoice[]>("crm-invoices") || [];
      const updated = [...allInvoices, newInvoice];
      await storage.setJSON("crm-invoices", updated);
      setInvoices([...invoices, newInvoice]);
      setInvoiceFormData({
        brojFakture: "",
        iznos: "",
        datumIzdavanja: new Date().toISOString().split("T")[0],
        rokPlacanja: "",
        status: "nacrt",
      });
      setOpenInvoiceDialog(false);
      toast({ title: "Uspjeh", description: "Faktura je dodana" });
    } catch (error) {
      toast({ title: "Greška", description: "Nije moguće dodati fakturu", variant: "destructive" });
    }
  };

  const addTask = async () => {
    if (!taskFormData.naziv) {
      toast({ title: "Upozorenje", description: "Unesite naziv zadatka", variant: "destructive" });
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      clientId: clientId!,
      naziv: taskFormData.naziv,
      rok: taskFormData.rok,
      completed: false,
    };

    try {
      const allTasks = await storage.getJSON<Task[]>("crm-tasks") || [];
      const updated = [...allTasks, newTask];
      await storage.setJSON("crm-tasks", updated);
      setTasks([...tasks, newTask]);
      setTaskFormData({ naziv: "", rok: new Date().toISOString().split("T")[0] });
      setOpenTaskDialog(false);
      toast({ title: "Uspjeh", description: "Zadatak je dodan" });
    } catch (error) {
      toast({ title: "Greška", description: "Nije moguće dodati zadatak", variant: "destructive" });
    }
  };

  const toggleTask = async (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    try {
      const allTasks = await storage.getJSON<Task[]>("crm-tasks") || [];
      const allUpdated = allTasks.map(t => {
        const found = updated.find(ut => ut.id === t.id);
        return found || t;
      });
      await storage.setJSON("crm-tasks", allUpdated);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    const filtered = tasks.filter(t => t.id !== taskId);
    setTasks(filtered);
    try {
      const allTasks = await storage.getJSON<Task[]>("crm-tasks") || [];
      await storage.setJSON("crm-tasks", allTasks.filter(t => t.id !== taskId));
      toast({ title: "Uspjeh", description: "Zadatak je obrisan" });
    } catch (error) {
      toast({ title: "Greška", description: "Nije moguće obrisati zadatak", variant: "destructive" });
    }
  };

  const addCommunication = async (entry: Omit<CommunicationEntry, "id">) => {
    const newEntry: CommunicationEntry = {
      ...entry,
      id: Date.now().toString(),
    };

    try {
      const allComms = await storage.getJSON<CommunicationEntry[]>("crm-communications") || [];
      await storage.setJSON("crm-communications", [...allComms, newEntry]);
      setCommunications([...communications, newEntry]);

      // Update client's last contact date
      if (client) {
        const updatedClient = { ...client, datumZadnjegKontakta: entry.datum };
        setClient(updatedClient);
        
        const allClients = await storage.getJSON<Client[]>("crm-clients") || [];
        await storage.setJSON("crm-clients", 
          allClients.map(c => c.id === clientId ? updatedClient : c)
        );
      }

      toast({ title: "Uspjeh", description: "Komunikacija je zabilježena" });
    } catch (error) {
      toast({ title: "Greška", description: "Nije moguće dodati komunikaciju", variant: "destructive" });
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

  const getDealStatusColor = (status: Deal["status"]) => {
    switch (status) {
      case "dobijeno":
        return "bg-green-500";
      case "izgubljeno":
        return "bg-red-500";
      case "ponuda":
        return "bg-purple-500";
      case "pregovori":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
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

        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="contact" className="gap-2">
              <User className="w-4 h-4" />
              Kontakt Detalji
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="w-4 h-4" />
              Fakture
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Poslovi
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Zadaci
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <StickyNote className="w-4 h-4" />
              Bilješke
            </TabsTrigger>
            <TabsTrigger value="communications" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Dnevnik Komunikacije
            </TabsTrigger>
            <TabsTrigger value="proposals" className="gap-2">
              <FileCheck className="w-4 h-4" />
              Ponude
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="w-4 h-4" />
              Projekti
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Pretplate
            </TabsTrigger>
            <TabsTrigger value="vault" className="gap-2">
              <Lock className="w-4 h-4" />
              Trezor
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <LifeBuoy className="w-4 h-4" />
              Tiketi
            </TabsTrigger>
          </TabsList>

          {/* Contact Details Tab */}
          <TabsContent value="contact" className="animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-display">Podaci o Klijentu</CardTitle>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 font-display">
                    <FileText className="h-5 w-5" />
                    Fakture
                  </CardTitle>
                  <Button onClick={() => setOpenInvoiceDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Faktura
                  </Button>
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
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Briefcase className="h-5 w-5" />
                  Poslovi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nema poslova za ovog klijenta</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deals.map(deal => (
                      <Card key={deal.id}>
                        <CardContent className="p-4">
                          <div className={`${getDealStatusColor(deal.status)} text-white px-3 py-1 rounded-lg inline-block text-xs font-medium mb-2`}>
                            {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                          </div>
                          <h3 className="font-semibold text-lg">{deal.naziv}</h3>
                          <p className="text-2xl font-bold text-primary mt-2">{deal.vrijednost.toFixed(2)} KM</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 font-display">
                    <CheckSquare className="h-5 w-5" />
                    Zadaci
                  </CardTitle>
                  <Button onClick={() => setOpenTaskDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novi Zadatak
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nema zadataka za ovog klijenta</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card group hover:border-primary/40 transition-all">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.naziv}
                          </p>
                          <p className="text-sm text-muted-foreground">Rok: {task.rok}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <StickyNote className="h-5 w-5" />
                  Bilješke
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={client.biljeske}
                  onChange={(e) => {
                    setClient({ ...client, biljeske: e.target.value });
                    // Auto-save after typing stops
                    clearTimeout((window as any).notesTimeout);
                    (window as any).notesTimeout = setTimeout(async () => {
                      try {
                        const clients = await storage.getJSON<Client[]>("crm-clients") || [];
                        const updated = clients.map((c) => (c.id === client.id ? client : c));
                        await storage.setJSON("crm-clients", updated);
                      } catch (error) {
                        console.error("Error auto-saving notes:", error);
                      }
                    }, 1000);
                  }}
                  placeholder="Dodajte bilješke o klijentu..."
                  className="min-h-[300px]"
                />
                <p className="text-xs text-muted-foreground mt-2">Bilješke se automatski čuvaju</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="animate-fade-in">
            <CommunicationLog
              clientId={clientId!}
              entries={communications}
              onAddEntry={addCommunication}
            />
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="animate-fade-in">
            <AdminProposals
              clientId={clientId!}
              proposals={proposals}
              onUpdate={async (updatedProposals) => {
                setProposals(updatedProposals);
                await storage.setJSON("crm-proposals", [
                  ...await storage.getJSON<Proposal[]>("crm-proposals").then(all => 
                    all?.filter(p => p.clientId !== clientId) || []
                  ),
                  ...updatedProposals
                ]);
              }}
              deals={deals}
            />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="animate-fade-in">
            <AdminProjects
              clientId={clientId!}
              projects={projects}
              onUpdate={async (updatedProjects) => {
                setProjects(updatedProjects);
                await storage.setJSON("crm-projects", [
                  ...await storage.getJSON<Project[]>("crm-projects").then(all => 
                    all?.filter(p => p.clientId !== clientId) || []
                  ),
                  ...updatedProjects
                ]);
              }}
            />
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="animate-fade-in">
            <AdminSubscriptions
              clientId={clientId!}
              subscriptions={subscriptions}
              onUpdate={async (updatedSubscriptions) => {
                setSubscriptions(updatedSubscriptions);
                await storage.setJSON("crm-subscriptions", [
                  ...await storage.getJSON<Subscription[]>("crm-subscriptions").then(all => 
                    all?.filter(s => s.clientId !== clientId) || []
                  ),
                  ...updatedSubscriptions
                ]);
              }}
            />
          </TabsContent>

          {/* Vault Tab */}
          <TabsContent value="vault" className="animate-fade-in">
            <AdminVault
              clientId={clientId!}
              vaultEntries={vaultEntries}
              onUpdate={async (updatedEntries) => {
                setVaultEntries(updatedEntries);
                await storage.setJSON("crm-vault", [
                  ...await storage.getJSON<VaultEntry[]>("crm-vault").then(all => 
                    all?.filter(v => v.clientId !== clientId) || []
                  ),
                  ...updatedEntries
                ]);
              }}
            />
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="animate-fade-in">
            <AdminSupportTickets
              clientId={clientId!}
              tickets={tickets}
              onUpdate={async (updatedTickets) => {
                setTickets(updatedTickets);
                await storage.setJSON("crm-tickets", [
                  ...await storage.getJSON<SupportTicket[]>("crm-tickets").then(all => 
                    all?.filter(t => t.clientId !== clientId) || []
                  ),
                  ...updatedTickets
                ]);
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Invoice Dialog */}
      <Dialog open={openInvoiceDialog} onOpenChange={setOpenInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Nova Faktura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brojFakture">Broj Fakture</Label>
              <Input
                id="brojFakture"
                value={invoiceFormData.brojFakture}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, brojFakture: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="iznos">Iznos (KM)</Label>
              <Input
                id="iznos"
                type="number"
                value={invoiceFormData.iznos}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, iznos: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="datumIzdavanja">Datum Izdavanja</Label>
              <Input
                id="datumIzdavanja"
                type="date"
                value={invoiceFormData.datumIzdavanja}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, datumIzdavanja: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="rokPlacanja">Rok Plaćanja</Label>
              <Input
                id="rokPlacanja"
                type="date"
                value={invoiceFormData.rokPlacanja}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, rokPlacanja: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={invoiceFormData.status}
                onValueChange={(v) => setInvoiceFormData({ ...invoiceFormData, status: v as Invoice["status"] })}
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

      {/* Add Task Dialog */}
      <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Novi Zadatak</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-naziv">Naziv Zadatka</Label>
              <Input
                id="task-naziv"
                value={taskFormData.naziv}
                onChange={(e) => setTaskFormData({ ...taskFormData, naziv: e.target.value })}
                placeholder="Npr. Nazvati klijenta, Poslati ponudu..."
              />
            </div>
            <div>
              <Label htmlFor="task-rok">Rok</Label>
              <Input
                id="task-rok"
                type="date"
                value={taskFormData.rok}
                onChange={(e) => setTaskFormData({ ...taskFormData, rok: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={addTask} className="w-full">
            Dodaj Zadatak
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDetailNew;
