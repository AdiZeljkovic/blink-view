import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, LogOut, Users, DollarSign, Activity, TrendingUp } from "lucide-react";
import AdminHomeWidgets from "@/components/admin/AdminHomeWidgets";
import AdminBookmarks from "@/components/admin/AdminBookmarks";
import AdminBoards from "@/components/admin/AdminBoards";
import AdminGaming from "@/components/admin/AdminGaming";
import AdminTech from "@/components/admin/AdminTech";
import AdminVijesti from "@/components/admin/AdminVijesti";
import AdminKalendar from "@/components/admin/AdminKalendar";
import AdminSettings from "@/components/admin/AdminSettings";

const AdminNew = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const adminStatus = localStorage.getItem("admin_logged_in");
    if (adminStatus !== "true") {
      navigate("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    toast.success("Odjavljeni ste");
    navigate("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  const kpiData = [
    { label: "Ukupno Klijenata", value: "24", icon: Users, color: "text-blue-500" },
    { label: "Mjesečni Prihod", value: "15,240 KM", icon: DollarSign, color: "text-green-500" },
    { label: "Aktivnih Zadataka", value: "12", icon: Activity, color: "text-orange-500" },
    { label: "Rast", value: "+23%", icon: TrendingUp, color: "text-purple-500" },
  ];

  const tabs = [
    { id: "home", label: "Početna" },
    { id: "gaming", label: "Gaming" },
    { id: "tech", label: "Tech" },
    { id: "vijesti", label: "Vijesti" },
    { id: "kalendar", label: "Kalendar" },
    { id: "bookmarks", label: "Bookmarks" },
    { id: "boards", label: "Boards" },
    { id: "settings", label: "Postavke" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-[1800px]">
        {/* Header with KPIs */}
        <Card className="mb-8 glass-card border-2 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-primary animate-pulse" />
                <div>
                  <CardTitle className="text-4xl font-display gradient-text">Admin Dashboard</CardTitle>
                  <CardDescription className="text-base">Centralno upravljanje sistemom</CardDescription>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" className="gap-2 shadow-md">
                <LogOut className="w-4 h-4" />
                Odjavi se
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => (
                <Card 
                  key={index} 
                  className="border-2 hover:shadow-glow-md transition-all duration-300 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                        <p className="text-3xl font-bold font-display mt-2">{kpi.value}</p>
                      </div>
                      <kpi.icon className={`w-12 h-12 ${kpi.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-6">
          {/* Right Sidebar Navigation */}
          <div className="w-64 flex-shrink-0 order-2">
            <Card className="glass-card sticky top-6">
              <CardHeader>
                <CardTitle className="font-display text-lg">Navigacija</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-glow-sm"
                        : "hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 order-1">
            <div className="animate-fade-in">
              {activeTab === "home" && <AdminHomeWidgets />}
              {activeTab === "gaming" && <AdminGaming />}
              {activeTab === "tech" && <AdminTech />}
              {activeTab === "vijesti" && <AdminVijesti />}
              {activeTab === "kalendar" && <AdminKalendar />}
              {activeTab === "bookmarks" && <AdminBookmarks />}
              {activeTab === "boards" && <AdminBoards />}
              {activeTab === "settings" && <AdminSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNew;
