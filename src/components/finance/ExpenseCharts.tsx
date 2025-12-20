import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Expense, Subscription, FixedExpense, InstallmentPurchase } from '@/types/finance';
import { expenseCategories } from '@/data/mockData';

interface ExpenseChartsProps {
  expenses: Expense[];
  subscriptions: Subscription[];
  fixedExpenses: FixedExpense[];
  installments: InstallmentPurchase[];
}

export function ExpenseCharts({ expenses, subscriptions, fixedExpenses, installments }: ExpenseChartsProps) {
  // Chart by type (expenses, subscriptions, fixed, installments)
  const typeChartData = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
    const totalSubscriptions = subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.value, 0);
    const totalFixed = fixedExpenses.filter((f) => f.active).reduce((sum, f) => sum + f.value, 0);
    const totalInstallments = installments.reduce((sum, i) => {
      const remaining = i.totalInstallments - i.paidInstallments;
      return remaining > 0 ? sum + i.installmentValue : sum;
    }, 0);

    return [
      { name: 'Despesas', value: totalExpenses, color: 'hsl(262, 83%, 58%)' },
      { name: 'Assinaturas', value: totalSubscriptions, color: 'hsl(142, 72%, 46%)' },
      { name: 'Fixas', value: totalFixed, color: 'hsl(200, 72%, 46%)' },
      { name: 'Parcelas', value: totalInstallments, color: 'hsl(38, 92%, 50%)' },
    ].filter((item) => item.value > 0);
  }, [expenses, subscriptions, fixedExpenses, installments]);

  // Chart by category (expenses only)
  const categoryChartData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    
    expenses.forEach((exp) => {
      byCategory[exp.categoryId] = (byCategory[exp.categoryId] || 0) + exp.value;
    });

    return Object.entries(byCategory).map(([categoryId, value]) => {
      const category = expenseCategories.find((c) => c.id === categoryId);
      return {
        name: category?.name || 'Outros',
        value,
        color: category?.color || 'hsl(var(--muted))',
      };
    }).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalMonthly = useMemo(() => {
    return typeChartData.reduce((sum, item) => sum + item.value, 0);
  }, [typeChartData]);

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (typeChartData.length === 0) {
    return (
      <div className="stat-card text-center py-8">
        <p className="text-muted-foreground">Nenhum dado para exibir</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart by Type */}
      <div className="stat-card animate-fade-in">
        <h3 className="font-semibold mb-2">Despesas por Tipo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Total mensal estimado: <span className="font-mono font-semibold text-foreground">{formatValue(totalMonthly)}</span>
        </p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {typeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatValue(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart by Category */}
      {categoryChartData.length > 0 && (
        <div className="stat-card animate-fade-in">
          <h3 className="font-semibold mb-2">Despesas por Categoria</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Distribuição das despesas variáveis
          </p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatValue(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
