import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  subtitle?: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
}: StatsCardProps) => {
  return (
    <Card className="relative overflow-hidden border-border bg-gradient-card shadow-card transition-all duration-300 hover:shadow-elegant">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 pt-1">
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend === "up" ? "text-success" : "text-destructive"
                  )}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-accent/50 p-3">
            <Icon className="h-6 w-6 text-accent-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
