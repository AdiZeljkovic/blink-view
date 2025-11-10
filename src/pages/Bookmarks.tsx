import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ExternalLink, Trash2, Edit } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

interface Bookmark {
  id?: string;
  name: string;
  url: string;
  created_at?: string;
}

const Bookmarks = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [formData, setFormData] = useState({ name: "", url: "" });

  useEffect(() => {
    if (supabase) {
      loadBookmarks();
    } else {
      setLoading(false);
    }
  }, [supabase]);

  const loadBookmarks = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati bookmarke",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (!formData.name || !formData.url) {
      toast({
        title: "Upozorenje",
        description: "Popunite sva polja",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingBookmark) {
        const { error } = await supabase
          .from("bookmarks")
          .update({ name: formData.name, url: formData.url })
          .eq("id", editingBookmark.id);

        if (error) throw error;

        toast({
          title: "Uspjeh",
          description: "Bookmark je ažuriran",
        });
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert([{ name: formData.name, url: formData.url }]);

        if (error) throw error;

        toast({
          title: "Uspjeh",
          description: "Bookmark je dodan",
        });
      }

      setFormData({ name: "", url: "" });
      setEditingBookmark(null);
      setDialogOpen(false);
      loadBookmarks();
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast({
        title: "Greška",
        description: "Nije moguće sačuvati bookmark",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Uspjeh",
        description: "Bookmark je obrisan",
      });
      loadBookmarks();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast({
        title: "Greška",
        description: "Nije moguće obrisati bookmark",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setFormData({ name: bookmark.name, url: bookmark.url });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingBookmark(null);
    setFormData({ name: "", url: "" });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Supabase nije konfigurisan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Da biste koristili bookmarke, potrebno je konfigurirati Supabase u admin panelu.
            </p>
            <Button onClick={() => window.location.href = '/admin'}>
              Idi na Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1000px]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Bookmarks</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj Bookmark
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBookmark ? "Uredi Bookmark" : "Dodaj Novi Bookmark"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Naziv</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="GitHub, YouTube..."
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingBookmark ? "Ažuriraj" : "Dodaj"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nemate sačuvanih bookmarksa. Kliknite na "Dodaj Bookmark" da dodate novi.
                </p>
              </CardContent>
            </Card>
          ) : (
            bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="group hover:border-primary/50 transition-all hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{bookmark.name}</h3>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        {bookmark.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(bookmark)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => bookmark.id && handleDelete(bookmark.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookmarks;
