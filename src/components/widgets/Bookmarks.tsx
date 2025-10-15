import { Bookmark } from "lucide-react";

const Bookmarks = () => {
  const bookmarks = [
    { name: "GitHub", url: "https://github.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "Reddit", url: "https://reddit.com" },
    { name: "Twitter", url: "https://twitter.com" },
    { name: "Dev.to", url: "https://dev.to" },
  ];

  return (
    <div className="widget-card">
      <div className="flex items-center gap-2 mb-6">
        <Bookmark className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-mono-heading">Bookmark List</h2>
      </div>
      
      <div className="space-y-3">
        {bookmarks.map((bookmark, index) => (
          <a
            key={bookmark.name}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {bookmark.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
