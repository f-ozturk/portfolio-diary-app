import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar } from "lucide-react";
import { TradeJournal } from "./TradeJournal";
import { StatsCard } from "./StatsCard";
import { PerformanceChart } from "./PerformanceChart";

export const Dashboard = () => {
  // Mock data - in a real app this would come from a backend
  const stats = {
    totalPnL: 12456.78,
    winRate: 64.5,
    totalTrades: 127,
    avgWin: 245.30,
    avgLoss: -156.20,
    profitFactor: 1.89,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Trading Journal
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/90 sm:text-xl">
              Track, analyze, and improve your trading performance
            </p>
          </div>
        </div>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-foreground/5 to-primary-foreground/10" />
      </div>

      {/* Stats Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total P&L"
            value={`$${stats.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            trend={stats.totalPnL > 0 ? "up" : "down"}
            trendValue="+12.5%"
          />
          <StatsCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            icon={Target}
            trend="up"
            trendValue="+2.3%"
          />
          <StatsCard
            title="Total Trades"
            value={stats.totalTrades.toString()}
            icon={Calendar}
          />
          <StatsCard
            title="Average Win"
            value={`$${stats.avgWin.toFixed(2)}`}
            icon={TrendingUp}
            trend="up"
            subtitle="Per winning trade"
          />
          <StatsCard
            title="Average Loss"
            value={`$${Math.abs(stats.avgLoss).toFixed(2)}`}
            icon={TrendingDown}
            trend="down"
            subtitle="Per losing trade"
          />
          <StatsCard
            title="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
            icon={Target}
            trend="up"
            subtitle="Gross profit / Gross loss"
          />
        </div>

        {/* Performance Chart */}
        <div className="mt-8">
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </div>

        {/* Trade Journal */}
        <div className="mt-8">
          <TradeJournal />
        </div>
      </div>
    </div>
  );
};
