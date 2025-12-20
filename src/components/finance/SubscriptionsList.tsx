import { Subscription } from '@/types/finance';
import { Badge } from '@/components/ui/badge';
import { Repeat } from 'lucide-react';

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const activeSubscriptions = subscriptions.filter((s) => s.active);
  const totalMonthly = activeSubscriptions.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Assinaturas Ativas</h3>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary">
          {activeSubscriptions.length} ativas
        </Badge>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs text-muted-foreground">Total Mensal</p>
        <p className="font-mono text-xl font-semibold text-primary">
          R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activeSubscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
          >
            <div>
              <p className="font-medium text-sm">{subscription.name}</p>
              <p className="text-xs text-muted-foreground">
                Cobrança dia {subscription.billingDay}
              </p>
            </div>
            <p className="font-mono text-sm">
              R$ {subscription.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
