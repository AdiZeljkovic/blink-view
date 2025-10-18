import { useEffect, useState } from "react";
import { Cpu, Newspaper, Video, MessageSquare, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

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

const Tech = () => {
  const [techNews, setTechNews] = useState<FeedItem[]>([]);
  const [redditPosts, setRedditPosts] = useState<FeedItem[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newsLimit, setNewsLimit] = useState(5);
  const [videosLimit, setVideosLimit] = useState(5);
  const [redditLimit, setRedditLimit] = useState(5);
  const [pageTitle, setPageTitle] = useState("Tech Hub");

  useEffect(() => {
    const savedTitle = localStorage.getItem("tech-widget-title");
    if (savedTitle) setPageTitle(savedTitle);
    
    fetchTechFeeds();
    const interval = setInterval(() => fetchTechFeeds(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTechFeeds = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(!silent);
    
    try {
      const savedFeeds = await storage.getJSON<RSSFeed[]>("tech-rss-feeds");
      const feeds: RSSFeed[] = savedFeeds || [
        { id: "1", name: "TechCrunch", url: "https://techcrunch.com/feed/", type: "news" },
        { id: "2", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", type: "news" },
        { id: "3", name: "r/technology", url: "https://www.reddit.com/r/technology.json", type: "reddit" },
      ];

      const newsFeeds = feeds.filter(f => f.type === "news");
      const redditFeeds = feeds.filter(f => f.type === "reddit");
      const youtubeFeeds = feeds.filter(f => f.type === "youtube");

      const newsPromises = newsFeeds.map(feed =>
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
          .then(r => r.json())
          .then(data => ({ ...data, feedName: feed.name }))
          .catch(() => ({ items: [], feedName: feed.name }))
      );

      const redditPromises = redditFeeds.map(feed => {
        const url = feed.url.includes('.json') ? feed.url : feed.url + '.json';
        return fetch(url + '?limit=10')
          .then(r => r.json())
          .then(data => ({ ...data, feedName: feed.name }))
          .catch(() => ({ data: { children: [] }, feedName: feed.name }));
      });

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
      setTechNews(allNews);

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
      console.error('Error fetching tech feeds:', error);
      toast.error("Greška pri učitavanju sadržaja");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchTechFeeds();
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
          <Cpu className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Učitavam tech sadržaj...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-primary" />
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
            {techNews.length > 0 && (
              <div className="widget-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-mono-heading">Tech Vijesti</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Prikazano {Math.min(newsLimit, techNews.length)} od {techNews.length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {techNews.slice(0, newsLimit).map((item, index) => (
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
                  {techNews.length > newsLimit && (
                    <Button onClick={() => setNewsLimit(newsLimit + 10)} variant="outline" className="w-full gap-2 mt-4">
                      <ChevronDown className="w-4 h-4" />
                      Učitaj Još Vijesti ({techNews.length - newsLimit} preostalo)
                    </Button>
                  )}
                </div>
              </div>
            )}

            {youtubeVideos.length > 0 && (
              <div className="widget-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-mono-heading">Najnoviji Tech Videi</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Prikazano {Math.min(videosLimit, youtubeVideos.length)} od {youtubeVideos.length}
                  </span>
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
                  <Button onClick={() => setVideosLimit(videosLimit + 10)} variant="outline" className="w-full gap-2 mt-4">
                    <ChevronDown className="w-4 h-4" />
                    Učitaj Još Videa ({youtubeVideos.length - videosLimit} preostalo)
                  </Button>
                )}
              </div>
            )}
          </div>

          {redditPosts.length > 0 && (
            <div className="lg:col-span-1">
              <div className="widget-card sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-mono-heading">Reddit</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.min(redditLimit, redditPosts.length)}/{redditPosts.length}
                  </span>
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
                    <Button onClick={() => setRedditLimit(redditLimit + 10)} variant="outline" className="w-full gap-2 mt-4">
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

export default Tech;
