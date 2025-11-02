import { Server } from "lucide-react";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

interface HomelabApp {
  name: string;
  url: string;
  icon: string;
  healthCheck?: string;
}

interface AppStatus {
  [key: string]: "online" | "offline" | "unknown";
}

const HomelabApps = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  
  const defaultApps: HomelabApp[] = [
    { name: "Proxmox", icon: "Server", url: "#", healthCheck: "" },
    { name: "TrueNAS", icon: "Database", url: "#", healthCheck: "" },
    { name: "Pi-hole", icon: "Shield", url: "#", healthCheck: "" },
    { name: "Portainer", icon: "Container", url: "#", healthCheck: "" },
    { name: "Nextcloud", icon: "Cloud", url: "#", healthCheck: "" },
    { name: "pfSense", icon: "Network", url: "#", healthCheck: "" },
    { name: "Jellyfin", icon: "HardDrive", url: "#", healthCheck: "" },
    { name: "Nginx", icon: "Globe", url: "#", healthCheck: "" },
  ];

  const [apps, setApps] = useState<HomelabApp[]>(defaultApps);
  const [statuses, setStatuses] = useState<AppStatus>({});

  useEffect(() => {
    if (supabase) {
      loadApps();
    }
  }, [supabase]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, [apps]);

  const loadApps = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("homelab_apps")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setApps(data.map((app: any) => ({
          name: app.name,
          url: app.url,
          icon: app.icon,
          healthCheck: app.health_check || ""
        })));
      }
    } catch (error) {
      console.error("Error loading homelab apps:", error);
    }
  };

  const checkHealth = async () => {
    const newStatuses: AppStatus = {};
    
    for (const app of apps) {
      if (!app.healthCheck || app.healthCheck === "#") {
        newStatuses[app.name] = "unknown";
        continue;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(app.healthCheck, {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        newStatuses[app.name] = "online";
      } catch (error) {
        newStatuses[app.name] = "offline";
      }
    }

    setStatuses(newStatuses);
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Server;
    return Icon;
  };

  const getStatusDot = (appName: string) => {
    const status = statuses[appName] || "unknown";
    const colors = {
      online: "bg-green-500",
      offline: "bg-red-500",
      unknown: "bg-gray-400",
    };
    return (
      <span
        className={`absolute top-2 right-2 h-2 w-2 rounded-full ${colors[status]}`}
        title={status.charAt(0).toUpperCase() + status.slice(1)}
      />
    );
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
              className="relative flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-all duration-300 group hover:scale-105 hover:border-primary/30 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {getStatusDot(app.name)}
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
