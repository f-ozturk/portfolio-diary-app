-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic trade info
  symbol TEXT NOT NULL,
  asset_category TEXT NOT NULL, -- Stocks, Options, Forex
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Entry trade
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_quantity DECIMAL NOT NULL,
  entry_price DECIMAL NOT NULL,
  
  -- Exit trade (nullable for open positions)
  exit_date TIMESTAMP WITH TIME ZONE,
  exit_quantity DECIMAL,
  exit_price DECIMAL,
  
  -- Financial details
  total_commission DECIMAL DEFAULT 0,
  realized_pnl DECIMAL DEFAULT 0,
  
  -- Additional info
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open, closed
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own trades" 
ON public.trades 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades" 
ON public.trades 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" 
ON public.trades 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" 
ON public.trades 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_entry_date ON public.trades(entry_date);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_trades_status ON public.trades(status);