import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface RedditFeed {
  subreddit: string;
  displayName: string;
}

const AdminRedditFeeds = () => {
  const [feeds, setFeeds] = useState<RedditFeed[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("reddit-feeds");
    if (saved) {
      setFeeds(JSON.parse(saved));
    }
  }, []);

  const addFeed = () => {
    const newFeed: RedditFeed = { subreddit: "", displayName: "" };
    const updated = [...feeds, newFeed];
    setFeeds(updated);
    localStorage.setItem("reddit-feeds", JSON.stringify(updated));
    toast.success("Reddit feed dodat");
  };

  const updateFeed = (index: number, field: keyof RedditFeed, value: string) => {
    const updated = [...feeds];
    updated[index][field] = value;
    setFeeds(updated);
    localStorage.setItem("reddit-feeds", JSON.stringify(updated));
  };

  const deleteFeed = (index: number) => {
    const updated = feeds.filter((_, i) => i !== index);
    setFeeds(updated);
    localStorage.setItem("reddit-feeds", JSON.stringify(updated));
    toast.success("Reddit feed obrisan");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-primary font-bold flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </div>
            <div>
              <CardTitle>Reddit Feedovi</CardTitle>
              <CardDescription>Upravljajte subreddit feedovima</CardDescription>
            </div>
          </div>
          <Button onClick={addFeed} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj Subreddit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feeds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nema dodanih Reddit feedova</p>
          </div>
        ) : (
          feeds.map((feed, index) => (
            <div key={index} className="flex gap-2 items-end p-4 rounded-lg border border-border bg-card/50">
              <div className="flex-1">
                <Label>Subreddit (bez r/)</Label>
                <Input
                  value={feed.subreddit}
                  onChange={(e) => updateFeed(index, "subreddit", e.target.value)}
                  placeholder="programming"
                />
              </div>
              <div className="flex-1">
                <Label>Naziv za prikaz</Label>
                <Input
                  value={feed.displayName}
                  onChange={(e) => updateFeed(index, "displayName", e.target.value)}
                  placeholder="Programming"
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

export default AdminRedditFeeds;
