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
        <h2 className="text-xl font-mono-heading">Homelab Apps</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <a
              key={app.name}
              href={app.url}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors group"
            >
              <Icon className={`w-8 h-8 ${app.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-medium text-foreground text-center">{app.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default HomelabApps;
