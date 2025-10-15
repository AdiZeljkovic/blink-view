import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Download, Upload } from "lucide-react";

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    const storedPassword = localStorage.getItem("admin_password") || "BubaZeljković2112!";
    
    if (currentPassword !== storedPassword) {
      toast.error("Trenutna šifra nije tačna");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Nove šifre se ne podudaraju");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Nova šifra mora imati najmanje 8 karaktera");
      return;
    }
    
    localStorage.setItem("admin_password", newPassword);
    toast.success("Šifra uspješno promijenjena");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleExport = () => {
    const data: Record<string, any> = {};
    
    // Collect all localStorage data except sensitive info
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== "admin_logged_in") {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Postavke eksportovane");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Import all data to localStorage
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        });
        
        toast.success("Postavke uspješno uvezene");
        
        // Dispatch events to update all widgets
        window.dispatchEvent(new Event("notesUpdated"));
        window.dispatchEvent(new Event("storage"));
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error("Greška pri učitavanju fajla");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Promjena Šifre</CardTitle>
              <CardDescription>Promijenite admin šifru</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Trenutna Šifra</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Šifra</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrdi Novu Šifru</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Promijeni Šifru</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Backup i Restore</CardTitle>
              <CardDescription>Eksportujte ili importujte sve postavke</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Eksportuj Sve Postavke
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Preuzmi sve postavke kao JSON fajl
            </p>
          </div>
          <div>
            <Label htmlFor="import-file" className="cursor-pointer">
              <Button type="button" variant="outline" className="gap-2" asChild>
                <span>
                  <Upload className="w-4 h-4" />
                  Importuj Postavke
                </span>
              </Button>
            </Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Učitaj prethodno sačuvane postavke
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;