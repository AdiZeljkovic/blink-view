import { useEffect, useState } from "react";
import { Globe, Newspaper, MessageSquare, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  thumbnail?: string;
  description?: string;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  type: "world" | "regional" | "reddit";
}

const Vijesti = () => {
  const [worldNews, setWorldNews] = useState<FeedItem[]>([]);
  const [regionalNews, setRegionalNews] = useState<FeedItem[]>([]);
  const [redditPosts, setRedditPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [worldLimit, setWorldLimit] = useState(5);
  const [regionalLimit, setRegionalLimit] = useState(5);
  const [redditLimit, setRedditLimit] = useState(5);
  const [pageTitle, setPageTitle] = useState("Vijesti");

  useEffect(() => {
    const loadSettings = async () => {
      const savedTitle = localStorage.getItem("vijesti-widget-title");
      if (savedTitle) setPageTitle(savedTitle);
      
      await fetchNewsFeeds();
    };
    
    loadSettings();
    const interval = setInterval(() => fetchNewsFeeds(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNewsFeeds = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(!silent);
    
    try {
      const savedFeeds = localStorage.getItem("vijesti-rss-feeds");
      const feeds: RSSFeed[] = savedFeeds ? JSON.parse(savedFeeds) : [
        { id: "1", name: "BBC News", url: "http://feeds.bbci.co.uk/news/world/rss.xml", type: "world" },
        { id: "2", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", type: "world" },
        { id: "3", name: "Klix.ba", url: "https://www.klix.ba/rss", type: "regional" },
        { id: "4", name: "Blic.rs", url: "https://www.blic.rs/rss", type: "regional" },
        { id: "5", name: "r/worldnews", url: "https://www.reddit.com/r/worldnews.json", type: "reddit" },
      ];

      const worldFeeds = feeds.filter(f => f.type === "world");
      const regionalFeeds = feeds.filter(f => f.type === "regional");
      const redditFeeds = feeds.filter(f => f.type === "reddit");

      // Helper function to fetch RSS with multiple fallback methods
      const fetchRSSFeed = async (feed: RSSFeed) => {
        // Try rss2json first
        try {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            return { ...data, feedName: feed.name };
          }
        } catch (error) {
          console.log(`[RSS] rss2json failed for ${feed.name}, trying alternatives...`);
        }

        // Try alternative RSS parser
        try {
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
          const data = await response.json();
          if (data.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 10).map(item => ({
              title: item.querySelector("title")?.textContent || "",
              link: item.querySelector("link")?.textContent || "",
              pubDate: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
              description: item.querySelector("description")?.textContent || "",
            }));
            if (items.length > 0) {
              return { items, feedName: feed.name };
            }
          }
        } catch (error) {
          console.log(`[RSS] Alternative parser failed for ${feed.name}`);
        }

        // Return empty if all methods fail
        return { items: [], feedName: feed.name };
      };

      const worldPromises = worldFeeds.map(feed => fetchRSSFeed(feed));
      const regionalPromises = regionalFeeds.map(feed => fetchRSSFeed(feed));

      const redditPromises = redditFeeds.map(feed => {
        const url = feed.url.includes('.json') ? feed.url : feed.url + '.json';
        return fetch(url + '?limit=10')
          .then(r => r.json())
          .then(data => ({ ...data, feedName: feed.name }))
          .catch(() => ({ data: { children: [] }, feedName: feed.name }));
      });

      const [worldResults, regionalResults, redditResults] = await Promise.all([
        Promise.all(worldPromises),
        Promise.all(regionalPromises),
        Promise.all(redditPromises)
      ]);

      const allWorldNews: FeedItem[] = [];
      worldResults.forEach((result: any) => {
        if (result.items) {
          result.items.slice(0, 5).forEach((item: any) => {
            allWorldNews.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              source: result.feedName,
              thumbnail: item.thumbnail || item.enclosure?.link,
              description: item.description
            });
          });
        }
      });
      setWorldNews(allWorldNews);

      const allRegionalNews: FeedItem[] = [];
      regionalResults.forEach((result: any) => {
        if (result.items) {
          result.items.slice(0, 5).forEach((item: any) => {
            allRegionalNews.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              source: result.feedName,
              thumbnail: item.thumbnail || item.enclosure?.link,
              description: item.description
            });
          });
        }
      });
      setRegionalNews(allRegionalNews);

      const allReddit: FeedItem[] = [];
      redditResults.forEach((result: any) => {
        if (result?.data?.children) {
          result.data.children
            .filter((child: any) => !child.data.stickied)
            .slice(0, 8)
            .forEach((child: any) => {
              allReddit.push({
                title: child.data.title,
                link: `https://reddit.com${child.data.permalink}`,
                pubDate: new Date(child.data.created_utc * 1000).toISOString(),
                source: result.feedName,
                thumbnail: child.data.thumbnail !== 'self' && child.data.thumbnail !== 'default' ? child.data.thumbnail : undefined
              });
            });
        }
      });
      setRedditPosts(allReddit);

    } catch (error) {
      console.error('Error fetching news feeds:', error);
      toast.error("Greška pri učitavanju vijesti");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchNewsFeeds();
    toast.success("Vijesti osvježene");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Prije < 1h';
    if (diffHours < 24) return `Prije ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Prije ${diffDays}d`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Učitavam vijesti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">{pageTitle}</h1>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Osvježi
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {worldNews.length > 0 && (
              <div className="widget-card">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-mono-heading">Svijet</h2>
                </div>
                
                <div className="space-y-4">
                  {worldNews.slice(0, worldLimit).map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group animate-slide-up hover:translate-x-1 transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex gap-4">
                        {item.thumbnail && (
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0 group-hover:shadow-lg transition-all duration-300"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-semibold text-primary">{item.source}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(item.pubDate)}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                  {worldNews.length > worldLimit && (
                    <Button onClick={() => setWorldLimit(worldLimit + 10)} variant="outline" className="w-full gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Učitaj Još ({worldNews.length - worldLimit} preostalo)
                    </Button>
                  )}
                </div>
              </div>
            )}

            {regionalNews.length > 0 && (
              <div className="widget-card">
                <div className="flex items-center gap-2 mb-6">
                  <Newspaper className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-mono-heading">Regija</h2>
                </div>
                
                <div className="space-y-4">
                  {regionalNews.slice(0, regionalLimit).map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group animate-slide-up hover:translate-x-1 transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex gap-4">
                        {item.thumbnail && (
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0 group-hover:shadow-lg transition-all duration-300"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-semibold text-primary">{item.source}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(item.pubDate)}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                  {regionalNews.length > regionalLimit && (
                    <Button onClick={() => setRegionalLimit(regionalLimit + 10)} variant="outline" className="w-full gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Učitaj Još ({regionalNews.length - regionalLimit} preostalo)
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {redditPosts.length > 0 && (
            <div className="lg:col-span-1">
              <div className="widget-card sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-mono-heading">Reddit</h2>
                </div>
                
                <div className="space-y-4">
                  {redditPosts.slice(0, redditLimit).map((post, index) => (
                    <a
                      key={index}
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group animate-slide-up hover:translate-x-1 transition-all duration-300"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary">{post.source}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(post.pubDate)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                  {redditPosts.length > redditLimit && (
                    <Button onClick={() => setRedditLimit(redditLimit + 10)} variant="outline" className="w-full gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Učitaj Još (+{redditPosts.length - redditLimit})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vijesti;
