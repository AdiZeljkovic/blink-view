import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus, Rss } from "lucide-react";

interface RSSFeed {
  name: string;
  url: string;
  category: string;
}

const AdminRSSFeeds = () => {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("rss-feeds");
    if (saved) {
      setFeeds(JSON.parse(saved));
    }
  }, []);

  const addFeed = () => {
    const newFeed: RSSFeed = { name: "", url: "", category: "tech" };
    const updated = [...feeds, newFeed];
    setFeeds(updated);
    localStorage.setItem("rss-feeds", JSON.stringify(updated));
    toast.success("Feed dodat");
  };

  const updateFeed = (index: number, field: keyof RSSFeed, value: string) => {
    const updated = [...feeds];
    updated[index][field] = value;
    setFeeds(updated);
    localStorage.setItem("rss-feeds", JSON.stringify(updated));
  };

  const deleteFeed = (index: number) => {
    const updated = feeds.filter((_, i) => i !== index);
    setFeeds(updated);
    localStorage.setItem("rss-feeds", JSON.stringify(updated));
    toast.success("Feed obrisan");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rss className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>RSS Feedovi</CardTitle>
              <CardDescription>Upravljajte RSS feedovima za vijesti i sadržaj</CardDescription>
            </div>
          </div>
          <Button onClick={addFeed} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj Feed
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feeds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Rss className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nema dodanih RSS feedova</p>
          </div>
        ) : (
          feeds.map((feed, index) => (
            <div key={index} className="flex gap-2 items-end p-4 rounded-lg border border-border bg-card/50">
              <div className="flex-1">
                <Label>Naziv</Label>
                <Input
                  value={feed.name}
                  onChange={(e) => updateFeed(index, "name", e.target.value)}
                  placeholder="Tech Blog"
                />
              </div>
              <div className="flex-1">
                <Label>URL Feeda</Label>
                <Input
                  value={feed.url}
                  onChange={(e) => updateFeed(index, "url", e.target.value)}
                  placeholder="https://example.com/feed.xml"
                />
              </div>
              <div className="flex-1">
                <Label>Kategorija</Label>
                <Input
                  value={feed.category}
                  onChange={(e) => updateFeed(index, "category", e.target.value)}
                  placeholder="tech, gaming, news..."
                />
              </div>
              <Button
                onClick={() => deleteFeed(index)}
                variant="destructive"
                size="icon"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRSSFeeds;
