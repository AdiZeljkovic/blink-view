import { Server, Thermometer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ServerMonitoring = () => {
  // Mock data - replace with real server data later
  const serverStats = {
    cpu: 42,
    ram: 68,
    disk: 28,
    uptime: "12d 5h 23m",
    temp: 45
  };

  return (
    <div className="widget-card">
      <div className="flex items-center gap-2 mb-6">
        <Server className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-mono-heading">Server Monitoring</h2>
      </div>
      
      <div className="space-y-4">
        {/* CPU */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">CPU</span>
            <span className="text-sm font-mono text-muted-foreground">{serverStats.cpu}%</span>
          </div>
          <Progress value={serverStats.cpu} className="h-2" />
        </div>

        {/* RAM */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">RAM</span>
            <span className="text-sm font-mono text-muted-foreground">{serverStats.ram}%</span>
          </div>
          <Progress value={serverStats.ram} className="h-2" />
        </div>

        {/* Disk */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Disk</span>
            <span className="text-sm font-mono text-muted-foreground">{serverStats.disk}%</span>
          </div>
          <Progress value={serverStats.disk} className="h-2" />
        </div>

        {/* Uptime & Temperature */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Uptime</p>
            <p className="text-sm font-mono font-medium text-foreground">{serverStats.uptime}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Temp</p>
            </div>
            <p className="text-sm font-mono font-medium text-foreground">{serverStats.temp}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerMonitoring;
