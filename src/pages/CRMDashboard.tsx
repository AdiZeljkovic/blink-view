import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, DollarSign, TrendingUp, Briefcase } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import SalesFunnel from "@/components/crm/SalesFunnel";
import RevenueChart from "@/components/crm/RevenueChart";
import TodaysTasks from "@/components/crm/TodaysTasks";
import ClientsFollowUp from "@/components/crm/ClientsFollowUp";
import { SubscriptionsDueWidget } from "@/components/crm/SubscriptionsDueWidget";
import { GoalsProgressWidget } from "@/components/crm/GoalsProgressWidget";
import type { Client, Deal, Invoice, Task, Subscription } from "@/types/crm";

const CRMDashboard = () => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      loadData();
    }
  }, [supabase]);

  const loadData = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      
      const [clientsRes, dealsRes, invoicesRes, tasksRes, subscriptionsRes] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("deals").select("*"),
        supabase.from("invoices").select("*"),
        supabase.from("tasks").select("*"),
        supabase.from("subscriptions").select("*"),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (dealsRes.error) throw dealsRes.error;
      if (invoicesRes.error) throw invoicesRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (subscriptionsRes.error) throw subscriptionsRes.error;

      setClients(clientsRes.data || []);
      setDeals(dealsRes.data || []);
      setInvoices(invoicesRes.data || []);
      setTasks(tasksRes.data || []);
      setSubscriptions(subscriptionsRes.data || []);
    } catch (error) {
      console.error("Error loading CRM data:", error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati CRM podatke",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === "placeno")
    .reduce((sum, inv) => sum + inv.iznos, 0);

  const activeDeals = deals.filter(d => d.status !== "dobijeno" && d.status !== "izgubljeno").length;
  const pipelineValue = deals
    .filter(d => d.status !== "izgubljeno")
    .reduce((sum, d) => sum + d.vrijednost, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1600px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              CRM Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Pregled performansi i aktivnosti</p>
          </div>
          <Button onClick={() => navigate("/crm/clients")} size="lg">
            <Users className="h-4 w-4 mr-2" />
            Vidi Sve Klijente
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno Klijenata</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktivni Poslovi</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDeals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vrijednost Pipeline</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelineValue.toFixed(2)} KM</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupni Prihod</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)} KM</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesFunnel deals={deals} />
          <RevenueChart invoices={invoices} />
        </div>

        {/* Subscriptions Due Widget */}
        <div className="mb-8">
          <SubscriptionsDueWidget subscriptions={subscriptions} />
        </div>

        {/* Goals Progress Widget */}
        <div className="mb-8">
          <GoalsProgressWidget totalRevenue={totalRevenue} />
        </div>

        {/* Tasks and Follow-ups Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodaysTasks tasks={tasks} clients={clients} />
          <ClientsFollowUp clients={clients} />
        </div>
      </main>
    </div>
  );
};

export default CRMDashboard;
