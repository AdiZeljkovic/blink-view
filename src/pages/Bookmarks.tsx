import { useState, useEffect } from "react";
import { Bookmark, Plus, Search, Trash2, ExternalLink, Star, Clock, Folder, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  isReadLater: boolean;
  createdAt: string;
  favicon?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: "tech", name: "Tech", color: "hsl(221, 100%, 50%)" },
  { id: "design", name: "Design", color: "hsl(280, 100%, 50%)" },
  { id: "news", name: "Vijesti", color: "hsl(0, 84%, 60%)" },
  { id: "dev", name: "Development", color: "hsl(142, 76%, 36%)" },
  { id: "gaming", name: "Gaming", color: "hsl(45, 100%, 50%)" },
  { id: "other", name: "Ostalo", color: "hsl(0, 0%, 60%)" },
];

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "favorites" | "readLater">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    url: "",
    description: "",
    category: "other",
    tags: "",
    isFavorite: false,
    isReadLater: false,
  });

  // Load data from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarks-data");
    const savedCategories = localStorage.getItem("bookmarks-categories");
    
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save bookmarks
  const saveBookmarks = (updatedBookmarks: BookmarkItem[]) => {
    setBookmarks(updatedBookmarks);
    localStorage.setItem("bookmarks-data", JSON.stringify(updatedBookmarks));
  };

  // Extract favicon from URL
  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return undefined;
    }
  };

  const addBookmark = () => {
    if (!newBookmark.url.trim()) {
      toast.error("Unesite URL");
      return;
    }

    // Validate URL
    try {
      new URL(newBookmark.url);
    } catch {
      toast.error("Nevažeći URL format");
      return;
    }

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      title: newBookmark.title || new URL(newBookmark.url).hostname,
      url: newBookmark.url,
      description: newBookmark.description,
      category: newBookmark.category,
      tags: newBookmark.tags.split(",").map(t => t.trim()).filter(t => t),
      isFavorite: newBookmark.isFavorite,
      isReadLater: newBookmark.isReadLater,
      createdAt: new Date().toISOString(),
      favicon: getFavicon(newBookmark.url),
    };

    saveBookmarks([bookmark, ...bookmarks]);
    setNewBookmark({
      title: "",
      url: "",
      description: "",
      category: "other",
      tags: "",
      isFavorite: false,
      isReadLater: false,
    });
    setIsDialogOpen(false);
    toast.success("Bookmark dodan");
  };

  const deleteBookmark = (id: string) => {
    saveBookmarks(bookmarks.filter((b) => b.id !== id));
    toast.success("Bookmark obrisan");
  };

  const toggleFavorite = (id: string) => {
    saveBookmarks(
      bookmarks.map((b) => (b.id === id ? { ...b, isFavorite: !b.isFavorite } : b))
    );
  };

  const toggleReadLater = (id: string) => {
    saveBookmarks(
      bookmarks.map((b) => (b.id === id ? { ...b, isReadLater: !b.isReadLater } : b))
    );
  };

  const addCategory = () => {
    const name = prompt("Unesite naziv kategorije:");
    if (!name?.trim()) return;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem("bookmarks-categories", JSON.stringify(updatedCategories));
    toast.success("Kategorija dodana");
  };

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === "all" || bookmark.category === filterCategory;

    const matchesType =
      filterType === "all" ||
      (filterType === "favorites" && bookmark.isFavorite) ||
      (filterType === "readLater" && bookmark.isReadLater);

    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "hsl(0, 0%, 60%)";
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Ostalo";
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Bookmarks</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={addCategory} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Kategorija
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novi Bookmark
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novi Bookmark</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={newBookmark.url}
                      onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Naziv (opcionalno)</Label>
                    <Input
                      id="title"
                      placeholder="Korisni resursi..."
                      value={newBookmark.title}
                      onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Opis (opcionalno)</Label>
                    <Textarea
                      id="description"
                      placeholder="Zašto je ova stranica korisna..."
                      value={newBookmark.description}
                      onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategorija</Label>
                    <Select
                      value={newBookmark.category}
                      onValueChange={(value) => setNewBookmark({ ...newBookmark, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tagovi (odvojeni zarezom)</Label>
                    <Input
                      id="tags"
                      placeholder="react, tutorial, javascript"
                      value={newBookmark.tags}
                      onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBookmark.isFavorite}
                        onChange={(e) =>
                          setNewBookmark({ ...newBookmark, isFavorite: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <Star className="w-4 h-4" />
                      <span className="text-sm">Favorit</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBookmark.isReadLater}
                        onChange={(e) =>
                          setNewBookmark({ ...newBookmark, isReadLater: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Read Later</span>
                    </label>
                  </div>

                  <Button onClick={addBookmark} className="w-full">
                    Sačuvaj Bookmark
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="widget-card">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="widget-card">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  <SelectValue placeholder="Sve kategorije" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="widget-card">
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Svi bookmarks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi bookmarks</SelectItem>
                <SelectItem value="favorites">Favoriti</SelectItem>
                <SelectItem value="readLater">Read Later</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="widget-card">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{bookmarks.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Ukupno</p>
            </div>
          </div>
          <div className="widget-card">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {bookmarks.filter((b) => b.isFavorite).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Favoriti</p>
            </div>
          </div>
          <div className="widget-card">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {bookmarks.filter((b) => b.isReadLater).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Read Later</p>
            </div>
          </div>
          <div className="widget-card">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Kategorije</p>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark, index) => (
            <div
              key={bookmark.id}
              className="widget-card group animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {bookmark.favicon && (
                      <img src={bookmark.favicon} alt="" className="w-4 h-4 flex-shrink-0" />
                    )}
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {bookmark.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleFavorite(bookmark.id)}
                    >
                      <Star
                        className={cn(
                          "w-3 h-3 transition-all",
                          bookmark.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleReadLater(bookmark.id)}
                    >
                      <Clock
                        className={cn(
                          "w-3 h-3 transition-all",
                          bookmark.isReadLater ? "fill-primary text-primary" : "text-muted-foreground"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteBookmark(bookmark.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* URL */}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate">{bookmark.url}</span>
                </a>

                {/* Description */}
                {bookmark.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {bookmark.description}
                  </p>
                )}

                {/* Tags & Category */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="px-2 py-1 rounded-md text-xs font-medium text-white"
                    style={{ backgroundColor: getCategoryColor(bookmark.category) }}
                  >
                    {getCategoryName(bookmark.category)}
                  </div>
                  {bookmark.tags.map((tag, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                    >
                      <TagIcon className="w-3 h-3" />
                      {tag}
                    </div>
                  ))}
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground">
                  {new Date(bookmark.createdAt).toLocaleDateString("sr-RS")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || filterCategory !== "all" || filterType !== "all"
                ? "Nema bookmarks koji odgovaraju filteru"
                : "Nema sačuvanih bookmarks"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
