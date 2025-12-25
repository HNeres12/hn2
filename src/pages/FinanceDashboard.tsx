import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ExpenseCard } from '@/components/finance/ExpenseCard';
import { CategoryBreakdown } from '@/components/finance/CategoryBreakdown';
import { SubscriptionsList } from '@/components/finance/SubscriptionsList';
import { InstallmentsList } from '@/components/finance/InstallmentsList';
import { MonthlyChart } from '@/components/finance/MonthlyChart';
import { DateRangeFilter } from '@/components/finance/DateRangeFilter';
import { useExpenses } from '@/contexts/ExpenseContext';

export default function FinanceDashboard() {
  const { expenses, subscriptions, installments, fixedExpenses, expenseCategories } = useExpenses();
  
  // Data starts from October 2025
  const MIN_DATE = new Date(2025, 9, 1); // October 2025
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultStart = currentMonth < MIN_DATE ? MIN_DATE : currentMonth;
  
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const handleRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = new Date(exp.year, exp.month - 1, 1);
      return expDate >= startDate && expDate <= endDate;
    });
  }, [expenses, startDate, endDate]);

  // Calculate number of months in range
  const monthsInRange = useMemo(() => {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  }, [startDate, endDate]);

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.value, 0);
  
  // Monthly recurring values (these are per-month values)
  const subscriptionsMonthly = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.value, 0);
  const installmentsMonthly = installments.reduce((sum, i) => {
    const remaining = i.totalInstallments - i.paidInstallments;
    return remaining > 0 ? sum + i.installmentValue : sum;
  }, 0);
  const fixedExpensesMonthly = fixedExpenses
    .filter((f) => f.active)
    .reduce((sum, f) => sum + f.value, 0);

  // Total recurring per month
  const totalRecurringMonthly = subscriptionsMonthly + installmentsMonthly + fixedExpensesMonthly;
  
  // For total period: expenses are already filtered by period, recurring values need to be multiplied
  const totalPeriod = totalExpenses + (totalRecurringMonthly * monthsInRange);
  
  // Average monthly expense
  const averageMonthlyExpense = monthsInRange > 0 ? totalPeriod / monthsInRange : 0;

  const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
    acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.value;
    return acc;
  }, {} as Record<string, number>);

  const formatDateRange = () => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const startStr = `${months[startDate.getMonth()]} ${startDate.getFullYear()}`;
    const endStr = `${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
    return startStr === endStr ? startStr : `${startStr} a ${endStr}`;
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard de Finanças</h1>
            <p className="text-muted-foreground">
              {formatDateRange()}
            </p>
          </div>
          <DateRangeFilter 
            startDate={startDate}
            endDate={endDate}
            onRangeChange={handleRangeChange}
            minDate={MIN_DATE}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <ExpenseCard
            title="Total do Período"
            value={totalPeriod}
            subtitle="Todas as despesas"
            icon="Wallet"
            color="hsl(174, 72%, 46%)"
            index={0}
          />
          <ExpenseCard
            title="Gasto Médio"
            value={averageMonthlyExpense}
            subtitle={`Média de ${monthsInRange} ${monthsInRange === 1 ? 'mês' : 'meses'}`}
            icon="TrendingUp"
            color="hsl(262, 83%, 58%)"
            index={1}
          />
          <ExpenseCard
            title="Despesas Fixas"
            value={fixedExpensesMonthly}
            subtitle={`${fixedExpenses.filter(f => f.active).length} contas fixas`}
            icon="Home"
            color="hsl(200, 72%, 46%)"
            index={2}
          />
          <ExpenseCard
            title="Assinaturas"
            value={subscriptionsMonthly}
            subtitle={`${subscriptions.filter(s => s.active).length} serviços ativos`}
            icon="Repeat"
            color="hsl(142, 72%, 46%)"
            index={3}
          />
          <ExpenseCard
            title="Parcelas"
            value={installmentsMonthly}
            subtitle="Compromisso mensal"
            icon="Calendar"
            color="hsl(38, 92%, 50%)"
            index={4}
          />
        </div>

        <MonthlyChart
          expenses={expenses}
          subscriptions={subscriptions}
          installments={installments}
          fixedExpenses={fixedExpenses}
          months={monthsInRange}
          startDate={startDate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CategoryBreakdown
            categories={expenseCategories}
            expenses={expensesByCategory}
            total={totalExpenses}
          />
          <SubscriptionsList subscriptions={subscriptions} />
          <InstallmentsList installments={installments} />
        </div>
      </div>
    </MainLayout>
  );
}
