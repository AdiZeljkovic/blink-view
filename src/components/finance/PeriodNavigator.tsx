import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { sr } from "date-fns/locale";

interface PeriodNavigatorProps {
  period: "week" | "month";
  currentDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
}

const PeriodNavigator = ({ period, currentDate, onNavigate }: PeriodNavigatorProps) => {
  const getPeriodLabel = () => {
    if (period === "month") {
      return format(currentDate, "MMMM yyyy", { locale: sr });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, "d MMM", { locale: sr })} - ${format(weekEnd, "d MMM yyyy", { locale: sr })}`;
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onNavigate("prev")}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="min-w-[200px] text-center">
        <span className="text-lg font-semibold capitalize">{getPeriodLabel()}</span>
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onNavigate("next")}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PeriodNavigator;
