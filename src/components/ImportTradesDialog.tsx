import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

interface ImportTradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ParsedTrade {
  symbol: string;
  assetCategory: string;
  currency: string;
  entryDate: string;
  entryQuantity: number;
  entryPrice: number;
  exitDate?: string;
  exitQuantity?: number;
  exitPrice?: number;
  commission: number;
  realizedPnl: number;
  status: string;
}

export const ImportTradesDialog = ({ open, onOpenChange, onImportComplete }: ImportTradesDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const parseIBKRCsv = (csvText: string): ParsedTrade[] => {
    const lines = csvText.split('\n');
    const trades: ParsedTrade[] = [];
    const tradesBySymbol = new Map<string, any>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('Trades,Data,Order,')) continue;

      const parts = line.split(',');
      if (parts.length < 14) continue;

      const assetCategory = parts[2]; // Stocks, Equity and Index Options, Forex
      const currency = parts[3];
      const symbol = parts[4].replace(/"/g, '');
      const dateTime = parts[5].replace(/"/g, '');
      const quantity = parseFloat(parts[6]);
      const price = parseFloat(parts[7]);
      const commission = Math.abs(parseFloat(parts[10] || '0'));
      const realizedPnl = parseFloat(parts[12] || '0');
      const code = parts[parts.length - 1]; // O (Open) or C (Close)

      const tradeKey = `${symbol}-${assetCategory}`;

      if (code === 'O' && quantity > 0) {
        // Opening trade (buy for long, sell for short)
        tradesBySymbol.set(tradeKey, {
          symbol,
          assetCategory,
          currency,
          entryDate: dateTime,
          entryQuantity: Math.abs(quantity),
          entryPrice: price,
          commission,
          realizedPnl: 0,
          status: 'open',
        });
      } else if (code === 'C' && quantity < 0) {
        // Closing trade
        const openTrade = tradesBySymbol.get(tradeKey);
        if (openTrade) {
          trades.push({
            ...openTrade,
            exitDate: dateTime,
            exitQuantity: Math.abs(quantity),
            exitPrice: price,
            commission: openTrade.commission + commission,
            realizedPnl,
            status: 'closed',
          });
          tradesBySymbol.delete(tradeKey);
        }
      }
    }

    // Add remaining open trades
    tradesBySymbol.forEach((trade) => {
      trades.push(trade);
    });

    return trades;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const parsedTrades = parseIBKRCsv(text);

      if (parsedTrades.length === 0) {
        toast.error("No trades found in the file");
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to import trades");
        return;
      }

      // Insert trades into database
      const { error } = await supabase.from('trades').insert(
        parsedTrades.map(trade => ({
          user_id: user.id,
          symbol: trade.symbol,
          asset_category: trade.assetCategory,
          currency: trade.currency,
          entry_date: trade.entryDate,
          entry_quantity: trade.entryQuantity,
          entry_price: trade.entryPrice,
          exit_date: trade.exitDate,
          exit_quantity: trade.exitQuantity,
          exit_price: trade.exitPrice,
          total_commission: trade.commission,
          realized_pnl: trade.realizedPnl,
          status: trade.status,
        }))
      );

      if (error) throw error;

      toast.success(`Successfully imported ${parsedTrades.length} trades`);
      onImportComplete();
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || "Failed to import trades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import IBKR Activity Statement</DialogTitle>
          <DialogDescription>
            Upload your Interactive Brokers CSV activity statement to import trades.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
              {file && (
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {file.name}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
