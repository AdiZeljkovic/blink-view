import { Bookmark, ExternalLink, Star } from "lucide-react";
import { useState, useEffect } from "react";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([
    { name: "GitHub", url: "https://github.com", color: "from-purple-500/20 to-purple-600/20", icon: "💻" },
    { name: "YouTube", url: "https://youtube.com", color: "from-red-500/20 to-red-600/20", icon: "📺" },
    { name: "Reddit", url: "https://reddit.com", color: "from-orange-500/20 to-orange-600/20", icon: "🔥" },
    { name: "Twitter", url: "https://twitter.com", color: "from-blue-500/20 to-blue-600/20", icon: "🐦" },
    { name: "Dev.to", url: "https://dev.to", color: "from-green-500/20 to-green-600/20", icon: "👨‍💻" },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("widget-bookmarks");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setBookmarks(parsed.map((b: any, i: number) => ({
          ...b,
          color: bookmarks[i % bookmarks.length].color,
          icon: bookmarks[i % bookmarks.length].icon
        })));
      }
    }
  }, []);

  return (
    <div className="widget-card">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-primary fill-primary" />
        <h2 className="text-xl font-mono-heading">Brzi Pristupi</h2>
      </div>
      
      <div className="space-y-3">
        {bookmarks.map((bookmark, index) => (
          <a
            key={bookmark.name}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group block p-4 rounded-lg bg-gradient-to-r ${bookmark.color} border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bookmark.icon}</span>
                <div>
                  <div className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {bookmark.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{bookmark.url.replace('https://', '')}</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300 opacity-0 group-hover:opacity-100" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
