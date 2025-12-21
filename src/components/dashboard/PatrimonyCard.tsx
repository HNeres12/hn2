import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PatrimonyCardProps {
  totalValue: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function PatrimonyCard({
  totalValue,
  onRefresh,
  isRefreshing,
}: PatrimonyCardProps) {
  return (
    <div className="stat-card glow-primary animate-fade-in">
      <div className="flex items-start justify-between">
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
    </div>
  );
}
