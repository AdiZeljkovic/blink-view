import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { storage } from "@/lib/storage";

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  type: "news" | "youtube" | "reddit";
}

const AdminGaming = () => {
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [widgetTitle, setWidgetTitle] = useState("Gaming Hub");

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedFeeds = await storage.getJSON<RSSFeed[]>("gaming-rss-feeds");
        const savedTitle = localStorage.getItem("gaming-widget-title");
        
        if (savedFeeds) {
          setRssFeeds(savedFeeds);
        } else {
          const defaultFeeds: RSSFeed[] = [
            { id: "1", name: "IGN", url: "https://www.ign.com/feed.xml", type: "news" },
            { id: "2", name: "Polygon", url: "https://www.polygon.com/rss/index.xml", type: "news" },
            { id: "3", name: "r/gaming", url: "https://www.reddit.com/r/gaming.json", type: "reddit" },
          ];
          setRssFeeds(defaultFeeds);
          await storage.setJSON("gaming-rss-feeds", defaultFeeds);
        }
        
        if (savedTitle) setWidgetTitle(savedTitle);
      } catch (error) {
        console.error("Error loading gaming RSS feeds:", error);
        toast.error("Greška pri učitavanju podataka");
      }
    };
    loadData();
  }, []);

  const addFeed = async () => {
    const newFeed: RSSFeed = {
      id: Date.now().toString(),
      name: "",
      url: "",
      type: "news"
    };
    const updated = [...rssFeeds, newFeed];
    setRssFeeds(updated);
    await storage.setJSON("gaming-rss-feeds", updated);
  };

  const updateFeed = async (id: string, field: keyof RSSFeed, value: string) => {
    const updated = rssFeeds.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    setRssFeeds(updated);
    await storage.setJSON("gaming-rss-feeds", updated);
  };

  const deleteFeed = async (id: string) => {
    const updated = rssFeeds.filter(f => f.id !== id);
    setRssFeeds(updated);
    await storage.setJSON("gaming-rss-feeds", updated);
    toast.success("RSS feed obrisan");
  };

  const saveTitle = () => {
    localStorage.setItem("gaming-widget-title", widgetTitle);
    toast.success("Naslov sačuvan");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Postavke Stranice</CardTitle>
          <CardDescription>Uredite osnovne postavke Gaming stranice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Naslov Stranice</Label>
            <Input
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              placeholder="Gaming Hub"
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
              <CardDescription>Dodajte ili uredite izvore vijesti, YouTube kanale i Reddit feedove</CardDescription>
            </div>
            <Button onClick={addFeed} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj Feed
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
            <p className="font-semibold">Kako dodati feedove:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong>Vijesti:</strong> Kopirajte RSS URL (npr. https://example.com/feed.xml)</li>
              <li><strong>YouTube:</strong> https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID</li>
              <li><strong>Reddit:</strong> https://www.reddit.com/r/SUBREDDIT_NAME.json</li>
            </ul>
          </div>
          {rssFeeds.map((feed) => (
            <div key={feed.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Naziv</Label>
                  <Input
                    value={feed.name}
                    onChange={(e) => updateFeed(feed.id, "name", e.target.value)}
                    placeholder="IGN, GameSpot..."
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
                    <option value="news">Vijesti</option>
                    <option value="youtube">YouTube</option>
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

export default AdminGaming;
