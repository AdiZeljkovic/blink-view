import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const AdminHomeWidgets = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [homelabApps, setHomelabApps] = useState<any[]>([]);
  const [weatherCity, setWeatherCity] = useState("Sarajevo");

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("widget-bookmarks");
    const savedApps = localStorage.getItem("homelab-apps");
    const savedCity = localStorage.getItem("weather-city");
    
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedApps) setHomelabApps(JSON.parse(savedApps));
    if (savedCity) setWeatherCity(savedCity);
  }, []);

  const addBookmark = () => {
    const newBookmark = { name: "", url: "" };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem("widget-bookmarks", JSON.stringify(updated));
  };

  const updateBookmark = (index: number, field: string, value: string) => {
    const updated = [...bookmarks];
    updated[index][field] = value;
    setBookmarks(updated);
    localStorage.setItem("widget-bookmarks", JSON.stringify(updated));
  };

  const deleteBookmark = (index: number) => {
    const updated = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updated);
    localStorage.setItem("widget-bookmarks", JSON.stringify(updated));
    toast.success("Bookmark obrisan");
  };

  const addHomelabApp = () => {
    const newApp = { name: "", url: "", icon: "Server" };
    const updated = [...homelabApps, newApp];
    setHomelabApps(updated);
    localStorage.setItem("homelab-apps", JSON.stringify(updated));
  };

  const updateHomelabApp = (index: number, field: string, value: string) => {
    const updated = [...homelabApps];
    updated[index][field] = value;
    setHomelabApps(updated);
    localStorage.setItem("homelab-apps", JSON.stringify(updated));
  };

  const deleteHomelabApp = (index: number) => {
    const updated = homelabApps.filter((_, i) => i !== index);
    setHomelabApps(updated);
    localStorage.setItem("homelab-apps", JSON.stringify(updated));
    toast.success("Aplikacija obrisana");
  };

  const saveWeatherCity = () => {
    localStorage.setItem("weather-city", weatherCity);
    toast.success("Grad sačuvan");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vremenska Prognoza</CardTitle>
          <CardDescription>Uredite postavke vremenskog widgeta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Grad</Label>
            <Input
              value={weatherCity}
              onChange={(e) => setWeatherCity(e.target.value)}
              placeholder="Sarajevo"
            />
          </div>
          <Button onClick={saveWeatherCity}>Sačuvaj</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bookmark Widget</CardTitle>
              <CardDescription>Upravljajte bookmarks na početnoj stranici</CardDescription>
            </div>
            <Button onClick={addBookmark} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookmarks.map((bookmark, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Naziv</Label>
                <Input
                  value={bookmark.name}
                  onChange={(e) => updateBookmark(index, "name", e.target.value)}
                  placeholder="GitHub"
                />
              </div>
              <div className="flex-1">
                <Label>URL</Label>
                <Input
                  value={bookmark.url}
                  onChange={(e) => updateBookmark(index, "url", e.target.value)}
                  placeholder="https://github.com"
                />
              </div>
              <Button
                onClick={() => deleteBookmark(index)}
                variant="destructive"
                size="icon"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Homelab Aplikacije</CardTitle>
              <CardDescription>Upravljajte aplikacijama sa servera</CardDescription>
            </div>
            <Button onClick={addHomelabApp} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {homelabApps.map((app, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Naziv</Label>
                <Input
                  value={app.name}
                  onChange={(e) => updateHomelabApp(index, "name", e.target.value)}
                  placeholder="Proxmox"
                />
              </div>
              <div className="flex-1">
                <Label>URL</Label>
                <Input
                  value={app.url}
                  onChange={(e) => updateHomelabApp(index, "url", e.target.value)}
                  placeholder="https://proxmox.local"
                />
              </div>
              <div className="flex-1">
                <Label>Ikona</Label>
                <Input
                  value={app.icon}
                  onChange={(e) => updateHomelabApp(index, "icon", e.target.value)}
                  placeholder="Server"
                />
              </div>
              <Button
                onClick={() => deleteHomelabApp(index)}
                variant="destructive"
                size="icon"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHomeWidgets;
