import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PatrimonyCardProps {
  totalValue: number;
  totalInvested: number;
  variation: number;
  variationPercent: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function PatrimonyCard({
  totalValue,
  totalInvested,
  variation,
  variationPercent,
  onRefresh,
  isRefreshing,
}: PatrimonyCardProps) {
  const isPositive = variation >= 0;

  return (
    <div className="stat-card glow-primary animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">Patrimônio Total</p>
          <h2 className="text-4xl font-bold font-mono tracking-tight">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
          Atualizar
        </Button>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Total Investido</p>
          <p className="font-mono text-lg">
            R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="h-10 w-px bg-border" />
        <div>
          <p className="text-muted-foreground text-xs mb-1">Variação</p>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <span className={cn('font-mono text-lg', isPositive ? 'number-positive' : 'number-negative')}>
              {isPositive ? '+' : ''}R$ {variation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className={cn('text-sm font-medium', isPositive ? 'text-success' : 'text-destructive')}>
              ({isPositive ? '+' : ''}{variationPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
