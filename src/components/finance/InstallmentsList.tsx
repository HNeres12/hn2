import { InstallmentPurchase } from '@/types/finance';
import { CreditCard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface InstallmentsListProps {
  installments: InstallmentPurchase[];
}

export function InstallmentsList({ installments }: InstallmentsListProps) {
  const totalMonthly = installments.reduce((sum, i) => {
    const remaining = i.totalInstallments - i.paidInstallments;
    return remaining > 0 ? sum + i.installmentValue : sum;
  }, 0);

  const totalRemaining = installments.reduce((sum, i) => {
    const remaining = i.totalInstallments - i.paidInstallments;
    return sum + remaining * i.installmentValue;
  }, 0);

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-warning" />
        <h3 className="font-semibold">Compras Parceladas</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-xs text-muted-foreground">Mensal</p>
          <p className="font-mono text-lg font-semibold text-warning">
            R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Total Restante</p>
          <p className="font-mono text-lg font-semibold">
            R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto">
        {installments.map((purchase) => {
          const progress = (purchase.paidInstallments / purchase.totalInstallments) * 100;
          const remaining = purchase.totalInstallments - purchase.paidInstallments;

          return (
            <div key={purchase.id} className="p-3 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{purchase.name}</p>
                <p className="font-mono text-sm">
                  R$ {purchase.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {purchase.paidInstallments}/{purchase.totalInstallments} parcelas • {remaining} restantes
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
