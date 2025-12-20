import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Expense, Subscription, InstallmentPurchase, FixedExpense } from '@/types/finance';

interface MonthlyChartProps {
  expenses: Expense[];
  subscriptions: Subscription[];
  installments: InstallmentPurchase[];
  fixedExpenses?: FixedExpense[];
  months: number;
  startDate?: Date;
}

export function MonthlyChart({ expenses, subscriptions, installments, fixedExpenses = [], months, startDate }: MonthlyChartProps) {
  const chartData = useMemo(() => {
    const data: Array<{
      month: string;
      total: number;
      cartao: number;
      parcelas: number;
      assinaturas: number;
      fixas: number;
    }> = [];

    const baseDate = startDate || new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      // Filter expenses for this month
      const monthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      });

      const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.value, 0);
      const cardExpenses = monthExpenses
        .filter((exp) => exp.paymentMethod === 'card')
        .reduce((sum, exp) => sum + exp.value, 0);

      // Subscriptions (same every month for active ones)
      const subscriptionsTotal = subscriptions
        .filter((s) => s.active)
        .reduce((sum, s) => sum + s.value, 0);

      // Fixed expenses
      const fixedTotal = fixedExpenses
        .filter((f) => f.active)
        .reduce((sum, f) => sum + f.value, 0);

      // Installments active in this month
      const installmentsTotal = installments.reduce((sum, inst) => {
        const instStartDate = new Date(inst.startDate);
        const monthsDiff = (date.getFullYear() - instStartDate.getFullYear()) * 12 + 
                          (date.getMonth() - instStartDate.getMonth());
        
        if (monthsDiff >= 0 && monthsDiff < inst.totalInstallments) {
          return sum + inst.installmentValue;
        }
        return sum;
      }, 0);

      data.push({
        month: monthYear,
        total: totalExpenses + subscriptionsTotal + installmentsTotal + fixedTotal,
        cartao: cardExpenses,
        parcelas: installmentsTotal,
        assinaturas: subscriptionsTotal,
        fixas: fixedTotal,
      });
    }

    return data;
  }, [expenses, subscriptions, installments, fixedExpenses, months, startDate]);

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="stat-card animate-fade-in">
      <h3 className="font-semibold mb-4">Evolução Mensal</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCartao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorParcelas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAssinaturas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 72%, 46%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 72%, 46%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFixas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200, 72%, 46%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(200, 72%, 46%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatValue(value), name]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="hsl(174, 72%, 46%)"
              fillOpacity={1}
              fill="url(#colorTotal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="cartao"
              name="Cartão"
              stroke="hsl(262, 83%, 58%)"
              fillOpacity={1}
              fill="url(#colorCartao)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="fixas"
              name="Fixas"
              stroke="hsl(200, 72%, 46%)"
              fillOpacity={1}
              fill="url(#colorFixas)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="parcelas"
              name="Parcelas"
              stroke="hsl(38, 92%, 50%)"
              fillOpacity={1}
              fill="url(#colorParcelas)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="assinaturas"
              name="Assinaturas"
              stroke="hsl(142, 72%, 46%)"
              fillOpacity={1}
              fill="url(#colorAssinaturas)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
