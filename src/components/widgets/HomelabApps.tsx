import { Server, Database, Network, HardDrive, Cloud, Globe, Shield, Container } from "lucide-react";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

interface HomelabApp {
  name: string;
  url: string;
  icon: string;
}

const HomelabApps = () => {
  const [apps, setApps] = useState<HomelabApp[]>([
    { name: "Proxmox", icon: "Server", url: "#" },
    { name: "TrueNAS", icon: "Database", url: "#" },
    { name: "Pi-hole", icon: "Shield", url: "#" },
    { name: "Portainer", icon: "Container", url: "#" },
    { name: "Nextcloud", icon: "Cloud", url: "#" },
    { name: "pfSense", icon: "Network", url: "#" },
    { name: "Jellyfin", icon: "HardDrive", url: "#" },
    { name: "Nginx", icon: "Globe", url: "#" },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("homelab-apps");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setApps(parsed);
      }
    }
  }, []);

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Server;
    return Icon;
  };

  return (
    <div className="widget-card">
      <div className="flex items-center gap-2 mb-6">
        <Server className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-mono-heading">Homelab Aplikacije</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {apps.map((app, index) => {
          const Icon = getIcon(app.icon);
          return (
            <a
              key={app.name}
              href={app.url}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-all duration-300 group hover:scale-105 hover:border-primary/30 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-all duration-300" />
              <span className="text-xs font-medium text-foreground text-center group-hover:text-primary transition-colors duration-300">{app.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default HomelabApps;
