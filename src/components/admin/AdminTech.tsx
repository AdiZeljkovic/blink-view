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
  type: "news" | "youtube" | "reddit";
}

const AdminTech = () => {
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [widgetTitle, setWidgetTitle] = useState("Tech Hub");

  useEffect(() => {
    const savedFeeds = localStorage.getItem("tech-rss-feeds");
    const savedTitle = localStorage.getItem("tech-widget-title");
    
    if (savedFeeds) {
      setRssFeeds(JSON.parse(savedFeeds));
    } else {
      // Default feeds
      setRssFeeds([
        { id: "1", name: "TechCrunch", url: "https://techcrunch.com/feed/", type: "news" },
        { id: "2", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", type: "news" },
        { id: "3", name: "r/technology", url: "https://www.reddit.com/r/technology.json", type: "reddit" },
      ]);
    }
    
    if (savedTitle) setWidgetTitle(savedTitle);
  }, []);

  const addFeed = () => {
    const newFeed: RSSFeed = {
      id: Date.now().toString(),
      name: "",
      url: "",
      type: "news"
    };
    const updated = [...rssFeeds, newFeed];
    setRssFeeds(updated);
    localStorage.setItem("tech-rss-feeds", JSON.stringify(updated));
  };

  const updateFeed = (id: string, field: keyof RSSFeed, value: string) => {
    const updated = rssFeeds.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    setRssFeeds(updated);
    localStorage.setItem("tech-rss-feeds", JSON.stringify(updated));
  };

  const deleteFeed = (id: string) => {
    const updated = rssFeeds.filter(f => f.id !== id);
    setRssFeeds(updated);
    localStorage.setItem("tech-rss-feeds", JSON.stringify(updated));
    toast.success("RSS feed obrisan");
  };

  const saveTitle = () => {
    localStorage.setItem("tech-widget-title", widgetTitle);
    toast.success("Naslov sačuvan");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Postavke Stranice</CardTitle>
          <CardDescription>Uredite osnovne postavke Tech stranice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Naslov Stranice</Label>
            <Input
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              placeholder="Tech Hub"
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
          {rssFeeds.map((feed) => (
            <div key={feed.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Naziv</Label>
                  <Input
                    value={feed.name}
                    onChange={(e) => updateFeed(feed.id, "name", e.target.value)}
                    placeholder="TechCrunch, MKBHD..."
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

export default AdminTech;
