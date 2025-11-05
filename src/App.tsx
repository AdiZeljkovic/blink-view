import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Gaming from "./pages/Gaming";
import Tech from "./pages/Tech";
import Vijesti from "./pages/Vijesti";
import Kalendar from "./pages/KalendarNew";
import Boards from "./pages/Boards";
import Finance from "./pages/Finance";
import CRMDashboard from "./pages/CRMDashboard";
import CRMClients from "./pages/CRMNew";
import ClientDetail from "./pages/ClientDetailNew";
import FocusTimer from "./pages/FocusTimer";
import HabitsGoals from "./pages/HabitsGoalsNew";
import MoodTracker from "./pages/MoodTracker";
import Admin from "./pages/AdminNew";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gaming" element={<Gaming />} />
            <Route path="/tech" element={<Tech />} />
            <Route path="/vijesti" element={<Vijesti />} />
            <Route path="/kalendar" element={<Kalendar />} />
            <Route path="/boards" element={<Boards />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/crm" element={<CRMDashboard />} />
            <Route path="/crm/clients" element={<CRMClients />} />
            <Route path="/crm/clients/:clientId" element={<ClientDetail />} />
            <Route path="/focus-timer" element={<FocusTimer />} />
            <Route path="/habits-goals" element={<HabitsGoals />} />
            <Route path="/mood-tracker" element={<MoodTracker />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
