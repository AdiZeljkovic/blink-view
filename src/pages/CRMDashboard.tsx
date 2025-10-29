import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, DollarSign, TrendingUp, Briefcase } from "lucide-react";
import SalesFunnel from "@/components/crm/SalesFunnel";
import RevenueChart from "@/components/crm/RevenueChart";
import TodaysTasks from "@/components/crm/TodaysTasks";
import ClientsFollowUp from "@/components/crm/ClientsFollowUp";
import type { Client, Deal, Invoice, Task } from "@/types/crm";

const CRMDashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedClients = await storage.getJSON<Client[]>("crm-clients") || [];
        const savedDeals = await storage.getJSON<Deal[]>("crm-deals") || [];
        const savedInvoices = await storage.getJSON<Invoice[]>("crm-invoices") || [];
        const savedTasks = await storage.getJSON<Task[]>("crm-tasks") || [];

        setClients(savedClients);
        setDeals(savedDeals);
        setInvoices(savedInvoices);
        setTasks(savedTasks);
      } catch (error) {
        console.error("Error loading CRM data:", error);
      }
    };
    loadData();
  }, []);

  const totalRevenue = invoices
    .filter(inv => inv.status === "placeno")
    .reduce((sum, inv) => sum + inv.iznos, 0);

  const activeDeals = deals.filter(d => d.status !== "dobijeno" && d.status !== "izgubljeno").length;
  const pipelineValue = deals
    .filter(d => d.status !== "izgubljeno")
    .reduce((sum, d) => sum + d.vrijednost, 0);

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
