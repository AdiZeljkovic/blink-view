import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Invoice } from "@/types/crm";
import { DollarSign } from "lucide-react";
import { format, parseISO, startOfMonth } from "date-fns";
import { sr } from "date-fns/locale";

interface RevenueChartProps {
  invoices: Invoice[];
}

const RevenueChart = ({ invoices }: RevenueChartProps) => {
  // Group paid invoices by month
  const paidInvoices = invoices.filter(inv => inv.status === "placeno");
  
  const monthlyRevenue = paidInvoices.reduce((acc, inv) => {
    const monthKey = format(startOfMonth(parseISO(inv.datumIzdavanja)), "MMM yyyy", { locale: sr });
    acc[monthKey] = (acc[monthKey] || 0) + inv.iznos;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyRevenue)
    .map(([month, revenue]) => ({ month, revenue }))
    .slice(-6); // Last 6 months

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Mjesečni Prihodi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
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
              formatter={(value: number) => [`${value.toFixed(2)} KM`, "Prihod"]}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
