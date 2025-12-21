import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    }> = [];

    const baseDate = startDate || new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      // Filter expenses for this month
      const monthExpenses = expenses.filter((exp) => {
        return exp.month === (date.getMonth() + 1) && exp.year === date.getFullYear();
      });

      const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.value, 0);

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
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(174, 72%, 46%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(174, 72%, 36%)" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatValue(value), 'Total']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
            />
            <Bar
              dataKey="total"
              name="Total"
              fill="url(#colorTotal)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
