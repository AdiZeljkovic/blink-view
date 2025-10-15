import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus, Edit } from "lucide-react";

const AdminBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("user-bookmarks");
    const savedCategories = localStorage.getItem("bookmark-categories");
    
    if (saved) setBookmarks(JSON.parse(saved));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  const addBookmark = () => {
    const newBookmark = {
      id: Date.now().toString(),
      title: "",
      url: "",
      category: "",
      tags: [],
      isFavorite: false,
      readLater: false,
      createdAt: new Date().toISOString()
    };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem("user-bookmarks", JSON.stringify(updated));
  };

  const updateBookmark = (id: string, field: string, value: any) => {
    const updated = bookmarks.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    );
    setBookmarks(updated);
    localStorage.setItem("user-bookmarks", JSON.stringify(updated));
  };

  const deleteBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem("user-bookmarks", JSON.stringify(updated));
    toast.success("Bookmark obrisan");
  };

  const addCategory = () => {
    const newCategory = prompt("Unesite naziv nove kategorije:");
    if (newCategory && !categories.includes(newCategory)) {
      const updated = [...categories, newCategory];
      setCategories(updated);
      localStorage.setItem("bookmark-categories", JSON.stringify(updated));
      toast.success("Kategorija dodana");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upravljanje Kategorijama</CardTitle>
              <CardDescription>Dodajte ili uređujte kategorije bookmarks</CardDescription>
            </div>
            <Button onClick={addCategory} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Kategorija
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, index) => (
              <div key={index} className="px-3 py-1 bg-secondary rounded-md text-sm">
                {cat}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Svi Bookmarks</CardTitle>
              <CardDescription>Dodajte, uredite ili obrišite bookmarks</CardDescription>
            </div>
            <Button onClick={addBookmark} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novi Bookmark
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Naslov</Label>
                  <Input
                    value={bookmark.title}
                    onChange={(e) => updateBookmark(bookmark.id, "title", e.target.value)}
                    placeholder="Naslov bookmarks"
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={bookmark.url}
                    onChange={(e) => updateBookmark(bookmark.id, "url", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label>Kategorija</Label>
                  <Input
                    value={bookmark.category}
                    onChange={(e) => updateBookmark(bookmark.id, "category", e.target.value)}
                    placeholder="Kategorija"
                  />
                </div>
                <div>
                  <Label>Tagovi (odvojeni zarezom)</Label>
                  <Input
                    value={bookmark.tags.join(", ")}
                    onChange={(e) => updateBookmark(bookmark.id, "tags", e.target.value.split(",").map(t => t.trim()))}
                    placeholder="tag1, tag2"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={bookmark.isFavorite}
                      onChange={(e) => updateBookmark(bookmark.id, "isFavorite", e.target.checked)}
                      className="rounded"
                    />
                    Favorit
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={bookmark.readLater}
                      onChange={(e) => updateBookmark(bookmark.id, "readLater", e.target.checked)}
                      className="rounded"
                    />
                    Čitaj Kasnije
                  </label>
                </div>
                <Button
                  onClick={() => deleteBookmark(bookmark.id)}
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

export default AdminBookmarks;
