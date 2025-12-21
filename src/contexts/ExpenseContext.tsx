import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Expense, Subscription, InstallmentPurchase, FixedExpense, ExpenseCategory } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ExpenseContextType {
  expenses: Expense[];
  subscriptions: Subscription[];
  installments: InstallmentPurchase[];
  fixedExpenses: FixedExpense[];
  expenseCategories: ExpenseCategory[];
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleSubscription: (id: string) => Promise<void>;
  addInstallment: (installment: Omit<InstallmentPurchase, 'id'>) => Promise<void>;
  updateInstallment: (id: string, installment: Partial<InstallmentPurchase>) => Promise<void>;
  deleteInstallment: (id: string) => Promise<void>;
  payInstallment: (id: string) => Promise<void>;
  addFixedExpense: (fixedExpense: Omit<FixedExpense, 'id'>) => Promise<void>;
  updateFixedExpense: (id: string, fixedExpense: Partial<FixedExpense>) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  toggleFixedExpense: (id: string) => Promise<void>;
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [installments, setInstallments] = useState<InstallmentPurchase[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshAll = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setSubscriptions([]);
      setInstallments([]);
      setFixedExpenses([]);
      setExpenseCategories([]);
      setLoading(false);
      return;
    }

    try {
      const [expensesRes, subsRes, installmentsRes, fixedRes, categoriesRes] = await Promise.all([
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').order('created_at', { ascending: true }),
        supabase.from('installment_purchases').select('*').order('created_at', { ascending: true }),
        supabase.from('fixed_expenses').select('*').order('created_at', { ascending: true }),
        supabase.from('expense_categories').select('*').order('created_at', { ascending: true }),
      ]);

      if (categoriesRes.data) {
        setExpenseCategories(
          categoriesRes.data.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
          }))
        );
      }

      if (expensesRes.data) {
        setExpenses(
          expensesRes.data.map((e) => ({
            id: e.id,
            categoryId: e.category_id || '',
            name: e.name,
            value: Number(e.value),
            paymentMethod: e.payment_method as Expense['paymentMethod'],
            month: e.month,
            year: e.year,
            notes: e.notes || undefined,
          }))
        );
      }

      if (subsRes.data) {
        setSubscriptions(
          subsRes.data.map((s) => ({
            id: s.id,
            name: s.name,
            value: Number(s.value),
            billingDay: s.billing_day,
            categoryId: s.category_id || '',
            active: s.active,
          }))
        );
      }

      if (installmentsRes.data) {
        setInstallments(
          installmentsRes.data.map((i) => ({
            id: i.id,
            name: i.name,
            totalValue: Number(i.total_value),
            installmentValue: Number(i.installment_value),
            totalInstallments: i.total_installments,
            paidInstallments: i.paid_installments,
            startDate: new Date(i.start_date),
            categoryId: i.category_id || '',
          }))
        );
      }

      if (fixedRes.data) {
        setFixedExpenses(
          fixedRes.data.map((f) => ({
            id: f.id,
            name: f.name,
            value: Number(f.value),
            dueDay: f.due_day,
            categoryId: f.category_id || '',
            active: f.active,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching expenses data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Expenses
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category_id: expense.categoryId || null,
        name: expense.name,
        value: expense.value,
        payment_method: expense.paymentMethod,
        month: expense.month,
        year: expense.year,
        notes: expense.notes || null,
      })
      .select()
      .single();
    if (error) throw error;
    setExpenses((prev) => [
      {
        id: data.id,
        categoryId: data.category_id || '',
        name: data.name,
        value: Number(data.value),
        paymentMethod: data.payment_method as Expense['paymentMethod'],
        month: data.month,
        year: data.year,
        notes: data.notes || undefined,
      },
      ...prev,
    ]);
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    const updateData: Record<string, unknown> = {};
    if (expense.categoryId !== undefined) updateData.category_id = expense.categoryId || null;
    if (expense.name !== undefined) updateData.name = expense.name;
    if (expense.value !== undefined) updateData.value = expense.value;
    if (expense.paymentMethod !== undefined) updateData.payment_method = expense.paymentMethod;
    if (expense.month !== undefined) updateData.month = expense.month;
    if (expense.year !== undefined) updateData.year = expense.year;
    if (expense.notes !== undefined) updateData.notes = expense.notes || null;

    const { error } = await supabase.from('expenses').update(updateData).eq('id', id);
    if (error) throw error;
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...expense } : e)));
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Subscriptions
  const addSubscription = async (subscription: Omit<Subscription, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        category_id: subscription.categoryId || null,
        name: subscription.name,
        value: subscription.value,
        billing_day: subscription.billingDay,
        active: subscription.active,
      })
      .select()
      .single();
    if (error) throw error;
    setSubscriptions((prev) => [
      ...prev,
      {
        id: data.id,
        name: data.name,
        value: Number(data.value),
        billingDay: data.billing_day,
        categoryId: data.category_id || '',
        active: data.active,
      },
    ]);
  };

  const updateSubscription = async (id: string, subscription: Partial<Subscription>) => {
    const updateData: Record<string, unknown> = {};
    if (subscription.name !== undefined) updateData.name = subscription.name;
    if (subscription.value !== undefined) updateData.value = subscription.value;
    if (subscription.billingDay !== undefined) updateData.billing_day = subscription.billingDay;
    if (subscription.categoryId !== undefined) updateData.category_id = subscription.categoryId || null;
    if (subscription.active !== undefined) updateData.active = subscription.active;

    const { error } = await supabase.from('subscriptions').update(updateData).eq('id', id);
    if (error) throw error;
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...subscription } : s)));
  };

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) throw error;
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSubscription = async (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (sub) await updateSubscription(id, { active: !sub.active });
  };

  // Installments
  const addInstallment = async (installment: Omit<InstallmentPurchase, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('installment_purchases')
      .insert({
        user_id: user.id,
        category_id: installment.categoryId || null,
        name: installment.name,
        total_value: installment.totalValue,
        installment_value: installment.installmentValue,
        total_installments: installment.totalInstallments,
        paid_installments: installment.paidInstallments,
        start_date: installment.startDate.toISOString().split('T')[0],
      })
      .select()
      .single();
    if (error) throw error;
    setInstallments((prev) => [
      ...prev,
      {
        id: data.id,
        name: data.name,
        totalValue: Number(data.total_value),
        installmentValue: Number(data.installment_value),
        totalInstallments: data.total_installments,
        paidInstallments: data.paid_installments,
        startDate: new Date(data.start_date),
        categoryId: data.category_id || '',
      },
    ]);
  };

  const updateInstallment = async (id: string, installment: Partial<InstallmentPurchase>) => {
    const updateData: Record<string, unknown> = {};
    if (installment.name !== undefined) updateData.name = installment.name;
    if (installment.totalValue !== undefined) updateData.total_value = installment.totalValue;
    if (installment.installmentValue !== undefined) updateData.installment_value = installment.installmentValue;
    if (installment.totalInstallments !== undefined) updateData.total_installments = installment.totalInstallments;
    if (installment.paidInstallments !== undefined) updateData.paid_installments = installment.paidInstallments;
    if (installment.startDate !== undefined) updateData.start_date = installment.startDate.toISOString().split('T')[0];
    if (installment.categoryId !== undefined) updateData.category_id = installment.categoryId || null;

    const { error } = await supabase.from('installment_purchases').update(updateData).eq('id', id);
    if (error) throw error;
    setInstallments((prev) => prev.map((i) => (i.id === id ? { ...i, ...installment } : i)));
  };

  const deleteInstallment = async (id: string) => {
    const { error } = await supabase.from('installment_purchases').delete().eq('id', id);
    if (error) throw error;
    setInstallments((prev) => prev.filter((i) => i.id !== id));
  };

  const payInstallment = async (id: string) => {
    const inst = installments.find((i) => i.id === id);
    if (inst && inst.paidInstallments < inst.totalInstallments) {
      await updateInstallment(id, { paidInstallments: inst.paidInstallments + 1 });
    }
  };

  // Fixed Expenses
  const addFixedExpense = async (fixedExpense: Omit<FixedExpense, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert({
        user_id: user.id,
        category_id: fixedExpense.categoryId || null,
        name: fixedExpense.name,
        value: fixedExpense.value,
        due_day: fixedExpense.dueDay,
        active: fixedExpense.active,
      })
      .select()
      .single();
    if (error) throw error;
    setFixedExpenses((prev) => [
      ...prev,
      {
        id: data.id,
        name: data.name,
        value: Number(data.value),
        dueDay: data.due_day,
        categoryId: data.category_id || '',
        active: data.active,
      },
    ]);
  };

  const updateFixedExpense = async (id: string, fixedExpense: Partial<FixedExpense>) => {
    const updateData: Record<string, unknown> = {};
    if (fixedExpense.name !== undefined) updateData.name = fixedExpense.name;
    if (fixedExpense.value !== undefined) updateData.value = fixedExpense.value;
    if (fixedExpense.dueDay !== undefined) updateData.due_day = fixedExpense.dueDay;
    if (fixedExpense.categoryId !== undefined) updateData.category_id = fixedExpense.categoryId || null;
    if (fixedExpense.active !== undefined) updateData.active = fixedExpense.active;

    const { error } = await supabase.from('fixed_expenses').update(updateData).eq('id', id);
    if (error) throw error;
    setFixedExpenses((prev) => prev.map((f) => (f.id === id ? { ...f, ...fixedExpense } : f)));
  };

  const deleteFixedExpense = async (id: string) => {
    const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
    if (error) throw error;
    setFixedExpenses((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleFixedExpense = async (id: string) => {
    const fixed = fixedExpenses.find((f) => f.id === id);
    if (fixed) await updateFixedExpense(id, { active: !fixed.active });
  };

  // Expense Categories
  const addExpenseCategory = async (category: Omit<ExpenseCategory, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('expense_categories')
      .insert({
        user_id: user.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
      })
      .select()
      .single();
    if (error) throw error;
    setExpenseCategories((prev) => [
      ...prev,
      { id: data.id, name: data.name, icon: data.icon, color: data.color },
    ]);
  };

  const value = useMemo(
    () => ({
      expenses,
      subscriptions,
      installments,
      fixedExpenses,
      expenseCategories,
      loading,
      addExpense,
      updateExpense,
      deleteExpense,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      toggleSubscription,
      addInstallment,
      updateInstallment,
      deleteInstallment,
      payInstallment,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      toggleFixedExpense,
      addExpenseCategory,
      refreshAll,
    }),
    [expenses, subscriptions, installments, fixedExpenses, expenseCategories, loading, refreshAll]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}
