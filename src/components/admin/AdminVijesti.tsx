import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  type: "world" | "regional" | "reddit";
}

const AdminVijesti = () => {
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [widgetTitle, setWidgetTitle] = useState("Vijesti");

  useEffect(() => {
    const savedFeeds = localStorage.getItem("vijesti-rss-feeds");
    const savedTitle = localStorage.getItem("vijesti-widget-title");
    
    if (savedFeeds) {
      setRssFeeds(JSON.parse(savedFeeds));
    } else {
      // Default feeds
      setRssFeeds([
        { id: "1", name: "BBC News", url: "http://feeds.bbci.co.uk/news/world/rss.xml", type: "world" },
        { id: "2", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", type: "world" },
        { id: "3", name: "Klix.ba", url: "https://www.klix.ba/rss", type: "regional" },
        { id: "4", name: "Blic.rs", url: "https://www.blic.rs/rss", type: "regional" },
        { id: "5", name: "r/worldnews", url: "https://www.reddit.com/r/worldnews.json", type: "reddit" },
      ]);
    }
    
    if (savedTitle) setWidgetTitle(savedTitle);
  }, []);

  const addFeed = () => {
    const newFeed: RSSFeed = {
      id: Date.now().toString(),
      name: "",
      url: "",
      type: "world"
    };
    const updated = [...rssFeeds, newFeed];
    setRssFeeds(updated);
    localStorage.setItem("vijesti-rss-feeds", JSON.stringify(updated));
  };

  const updateFeed = (id: string, field: keyof RSSFeed, value: string) => {
    const updated = rssFeeds.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    setRssFeeds(updated);
    localStorage.setItem("vijesti-rss-feeds", JSON.stringify(updated));
  };

  const deleteFeed = (id: string) => {
    const updated = rssFeeds.filter(f => f.id !== id);
    setRssFeeds(updated);
    localStorage.setItem("vijesti-rss-feeds", JSON.stringify(updated));
    toast.success("RSS feed obrisan");
  };

  const saveTitle = () => {
    localStorage.setItem("vijesti-widget-title", widgetTitle);
    toast.success("Naslov sačuvan");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Postavke Stranice</CardTitle>
          <CardDescription>Uredite osnovne postavke Vijesti stranice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Naslov Stranice</Label>
            <Input
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              placeholder="Vijesti"
            />
          </div>
          <Button onClick={saveTitle}>Sačuvaj</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>RSS Feedovi</CardTitle>
              <CardDescription>Dodajte ili uredite izvore vijesti sa cijelog svijeta i regije</CardDescription>
            </div>
            <Button onClick={addFeed} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj Feed
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rssFeeds.map((feed) => (
            <div key={feed.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Naziv</Label>
                  <Input
                    value={feed.name}
                    onChange={(e) => updateFeed(feed.id, "name", e.target.value)}
                    placeholder="BBC News, Klix..."
                  />
                </div>
                <div>
                  <Label>URL RSS Feeda</Label>
                  <Input
                    value={feed.url}
                    onChange={(e) => updateFeed(feed.id, "url", e.target.value)}
                    placeholder="https://example.com/rss"
                  />
                </div>
                <div>
                  <Label>Tip</Label>
                  <select
                    value={feed.type}
                    onChange={(e) => updateFeed(feed.id, "type", e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                  >
                    <option value="world">Svijet</option>
                    <option value="regional">Regija</option>
                    <option value="reddit">Reddit</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => deleteFeed(feed.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Obriši
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVijesti;
