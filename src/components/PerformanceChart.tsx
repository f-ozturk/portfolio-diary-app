import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export const PerformanceChart = () => {
  // Mock data for the performance chart
  const data = [
    { date: "Oct 1", pnl: 0 },
    { date: "Oct 5", pnl: 1200 },
    { date: "Oct 10", pnl: 2400 },
    { date: "Oct 15", pnl: 1800 },
    { date: "Oct 20", pnl: 3200 },
    { date: "Oct 25", pnl: 4100 },
    { date: "Oct 30", pnl: 5200 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(271 76% 53%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(271 76% 53%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "P&L"]}
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="hsl(271 76% 53%)"
            strokeWidth={3}
            fill="url(#colorPnl)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
