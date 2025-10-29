import { Button } from "@/components/ui/button";

interface PeriodSelectorProps {
  period: "week" | "month";
  onPeriodChange: (period: "week" | "month") => void;
}

const PeriodSelector = ({ period, onPeriodChange }: PeriodSelectorProps) => {
  return (
    <div className="flex gap-2 bg-muted rounded-lg p-1">
      <Button
        variant={period === "week" ? "default" : "ghost"}
        size="sm"
        onClick={() => onPeriodChange("week")}
        className="flex-1"
      >
        Sedmica
      </Button>
      <Button
        variant={period === "month" ? "default" : "ghost"}
        size="sm"
        onClick={() => onPeriodChange("month")}
        className="flex-1"
      >
        Mjesec
      </Button>
    </div>
  );
};

export default PeriodSelector;
