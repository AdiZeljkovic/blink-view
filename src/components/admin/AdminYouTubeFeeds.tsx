import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus, Youtube } from "lucide-react";

interface YouTubeFeed {
  channelId: string;
  channelName: string;
}

const AdminYouTubeFeeds = () => {
  const [feeds, setFeeds] = useState<YouTubeFeed[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("youtube-feeds");
    if (saved) {
      setFeeds(JSON.parse(saved));
    }
  }, []);

  const addFeed = () => {
    const newFeed: YouTubeFeed = { channelId: "", channelName: "" };
    const updated = [...feeds, newFeed];
    setFeeds(updated);
    localStorage.setItem("youtube-feeds", JSON.stringify(updated));
    toast.success("YouTube feed dodat");
  };

  const updateFeed = (index: number, field: keyof YouTubeFeed, value: string) => {
    const updated = [...feeds];
    updated[index][field] = value;
    setFeeds(updated);
    localStorage.setItem("youtube-feeds", JSON.stringify(updated));
  };

  const deleteFeed = (index: number) => {
    const updated = feeds.filter((_, i) => i !== index);
    setFeeds(updated);
    localStorage.setItem("youtube-feeds", JSON.stringify(updated));
    toast.success("YouTube feed obrisan");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Youtube className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>YouTube Feedovi</CardTitle>
              <CardDescription>Upravljajte YouTube kanalima</CardDescription>
            </div>
          </div>
          <Button onClick={addFeed} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj Kanal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feeds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nema dodanih YouTube kanala</p>
          </div>
        ) : (
          feeds.map((feed, index) => (
            <div key={index} className="flex gap-2 items-end p-4 rounded-lg border border-border bg-card/50">
              <div className="flex-1">
                <Label>ID Kanala ili Handle</Label>
                <Input
                  value={feed.channelId}
                  onChange={(e) => updateFeed(index, "channelId", e.target.value)}
                  placeholder="@username ili UC..."
                />
              </div>
              <div className="flex-1">
                <Label>Naziv Kanala</Label>
                <Input
                  value={feed.channelName}
                  onChange={(e) => updateFeed(index, "channelName", e.target.value)}
                  placeholder="Tech Channel"
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

export default AdminYouTubeFeeds;
