import { TradeRecord } from './csvProcessor';

export interface TradingMetrics {
    winRate: number;
    averageWin: number;
    averageLoss: number;
    maxDrawdown: number;
    totalReturn: number;
    averageHoldingPeriod: number;
    mostTradedAsset: string;
    profitFactor: number;
}

export class MetricsCalculator {
    private trades: TradeRecord[];

    constructor(trades: TradeRecord[]) {
        this.trades = trades;
    }

    calculateMetrics(): TradingMetrics {
        const winningTrades = this.trades.filter(trade => trade.profitLoss && trade.profitLoss > 0);
        const losingTrades = this.trades.filter(trade => trade.profitLoss && trade.profitLoss < 0);

        const winRate = winningTrades.length / this.trades.length;
        const averageWin = this.calculateAverage(winningTrades.map(t => t.profitLoss!));
        const averageLoss = this.calculateAverage(losingTrades.map(t => t.profitLoss!));
        
        return {
            winRate: winRate,
            averageWin: averageWin,
            averageLoss: averageLoss,
            maxDrawdown: this.calculateMaxDrawdown(),
            totalReturn: this.calculateTotalReturn(),
            averageHoldingPeriod: this.calculateAverageHoldingPeriod(),
            mostTradedAsset: this.findMostTradedAsset(),
            profitFactor: this.calculateProfitFactor(winningTrades, losingTrades)
        };
    }

    private calculateAverage(numbers: number[]): number {
        return numbers.length > 0 
            ? numbers.reduce((a, b) => a + b, 0) / numbers.length 
            : 0;
    }

    private calculateMaxDrawdown(): number {
        let maxDrawdown = 0;
        let peak = 0;
        let runningTotal = 0;

        this.trades.forEach(trade => {
            if (trade.profitLoss) {
                runningTotal += trade.profitLoss;
                if (runningTotal > peak) {
                    peak = runningTotal;
                }
                const drawdown = peak - runningTotal;
                maxDrawdown = Math.max(maxDrawdown, drawdown);
            }
        });

        return maxDrawdown;
    }

    private calculateTotalReturn(): number {
        return this.trades.reduce((sum, trade) => 
            sum + (trade.profitLoss || 0), 0);
    }

    private calculateAverageHoldingPeriod(): number {
        const holdingPeriods = this.trades
            .map((trade, index, arr) => {
                if (index === 0) return 0;
                return trade.date.getTime() - arr[index - 1].date.getTime();
            })
            .filter(period => period > 0);

        return this.calculateAverage(holdingPeriods) / (1000 * 60 * 60 * 24); // Convert to days
    }

    private findMostTradedAsset(): string {
        const tradeCounts = this.trades.reduce((acc, trade) => {
            acc[trade.symbol] = (acc[trade.symbol] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(tradeCounts)
            .sort(([,a], [,b]) => b - a)[0][0];
    }

    private calculateProfitFactor(winningTrades: TradeRecord[], losingTrades: TradeRecord[]): number {
        const totalProfits = winningTrades.reduce((sum, trade) => 
            sum + (trade.profitLoss || 0), 0);
        const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => 
            sum + (trade.profitLoss || 0), 0));

        return totalLosses === 0 ? totalProfits : totalProfits / totalLosses;
    }
}