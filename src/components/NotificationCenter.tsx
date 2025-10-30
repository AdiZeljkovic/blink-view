import { useState, useEffect } from "react";
import { Bell, X, Calendar, Briefcase, Trophy, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { storage } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  type: "reminder" | "task" | "invoice" | "achievement";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: any;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Check for new notifications every minute
    const interval = setInterval(checkForNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const saved = await storage.getJSON<Notification[]>("notifications") || [];
      setNotifications(saved);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const checkForNotifications = async () => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const newNotifications: Notification[] = [];

    try {
      // Check calendar events (15 min before)
      const calendarEvents = await storage.getJSON<any[]>("calendar-events") || [];
      calendarEvents
        .filter(e => e.date === today)
        .forEach(e => {
          const eventTime = new Date(`${e.date}T${e.time || "00:00"}`);
          const timeDiff = eventTime.getTime() - now.getTime();
          if (timeDiff > 0 && timeDiff < 15 * 60 * 1000) {
            newNotifications.push({
              id: `cal-${e.id}-${Date.now()}`,
              type: "reminder",
              title: "Podsjetnik",
              message: `Sastanak '${e.title}' počinje za 15 min.`,
              timestamp: new Date().toISOString(),
              read: false,
              icon: Calendar,
            });
          }
        });

      // Check overdue CRM tasks
      const crmTasks = await storage.getJSON<any[]>("crm-tasks") || [];
      crmTasks
        .filter(t => !t.completed && t.rok < today)
        .forEach(t => {
          newNotifications.push({
            id: `task-${t.id}-${Date.now()}`,
            type: "task",
            title: "Zadatak kasni",
            message: `Zadatak '${t.naziv}' kasni ${Math.floor((now.getTime() - new Date(t.rok).getTime()) / (1000 * 60 * 60 * 24))} dan(a).`,
            timestamp: new Date().toISOString(),
            read: false,
            icon: AlertCircle,
          });
        });

      // Check paid invoices
      const invoices = await storage.getJSON<any[]>("crm-invoices") || [];
      const recentlyPaid = invoices.filter(inv => {
        if (inv.status !== "placeno") return false;
        const paidDate = new Date(inv.datumIzdavanja);
        const daysDiff = (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff < 1;
      });

      recentlyPaid.forEach(inv => {
        newNotifications.push({
          id: `inv-${inv.id}-${Date.now()}`,
          type: "invoice",
          title: "Faktura plaćena!",
          message: `Faktura #${inv.brojFakture} je plaćena!`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: FileText,
        });
      });

      if (newNotifications.length > 0) {
        const allNotifications = [...notifications, ...newNotifications];
        setNotifications(allNotifications);
        await storage.setJSON("notifications", allNotifications);
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await storage.setJSON("notifications", updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await storage.setJSON("notifications", updated);
  };

  const deleteNotification = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    await storage.setJSON("notifications", updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (notification: Notification) => {
    const Icon = notification.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Obavijesti</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Označi sve kao pročitano
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nema novih obavijesti
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.timestamp).toLocaleString("sr-RS")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
