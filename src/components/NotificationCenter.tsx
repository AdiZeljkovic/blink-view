import { useState, useEffect } from "react";
import { Bell, X, Calendar, Briefcase, Trophy, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupabase } from "@/hooks/useSupabase";
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
  const { supabase } = useSupabase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Check for new notifications every minute
    const interval = setInterval(checkForNotifications, 60000);
    return () => clearInterval(interval);
  }, [supabase]);

  const loadNotifications = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications((data || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: n.created_at,
        read: n.read,
        icon: getIconFromType(n.type),
      })));
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const getIconFromType = (type: string) => {
    switch (type) {
      case "reminder": return Calendar;
      case "task": return AlertCircle;
      case "invoice": return FileText;
      case "achievement": return Trophy;
      default: return Bell;
    }
  };

  const checkForNotifications = async () => {
    if (!supabase) return;

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const newNotifications: Array<Omit<Notification, "id">> = [];

    try {
      // Check calendar events (15 min before)
      const { data: calendarEvents } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("datum", today);

      (calendarEvents || []).forEach((e: any) => {
        const eventTime = new Date(`${e.datum}T${e.vrijeme || "00:00"}`);
        const timeDiff = eventTime.getTime() - now.getTime();
        if (timeDiff > 0 && timeDiff < 15 * 60 * 1000) {
          newNotifications.push({
            type: "reminder",
            title: "Podsjetnik",
            message: `Događaj '${e.naslov}' počinje za 15 min.`,
            timestamp: new Date().toISOString(),
            read: false,
            icon: Calendar,
          });
        }
      });

      // Check overdue CRM tasks
      const { data: crmTasks } = await supabase
        .from("tasks")
        .select("*")
        .not("completed", "eq", true)
        .lt("rok", today);

      (crmTasks || []).forEach((t: any) => {
        newNotifications.push({
          type: "task",
          title: "Zadatak kasni",
          message: `Zadatak '${t.naziv}' kasni ${Math.floor((now.getTime() - new Date(t.rok).getTime()) / (1000 * 60 * 60 * 24))} dan(a).`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: AlertCircle,
        });
      });

      // Save new notifications to database
      if (newNotifications.length > 0) {
        await supabase.from("notifications").insert(
          newNotifications.map(n => ({
            type: n.type,
            title: n.title,
            message: n.message,
            read: false,
          }))
        );
        loadNotifications();
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!supabase) return;

    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!supabase) return;

    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!supabase) return;

    try {
      await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
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