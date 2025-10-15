import { useEffect, useState } from "react";
import { Gamepad2, Newspaper, Video, MessageSquare, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  thumbnail?: string;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  type: "news" | "youtube" | "reddit";
}

const Gaming = () => {
  const [gamingNews, setGamingNews] = useState<FeedItem[]>([]);
  const [redditPosts, setRedditPosts] = useState<FeedItem[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newsLimit, setNewsLimit] = useState(10);
  const [videosLimit, setVideosLimit] = useState(8);
  const [redditLimit, setRedditLimit] = useState(8);
  const [pageTitle, setPageTitle] = useState("Gaming Hub");

  useEffect(() => {
    // Load settings from localStorage
    const savedTitle = localStorage.getItem("gaming-widget-title");
    if (savedTitle) setPageTitle(savedTitle);
    
    fetchGamingFeeds();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchGamingFeeds(true);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchGamingFeeds = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(!silent);
    
    try {
      // Load feeds from localStorage or use defaults
      const savedFeeds = localStorage.getItem("gaming-rss-feeds");
      const feeds: RSSFeed[] = savedFeeds ? JSON.parse(savedFeeds) : [
        { id: "1", name: "IGN", url: "https://www.ign.com/feed.xml", type: "news" },
        { id: "2", name: "Polygon", url: "https://www.polygon.com/rss/index.xml", type: "news" },
        { id: "3", name: "r/gaming", url: "https://www.reddit.com/r/gaming.json", type: "reddit" },
      ];

      const newsFeeds = feeds.filter(f => f.type === "news");
      const redditFeeds = feeds.filter(f => f.type === "reddit");
      const youtubeFeeds = feeds.filter(f => f.type === "youtube");

      // Fetch news feeds
      const newsPromises = newsFeeds.map(feed =>
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
          .then(r => r.json())
          .then(data => ({ ...data, feedName: feed.name }))
          .catch(() => ({ items: [], feedName: feed.name }))
      );

      // Fetch Reddit posts
      const redditPromises = redditFeeds.map(feed => {
        const url = feed.url.includes('.json') ? feed.url : feed.url + '.json';
        return fetch(url + '?limit=10')
          .then(r => r.json())
          .then(data => ({ ...data, feedName: feed.name }))
          .catch(() => ({ data: { children: [] }, feedName: feed.name }));
      });

      // Fetch YouTube videos
      const youtubePromises = youtubeFeeds.map(feed =>
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
          .then(r => r.json())
          .then(data => ({ ...data, feedName: feed.name }))
          .catch(() => ({ items: [], feedName: feed.name }))
      );

      const [newsResults, redditResults, youtubeResults] = await Promise.all([
        Promise.all(newsPromises),
        Promise.all(redditPromises),
        Promise.all(youtubePromises)
      ]);

      // Process news
      const allNews: FeedItem[] = [];
      newsResults.forEach((result: any) => {
        if (result.items) {
          result.items.slice(0, 5).forEach((item: any) => {
            allNews.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              source: result.feedName,
              thumbnail: item.thumbnail || item.enclosure?.link
            });
          });
        }
      });
      setGamingNews(allNews);

      // Process Reddit posts
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

      // Process YouTube videos
      const allVideos: FeedItem[] = [];
      youtubeResults.forEach((result: any) => {
        if (result.items) {
          result.items.slice(0, 4).forEach((item: any) => {
            allVideos.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              source: result.feedName,
              thumbnail: item.thumbnail
            });
          });
        }
      });
      setYoutubeVideos(allVideos);

    } catch (error) {
      console.error('Error fetching gaming feeds:', error);
      toast.error("Greška pri učitavanju sadržaja");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchGamingFeeds();
    toast.success("Sadržaj osvježen");
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
          <Gamepad2 className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Učitavam gaming sadržaj...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gaming News - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {gamingNews.length > 0 && (
              <div className="widget-card">
                <div className="flex items-center gap-2 mb-6">
                  <Newspaper className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-mono-heading">Gaming Vijesti</h2>
                </div>
                
                <div className="space-y-4">
                  {gamingNews.slice(0, newsLimit).map((item, index) => (
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
                  {gamingNews.length > newsLimit && (
                    <Button 
                      onClick={() => setNewsLimit(newsLimit + 10)}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Učitaj Još
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* YouTube Videos */}
            {youtubeVideos.length > 0 && (
              <div className="widget-card">
                <div className="flex items-center gap-2 mb-6">
                  <Video className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-mono-heading">Najnoviji Gaming Videi</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {youtubeVideos.slice(0, videosLimit).map((video, index) => (
                    <a
                      key={index}
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group animate-scale-in"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <div className="space-y-2">
                        {video.thumbnail && (
                          <div className="relative overflow-hidden rounded-lg aspect-video bg-muted">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                          </div>
                        )}
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary">{video.source}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(video.pubDate)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                {youtubeVideos.length > videosLimit && (
                  <Button 
                    onClick={() => setVideosLimit(videosLimit + 8)}
                    variant="outline"
                    className="w-full gap-2 mt-4"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Učitaj Još Videa
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Reddit Feed - Right Column */}
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
                    <Button 
                      onClick={() => setRedditLimit(redditLimit + 8)}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Učitaj Još
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

export default Gaming;
