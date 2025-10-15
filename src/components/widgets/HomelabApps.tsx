import { Server, Database, Network, HardDrive, Cloud, Globe, Shield, Container } from "lucide-react";

const HomelabApps = () => {
  const apps = [
    { name: "Proxmox", icon: Server, url: "#", color: "text-primary" },
    { name: "TrueNAS", icon: Database, url: "#", color: "text-primary" },
    { name: "Pi-hole", icon: Shield, url: "#", color: "text-primary" },
    { name: "Portainer", icon: Container, url: "#", color: "text-primary" },
    { name: "Nextcloud", icon: Cloud, url: "#", color: "text-primary" },
    { name: "pfSense", icon: Network, url: "#", color: "text-primary" },
    { name: "Jellyfin", icon: HardDrive, url: "#", color: "text-primary" },
    { name: "Nginx", icon: Globe, url: "#", color: "text-primary" },
  ];

  return (
    <div className="widget-card">
      <div className="flex items-center gap-2 mb-6">
        <Server className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-mono-heading">Ikonice Aplikacija sa Servera</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {apps.map((app, index) => {
          const Icon = app.icon;
          return (
            <a
              key={app.name}
              href={app.url}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-all duration-300 group hover:scale-105 hover:border-primary/30 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className={`w-8 h-8 ${app.color} group-hover:scale-110 transition-all duration-300`} />
              <span className="text-xs font-medium text-foreground text-center group-hover:text-primary transition-colors duration-300">{app.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default HomelabApps;
