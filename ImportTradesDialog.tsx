import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  date: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  pnl?: number;
}

export const ImportTradesDialog = ({ open, onOpenChange, onImportComplete }: ImportTradesDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const parseCSV = (csvText: string): ParsedTrade[] => {
    const lines = csvText.split('\n');
    const trades: ParsedTrade[] = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      if (parts.length < 5) continue;

      const trade: ParsedTrade = {
        date: parts[0],
        symbol: parts[1],
        type: parts[2].toLowerCase(),
        quantity: Math.abs(parseFloat(parts[3])) || 0,
        price: parseFloat(parts[4]) || 0,
        pnl: parts[5] ? parseFloat(parts[5]) : undefined
      };

      if (!isNaN(trade.quantity) && !isNaN(trade.price)) {
        trades.push(trade);
      }
    }

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
      const parsedTrades = parseCSV(text);

      if (parsedTrades.length === 0) {
        toast.error("No trades found in the file");
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to import trades");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('trades').insert(
        parsedTrades.map(trade => ({
          user_id: user.id,
          date: trade.date,
          symbol: trade.symbol,
          type: trade.type,
          quantity: trade.quantity,
          price: trade.price,
          pnl: trade.pnl,
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
          <DialogTitle>Import Trade Data</DialogTitle>
          <DialogDescription>
            Upload your CSV file with columns: date, symbol, type, quantity, price, pnl (optional)
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