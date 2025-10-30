import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Trophy } from "lucide-react";
import { storage } from "@/lib/storage";

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  category: string;
}

interface GoalsProgressWidgetProps {
  totalRevenue: number;
}

export const GoalsProgressWidget = ({ totalRevenue }: GoalsProgressWidgetProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const savedGoals = await storage.getJSON<Goal[]>("goals") || [];
      // Filter only revenue-related goals
      const revenueGoals = savedGoals.filter(g => 
        g.title.toLowerCase().includes("zarad") || 
        g.title.toLowerCase().includes("prihod") ||
        g.category === "financial"
      );
      setGoals(revenueGoals);
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Napredak ka Ciljevima
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = (totalRevenue / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{goal.title}</span>
                    {isCompleted && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {totalRevenue.toFixed(0)} / {goal.targetAmount} KM
                  </span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {progress.toFixed(1)}% postignuto
                  </span>
                  {!isCompleted && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Preostalo: {(goal.targetAmount - totalRevenue).toFixed(0)} KM
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
