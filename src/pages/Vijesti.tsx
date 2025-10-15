import { useEffect, useState } from "react";
import { Globe, Newspaper, MessageSquare } from "lucide-react";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  thumbnail?: string;
  description?: string;
}

const Vijesti = () => {
  const [worldNews, setWorldNews] = useState<FeedItem[]>([]);
  const [regionalNews, setRegionalNews] = useState<FeedItem[]>([]);
  const [redditPosts, setRedditPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsFeeds();
  }, []);

  const fetchNewsFeeds = async () => {
    try {
      // Fetch world news from multiple sources via RSS2JSON
      const worldNewsPromises = [
        fetch('https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml').then(r => r.json()),
        fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.com/xml/rss/all.xml').then(r => r.json()),
      ];

      // Fetch regional/Balkan news
      const regionalNewsPromises = [
        fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.klix.ba/rss').then(r => r.json()),
        fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.blic.rs/rss').then(r => r.json()),
      ];

      // Fetch Reddit world news posts
      const redditPromise = fetch('https://www.reddit.com/r/worldnews.json?limit=10')
        .then(r => r.json());

      const [worldResults, regionalResults, redditData] = await Promise.all([
        Promise.all(worldNewsPromises),
        Promise.all(regionalNewsPromises),
        redditPromise
      ]);

      // Process world news
      const allWorldNews: FeedItem[] = [];
      worldResults.forEach((result, index) => {
        if (result.items) {
          const source = index === 0 ? 'BBC News' : 'Al Jazeera';
          result.items.slice(0, 5).forEach((item: any) => {
            allWorldNews.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              source: source,
              thumbnail: item.thumbnail || item.enclosure?.link,
              description: item.description
            });
          });
        }
      });
      setWorldNews(allWorldNews.slice(0, 10));

      // Process regional news
      const allRegionalNews: FeedItem[] = [];
      regionalResults.forEach((result, index) => {
        if (result.items) {
          const source = index === 0 ? 'Klix.ba' : 'Blic.rs';
          result.items.slice(0, 5).forEach((item: any) => {
            allRegionalNews.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              source: source,
              thumbnail: item.thumbnail || item.enclosure?.link,
              description: item.description
            });
          });
        }
      });
      setRegionalNews(allRegionalNews.slice(0, 10));

      // Process Reddit posts
      if (redditData?.data?.children) {
        const posts: FeedItem[] = redditData.data.children
          .filter((child: any) => !child.data.stickied)
          .slice(0, 8)
          .map((child: any) => ({
            title: child.data.title,
            link: `https://reddit.com${child.data.permalink}`,
            pubDate: new Date(child.data.created_utc * 1000).toISOString(),
            source: `r/${child.data.subreddit}`,
            thumbnail: child.data.thumbnail !== 'self' && child.data.thumbnail !== 'default' ? child.data.thumbnail : undefined
          }));
        setRedditPosts(posts);
      }

    } catch (error) {
      console.error('Error fetching news feeds:', error);
    } finally {
      setLoading(false);
    }
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Globe className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Vijesti</h1>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* World News - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="widget-card">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-mono-heading">Svijet</h2>
              </div>
              
              <div className="space-y-4">
                {worldNews.map((item, index) => (
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
              </div>
            </div>

            {/* Regional News */}
            <div className="widget-card">
              <div className="flex items-center gap-2 mb-6">
                <Newspaper className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-mono-heading">Regija</h2>
              </div>
              
              <div className="space-y-4">
                {regionalNews.map((item, index) => (
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
              </div>
            </div>
          </div>

          {/* Reddit Feed - Right Column */}
          <div className="lg:col-span-1">
            <div className="widget-card sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-mono-heading">r/worldnews</h2>
              </div>
              
              <div className="space-y-4">
                {redditPosts.map((post, index) => (
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
                      <span className="text-xs text-muted-foreground">{formatDate(post.pubDate)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Vijesti;
