import { createContext, useContext, useState, ReactNode } from 'react';
import { Expense, Subscription, InstallmentPurchase, FixedExpense } from '@/types/finance';
import { 
  expenses as mockExpenses, 
  subscriptions as mockSubscriptions, 
  installmentPurchases as mockInstallments 
} from '@/data/mockData';

interface ExpenseContextType {
  expenses: Expense[];
  subscriptions: Subscription[];
  installments: InstallmentPurchase[];
  fixedExpenses: FixedExpense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, subscription: Subscription) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscription: (id: string) => void;
  addInstallment: (installment: InstallmentPurchase) => void;
  updateInstallment: (id: string, installment: InstallmentPurchase) => void;
  deleteInstallment: (id: string) => void;
  payInstallment: (id: string) => void;
  addFixedExpense: (fixedExpense: FixedExpense) => void;
  updateFixedExpense: (id: string, fixedExpense: FixedExpense) => void;
  deleteFixedExpense: (id: string) => void;
  toggleFixedExpense: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const mockFixedExpenses: FixedExpense[] = [
  { id: '1', name: 'Aluguel', value: 2500, dueDay: 5, categoryId: '1', active: true },
  { id: '2', name: 'Condomínio', value: 850, dueDay: 10, categoryId: '1', active: true },
  { id: '3', name: 'Internet', value: 150, dueDay: 15, categoryId: '1', active: true },
];

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [installments, setInstallments] = useState<InstallmentPurchase[]>(mockInstallments);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(mockFixedExpenses);

  // Expenses
  const addExpense = (expense: Expense) => setExpenses((prev) => [...prev, expense]);
  const updateExpense = (id: string, expense: Expense) => 
    setExpenses((prev) => prev.map((e) => (e.id === id ? expense : e)));
  const deleteExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));

  // Subscriptions
  const addSubscription = (subscription: Subscription) => 
    setSubscriptions((prev) => [...prev, subscription]);
  const updateSubscription = (id: string, subscription: Subscription) => 
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? subscription : s)));
  const deleteSubscription = (id: string) => 
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  const toggleSubscription = (id: string) => 
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));

  // Installments
  const addInstallment = (installment: InstallmentPurchase) => 
    setInstallments((prev) => [...prev, installment]);
  const updateInstallment = (id: string, installment: InstallmentPurchase) => 
    setInstallments((prev) => prev.map((i) => (i.id === id ? installment : i)));
  const deleteInstallment = (id: string) => 
    setInstallments((prev) => prev.filter((i) => i.id !== id));
  const payInstallment = (id: string) => 
    setInstallments((prev) => prev.map((i) => {
      if (i.id === id && i.paidInstallments < i.totalInstallments) {
        return { ...i, paidInstallments: i.paidInstallments + 1 };
      }
      return i;
    }));

  // Fixed Expenses
  const addFixedExpense = (fixedExpense: FixedExpense) => 
    setFixedExpenses((prev) => [...prev, fixedExpense]);
  const updateFixedExpense = (id: string, fixedExpense: FixedExpense) => 
    setFixedExpenses((prev) => prev.map((f) => (f.id === id ? fixedExpense : f)));
  const deleteFixedExpense = (id: string) => 
    setFixedExpenses((prev) => prev.filter((f) => f.id !== id));
  const toggleFixedExpense = (id: string) => 
    setFixedExpenses((prev) => prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));

  return (
    <ExpenseContext.Provider value={{
      expenses, subscriptions, installments, fixedExpenses,
      addExpense, updateExpense, deleteExpense,
      addSubscription, updateSubscription, deleteSubscription, toggleSubscription,
      addInstallment, updateInstallment, deleteInstallment, payInstallment,
      addFixedExpense, updateFixedExpense, deleteFixedExpense, toggleFixedExpense,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}
