import { MainLayout } from '@/components/layout/MainLayout';
import { ExpenseCard } from '@/components/finance/ExpenseCard';
import { CategoryBreakdown } from '@/components/finance/CategoryBreakdown';
import { SubscriptionsList } from '@/components/finance/SubscriptionsList';
import { InstallmentsList } from '@/components/finance/InstallmentsList';
import { expenses, expenseCategories, subscriptions, installmentPurchases } from '@/data/mockData';

export default function FinanceDashboard() {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
  const cardExpenses = expenses.filter((exp) => exp.paymentMethod === 'card').reduce((sum, exp) => sum + exp.value, 0);
  const subscriptionsTotal = subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.value, 0);
  const installmentsTotal = installmentPurchases.reduce((sum, i) => {
    const remaining = i.totalInstallments - i.paidInstallments;
    return remaining > 0 ? sum + i.installmentValue : sum;
  }, 0);

  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.value;
    return acc;
  }, {} as Record<string, number>);

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Finanças</h1>
          <p className="text-muted-foreground">
            Controle seus gastos de {currentMonth}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ExpenseCard
            title="Total do Mês"
            value={totalExpenses + subscriptionsTotal + installmentsTotal}
            subtitle="Despesas + Assinaturas + Parcelas"
            icon="Wallet"
            color="hsl(174, 72%, 46%)"
            index={0}
          />
          <ExpenseCard
            title="Cartão de Crédito"
            value={cardExpenses}
            subtitle="Compras no cartão"
            icon="CreditCard"
            color="hsl(262, 83%, 58%)"
            index={1}
          />
          <ExpenseCard
            title="Assinaturas"
            value={subscriptionsTotal}
            subtitle={`${subscriptions.filter(s => s.active).length} serviços ativos`}
            icon="Repeat"
            color="hsl(142, 72%, 46%)"
            index={2}
          />
          <ExpenseCard
            title="Parcelas"
            value={installmentsTotal}
            subtitle="Compromisso mensal"
            icon="Calendar"
            color="hsl(38, 92%, 50%)"
            index={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CategoryBreakdown
            categories={expenseCategories}
            expenses={expensesByCategory}
            total={totalExpenses}
          />
          <SubscriptionsList subscriptions={subscriptions} />
          <InstallmentsList installments={installmentPurchases} />
        </div>
      </div>
    </MainLayout>
  );
}
