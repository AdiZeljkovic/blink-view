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
import { useSupabase } from "@/hooks/useSupabase";
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
  const { supabase } = useSupabase();
  const { toast } = useToast();
  
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
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (supabase && clientId) {
      loadData();
    }
  }, [supabase, clientId]);

  const loadData = async () => {
    if (!supabase || !clientId) return;

    try {
      setLoading(true);

      const { data: foundClient, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (clientError || !foundClient) {
        toast({
          title: "Greška",
          description: "Klijent nije pronađen",
          variant: "destructive",
        });
        navigate("/crm");
        return;
      }

      setClient(foundClient);

      const [
        invoicesRes,
        tasksRes,
        dealsRes,
        communicationsRes,
        proposalsRes,
        projectsRes,
        subscriptionsRes,
        vaultRes,
        ticketsRes,
      ] = await Promise.all([
        supabase.from("invoices").select("*").eq("clientId", clientId),
        supabase.from("tasks").select("*").eq("clientId", clientId),
        supabase.from("deals").select("*").eq("clientId", clientId),
        supabase.from("communication_entries").select("*").eq("clientId", clientId),
        supabase.from("proposals").select("*").eq("clientId", clientId),
        supabase.from("projects").select("*").eq("clientId", clientId),
        supabase.from("subscriptions").select("*").eq("clientId", clientId),
        supabase.from("vault_entries").select("*").eq("clientId", clientId),
        supabase.from("support_tickets").select("*").eq("clientId", clientId),
      ]);

      setInvoices(invoicesRes.data || []);
      setTasks(tasksRes.data || []);
      setDeals(dealsRes.data || []);
      setCommunications(communicationsRes.data || []);
      setProposals(proposalsRes.data || []);
      setProjects(projectsRes.data || []);
      setSubscriptions(subscriptionsRes.data || []);
      setVaultEntries(vaultRes.data || []);
      setTickets(ticketsRes.data || []);
    } catch (error) {
      console.error("Error loading client data:", error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati podatke klijenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveClient = async () => {
    if (!client || !supabase) return;

    try {
      const { error } = await supabase
        .from("clients")
        .update(client)
        .eq("id", client.id);

      if (error) throw error;

      setEditMode(false);
      toast({
        title: "Uspjeh",
        description: "Podaci klijenta su ažurirani",
      });
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Greška",
        description: "Nije moguće ažurirati klijenta",
        variant: "destructive",
      });
    }
  };

  const addInvoice = async () => {
    if (!invoiceFormData.brojFakture || !invoiceFormData.iznos || !supabase) {
      toast({
        title: "Upozorenje",
        description: "Popunite sva polja",
        variant: "destructive",
      });
      return;
    }

    const newInvoice: Omit<Invoice, "id"> = {
      clientId: clientId!,
      brojFakture: invoiceFormData.brojFakture,
      iznos: parseFloat(invoiceFormData.iznos),
      datumIzdavanja: invoiceFormData.datumIzdavanja,
      rokPlacanja: invoiceFormData.rokPlacanja,
      status: invoiceFormData.status,
    };

    try {
      const { data, error } = await supabase
        .from("invoices")
        .insert([newInvoice])
        .select()
        .single();

      if (error) throw error;

      setInvoices([...invoices, data]);
      setInvoiceFormData({
        brojFakture: "",
        iznos: "",
        datumIzdavanja: new Date().toISOString().split("T")[0],
        rokPlacanja: "",
        status: "nacrt",
      });
      setOpenInvoiceDialog(false);
      toast({
        title: "Uspjeh",
        description: "Faktura je dodana",
      });
    } catch (error) {
      console.error("Error adding invoice:", error);
      toast({
        title: "Greška",
        description: "Nije moguće dodati fakturu",
        variant: "destructive",
      });
    }
  };

  const addTask = async () => {
    if (!taskFormData.naziv || !supabase) {
      toast({
        title: "Upozorenje",
        description: "Unesite naziv zadatka",
        variant: "destructive",
      });
      return;
    }

    const newTask: Omit<Task, "id"> = {
      clientId: clientId!,
      naziv: taskFormData.naziv,
      rok: taskFormData.rok,
      completed: false,
    };

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      setTasks([...tasks, data]);
      setTaskFormData({ naziv: "", rok: new Date().toISOString().split("T")[0] });
      setOpenTaskDialog(false);
      toast({
        title: "Uspjeh",
        description: "Zadatak je dodan",
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Greška",
        description: "Nije moguće dodati zadatak",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!supabase) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", taskId);

      if (error) throw error;

      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error toggling task:", error);
      toast({
        title: "Greška",
        description: "Nije moguće ažurirati zadatak",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== taskId));
      toast({
        title: "Uspjeh",
        description: "Zadatak je obrisan",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Greška",
        description: "Nije moguće obrisati zadatak",
        variant: "destructive",
      });
    }
  };

  const addCommunication = async (entry: Omit<CommunicationEntry, "id">) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("communication_entries")
        .insert([entry])
        .select()
        .single();

      if (error) throw error;

      setCommunications([...communications, data]);

      // Update client's last contact date
      if (client) {
        const { error: updateError } = await supabase
          .from("clients")
          .update({ datumZadnjegKontakta: entry.datum })
          .eq("id", client.id);

        if (!updateError) {
          setClient({ ...client, datumZadnjegKontakta: entry.datum });
        }
      }

      toast({
        title: "Uspjeh",
        description: "Komunikacija je zabilježena",
      });
    } catch (error) {
      console.error("Error adding communication:", error);
      toast({
        title: "Greška",
        description: "Nije moguće dodati komunikaciju",
        variant: "destructive",
      });
    }
  };

  const addInvoiceToFinance = async (invoice: Invoice) => {
    if (!supabase) return;

    try {
      const transaction = {
        opis: `Faktura #${invoice.brojFakture} - ${client?.ime}`,
        iznos: invoice.iznos,
        tip: "prihod" as const,
        datum: invoice.datumIzdavanja,
      };

      const { error } = await supabase
        .from("transactions")
        .insert([transaction]);

      if (error) throw error;

      toast({
        title: "Uspjeh",
        description: "Transakcija dodana u Finansije",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Greška",
        description: "Nije moguće dodati transakciju",
        variant: "destructive",
      });
    }
  };

  const saveClientNotes = async () => {
    if (!client || !supabase) return;

    try {
      const { error } = await supabase
        .from("clients")
        .update({ biljeske: client.biljeske })
        .eq("id", client.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error auto-saving notes:", error);
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

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

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
                      <TableHead>Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                          <TableCell>
                            {inv.status === "placeno" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addInvoiceToFinance(inv)}
                              >
                                Zabilježi u Finansije
                              </Button>
                            )}
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
                    (window as any).notesTimeout = setTimeout(saveClientNotes, 1000);
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
              onUpdate={setProposals}
              deals={deals}
            />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="animate-fade-in">
            <AdminProjects
              clientId={clientId!}
              projects={projects}
              onUpdate={setProjects}
            />
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="animate-fade-in">
            <AdminSubscriptions
              clientId={clientId!}
              subscriptions={subscriptions}
              onUpdate={setSubscriptions}
            />
          </TabsContent>

          {/* Vault Tab */}
          <TabsContent value="vault" className="animate-fade-in">
            <AdminVault
              clientId={clientId!}
              vaultEntries={vaultEntries}
              onUpdate={setVaultEntries}
            />
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="animate-fade-in">
            <AdminSupportTickets
              clientId={clientId!}
              tickets={tickets}
              onUpdate={setTickets}
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
