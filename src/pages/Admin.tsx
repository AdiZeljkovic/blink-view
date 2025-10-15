import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, LogOut, Home, Bookmark, Calendar, CheckSquare, Server, CloudSun } from "lucide-react";
import AdminHomeWidgets from "@/components/admin/AdminHomeWidgets";
import AdminBookmarks from "@/components/admin/AdminBookmarks";
import AdminBoards from "@/components/admin/AdminBoards";
import AdminGaming from "@/components/admin/AdminGaming";
import AdminTech from "@/components/admin/AdminTech";
import AdminVijesti from "@/components/admin/AdminVijesti";
import AdminKalendar from "@/components/admin/AdminKalendar";

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-[1600px]">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl">Admin Panel</CardTitle>
                  <CardDescription>Upravljajte sadržajem na svim stranicama</CardDescription>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Odjavi se
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 h-auto flex-wrap">
            <TabsTrigger value="home" className="gap-2">
              <Home className="w-4 h-4" />
              Početna
            </TabsTrigger>
            <TabsTrigger value="gaming" className="gap-2">
              <Server className="w-4 h-4" />
              Gaming
            </TabsTrigger>
            <TabsTrigger value="tech" className="gap-2">
              <Server className="w-4 h-4" />
              Tech
            </TabsTrigger>
            <TabsTrigger value="vijesti" className="gap-2">
              <Server className="w-4 h-4" />
              Vijesti
            </TabsTrigger>
            <TabsTrigger value="kalendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Kalendar
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="boards" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Boards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <AdminHomeWidgets />
          </TabsContent>

          <TabsContent value="gaming">
            <AdminGaming />
          </TabsContent>

          <TabsContent value="tech">
            <AdminTech />
          </TabsContent>

          <TabsContent value="vijesti">
            <AdminVijesti />
          </TabsContent>

          <TabsContent value="kalendar">
            <AdminKalendar />
          </TabsContent>

          <TabsContent value="bookmarks">
            <AdminBookmarks />
          </TabsContent>

          <TabsContent value="boards">
            <AdminBoards />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
