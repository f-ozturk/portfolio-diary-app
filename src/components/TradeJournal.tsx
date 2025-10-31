import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AddTradeDialog } from "./AddTradeDialog";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: "long" | "short";
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  notes?: string;
}

export const TradeJournal = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock trades data
  const trades: Trade[] = [
    {
      id: "1",
      date: "2025-10-30",
      symbol: "AAPL",
      type: "long",
      entry: 185.50,
      exit: 189.25,
      quantity: 100,
      pnl: 375.00,
      notes: "Breakout above resistance",
    },
    {
      id: "2",
      date: "2025-10-29",
      symbol: "TSLA",
      type: "short",
      entry: 245.80,
      exit: 242.10,
      quantity: 50,
      pnl: 185.00,
    },
    {
      id: "3",
      date: "2025-10-28",
      symbol: "MSFT",
      type: "long",
      entry: 420.30,
      exit: 418.90,
      quantity: 25,
      pnl: -35.00,
      notes: "Stop loss hit",
    },
  ];

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Trades</CardTitle>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Trade
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between rounded-lg border border-border bg-gradient-card p-4 transition-all duration-200 hover:shadow-card"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    trade.type === "long"
                      ? "bg-success/10"
                      : "bg-primary/10"
                  )}
                >
                  {trade.type === "long" ? (
                    <ArrowUpRight className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {trade.symbol}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        trade.type === "long"
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      {trade.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{trade.date}</span>
                    <span>
                      ${trade.entry} → ${trade.exit}
                    </span>
                    <span>{trade.quantity} shares</span>
                  </div>
                  {trade.notes && (
                    <p className="text-sm text-muted-foreground">
                      {trade.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-2xl font-bold",
                    trade.pnl >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {trade.pnl >= 0 ? "+" : ""}$
                  {trade.pnl.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(((trade.exit - trade.entry) / trade.entry) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <AddTradeDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </Card>
  );
};
