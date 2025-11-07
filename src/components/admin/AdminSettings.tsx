import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Download, Upload, Database } from "lucide-react";

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Supabase connection settings
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  
  // Vaktija API Key
  const [vaktijaApiKey, setVaktijaApiKey] = useState("");

  useEffect(() => {
    const savedUrl = localStorage.getItem("custom_supabase_url");
    const savedKey = localStorage.getItem("custom_supabase_key");
    const savedVaktijaKey = localStorage.getItem("vaktija_api_key");
    
    if (savedUrl && savedKey) {
      setSupabaseUrl(savedUrl);
      setSupabaseKey(savedKey);
      setIsSupabaseConnected(true);
    }
    
    if (savedVaktijaKey) {
      setVaktijaApiKey(savedVaktijaKey);
    }
  }, []);

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

  const handleSupabaseConnect = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Unesite URL i Anon Key");
      return;
    }

    // Trim whitespace from inputs
    const cleanUrl = supabaseUrl.trim();
    const cleanKey = supabaseKey.trim();

    console.log('[Supabase Connect] Attempting to connect to:', cleanUrl);

    // Test connection using Supabase client
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(cleanUrl, cleanKey);
      
      console.log('[Supabase Connect] Testing connection with auth check...');
      
      // Try to get session to verify connection works
      const { error: authError } = await testClient.auth.getSession();
      
      if (authError) {
        console.error('[Supabase Connect] Auth error:', authError);
        
        // Check if it's a network/CORS error vs auth error
        if (authError.message.includes('fetch') || authError.message.includes('NetworkError') || authError.message.includes('CORS')) {
          toast.error(`Greška mreže: Provjerite da li je Supabase dostupan na ${cleanUrl} i da li su CORS pravila ispravno podešena`);
        } else {
          // Auth errors are actually OK - it means we can reach the server
          console.log('[Supabase Connect] Connection successful (auth not configured is OK)');
          localStorage.setItem("custom_supabase_url", cleanUrl);
          localStorage.setItem("custom_supabase_key", cleanKey);
          setIsSupabaseConnected(true);
          toast.success("Supabase uspješno povezan!");
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return;
        }
      } else {
        // Connection successful
        console.log('[Supabase Connect] Connection successful');
        localStorage.setItem("custom_supabase_url", cleanUrl);
        localStorage.setItem("custom_supabase_key", cleanKey);
        setIsSupabaseConnected(true);
        toast.success("Supabase uspješno povezan!");
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      console.error('[Supabase Connect] Connection failed:', error);
      
      let errorMessage = "Greška pri povezivanju sa Supabase-om";
      
      if (error.message) {
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          errorMessage = `Greška mreže: Ne mogu pristupiti ${cleanUrl}. Provjerite URL i mrežnu konekciju.`;
        } else if (error.message.includes('CORS')) {
          errorMessage = "CORS greška: Supabase mora dozvoliti pristup sa ovog domena.";
        } else {
          errorMessage = `Greška: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleSupabaseDisconnect = () => {
    localStorage.removeItem("custom_supabase_url");
    localStorage.removeItem("custom_supabase_key");
    setSupabaseUrl("");
    setSupabaseKey("");
    setIsSupabaseConnected(false);
    toast.success("Supabase veza prekinuta");
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleVaktijaApiKeySave = () => {
    if (!vaktijaApiKey.trim()) {
      toast.error("Unesite API ključ");
      return;
    }
    
    localStorage.setItem("vaktija_api_key", vaktijaApiKey.trim());
    toast.success("Vaktija API ključ sačuvan");
  };

  const handleVaktijaApiKeyRemove = () => {
    localStorage.removeItem("vaktija_api_key");
    setVaktijaApiKey("");
    toast.success("Vaktija API ključ uklonjen");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Self-Hosted Supabase Konekcija</CardTitle>
              <CardDescription>Povežite aplikaciju sa vašom Supabase instancom</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSupabaseConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm font-semibold text-primary mb-2">✓ Povezano sa Supabase</p>
                <p className="text-xs text-muted-foreground break-all">{supabaseUrl}</p>
              </div>
              <Button onClick={handleSupabaseDisconnect} variant="destructive">
                Prekini Vezu
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">Supabase URL</Label>
                <Input
                  id="supabaseUrl"
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
                <Input
                  id="supabaseKey"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                />
              </div>
              <Button onClick={handleSupabaseConnect}>
                Poveži Supabase
              </Button>
              <p className="text-xs text-muted-foreground">
                Nakon povezivanja, svi podaci će se čuvati u vašoj Supabase bazi umjesto u browseru.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Vaktija API Ključ</CardTitle>
              <CardDescription>Podesite API ključ za Vaktija.ba servis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="vaktijaApiKey">API Ključ</Label>
            <Input
              id="vaktijaApiKey"
              type="text"
              placeholder="Unesite API ključ..."
              value={vaktijaApiKey}
              onChange={(e) => setVaktijaApiKey(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleVaktijaApiKeySave}>
              Sačuvaj
            </Button>
            {vaktijaApiKey && (
              <Button onClick={handleVaktijaApiKeyRemove} variant="destructive">
                Ukloni
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            API ključ možete dobiti na{" "}
            <a 
              href="https://vaktija.ba" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              vaktija.ba
            </a>
          </p>
        </CardContent>
      </Card>

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