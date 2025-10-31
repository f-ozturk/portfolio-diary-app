import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpRight, ArrowDownRight, Upload } from "lucide-react";
import { AddTradeDialog } from "./AddTradeDialog";
import { ImportTradesDialog } from "./ImportTradesDialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('entry_date', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedTrades: Trade[] = data.map(trade => ({
        id: trade.id,
        date: new Date(trade.entry_date).toISOString().split('T')[0],
        symbol: trade.symbol,
        type: trade.entry_quantity > 0 ? "long" : "short",
        entry: trade.entry_price,
        exit: trade.exit_price || trade.entry_price,
        quantity: Math.abs(trade.entry_quantity),
        pnl: trade.realized_pnl || 0,
        notes: trade.notes,
      }));

      setTrades(formattedTrades);
    } catch (error: any) {
      console.error('Error fetching trades:', error);
      toast.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Trades</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsImportDialogOpen(true)}
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Trade
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading trades...
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No trades yet. Import your IBKR statement or add trades manually.
          </div>
        ) : (
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
        )}
      </CardContent>
      <AddTradeDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <ImportTradesDialog 
        open={isImportDialogOpen} 
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={fetchTrades}
      />
    </Card>
  );
};
