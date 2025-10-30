import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar } from "lucide-react";
import { Subscription } from "@/types/crm";

interface SubscriptionsDueWidgetProps {
  subscriptions: Subscription[];
}

export const SubscriptionsDueWidget = ({ subscriptions }: SubscriptionsDueWidgetProps) => {
  const today = new Date();
  const currentDay = today.getDate();

  // Filter subscriptions that are due today
  const dueToday = subscriptions.filter(
    (sub) => sub.aktivna && sub.danNaplate === currentDay
  );

  if (dueToday.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="h-5 w-5 text-primary" />
          Pretplate za Naplatu Danas
          <Badge variant="destructive" className="ml-auto">
            {dueToday.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {dueToday.map((subscription) => (
            <div
              key={subscription.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{subscription.nazivUsluge}</p>
                  <p className="text-sm text-muted-foreground">
                    Client ID: {subscription.clientId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{subscription.mjesecniIznos} KM</p>
                <p className="text-xs text-muted-foreground">Mjesečno</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
