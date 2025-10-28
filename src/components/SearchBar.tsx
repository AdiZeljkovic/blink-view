import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type SearchEngine = "google" | "duckduckgo" | "bing";

const SearchBar = () => {
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>("google");

  const searchEngines = {
    google: { url: "https://www.google.com/search?q=", label: "Google", icon: "🔍" },
    duckduckgo: { url: "https://duckduckgo.com/?q=", label: "DuckDuckGo", icon: "🦆" },
    bing: { url: "https://www.bing.com/search?q=", label: "Bing", icon: "🔷" },
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (query) {
      window.open(`${searchEngines[selectedEngine].url}${encodeURIComponent(query)}`, "_blank");
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Engine Tabs */}
      <div className="flex justify-center gap-2">
        {(Object.keys(searchEngines) as SearchEngine[]).map((engine) => (
          <button
            key={engine}
            type="button"
            onClick={() => setSelectedEngine(engine)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              selectedEngine === engine
                ? "bg-primary text-primary-foreground shadow-glow-md"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span className="mr-2">{searchEngines[engine].icon}</span>
            {searchEngines[engine].label}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="w-full group">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-all duration-300 group-focus-within:text-primary" />
          <Input
            type="text"
            name="search"
            placeholder={`Pretraži pomoću ${searchEngines[selectedEngine].label}...`}
            className="w-full pl-12 pr-4 py-6 text-base border-border bg-card hover:border-primary/40 focus-visible:ring-primary focus-visible:border-primary focus-visible:shadow-lg focus-visible:shadow-glow-md transition-all duration-300"
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
