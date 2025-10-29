import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Deal } from "@/types/crm";
import { TrendingUp } from "lucide-react";

interface SalesFunnelProps {
  deals: Deal[];
}

const SalesFunnel = ({ deals }: SalesFunnelProps) => {
  const statusConfig = [
    { value: "novi", label: "Novi Kontakt", color: "hsl(var(--primary))" },
    { value: "pregovori", label: "Pregovori", color: "hsl(var(--accent))" },
    { value: "ponuda", label: "Poslano", color: "#a855f7" },
    { value: "dobijeno", label: "Dobijeno", color: "#22c55e" },
  ];

  const funnelData = statusConfig.map(status => ({
    name: status.label,
    count: deals.filter(d => d.status === status.value).length,
    color: status.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Sales Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesFunnel;
