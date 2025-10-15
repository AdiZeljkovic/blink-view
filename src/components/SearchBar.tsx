import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (query) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          name="search"
          placeholder="Pretraži Google, YouTube, Reddit..."
          className="w-full pl-12 pr-4 py-6 text-base border-border bg-card hover:border-primary/50 focus-visible:ring-primary transition-colors"
        />
      </div>
    </form>
  );
};

export default SearchBar;
