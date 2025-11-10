import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const storedPassword = localStorage.getItem("admin_password") || "BubaZeljković2112!";
    
    if (email === "adi.zeljkovic@outlook.com" && password === storedPassword) {
      localStorage.setItem("admin_logged_in", "true");
      toast.success("Uspješno prijavljeni!");
      // Force navigation and page reload to ensure state updates
      setTimeout(() => {
        navigate("/admin");
        window.location.reload();
      }, 100);
    } else {
      toast.error("Pogrešni pristupni podaci");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Admin Panel</CardTitle>
          <CardDescription className="text-center">
            Prijavite se za pristup admin panelu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adi.zeljkovic@outlook.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Šifra</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Prijavi se
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
