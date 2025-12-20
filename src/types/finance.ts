export interface AssetType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Investment {
  id: string;
  assetTypeId: string;
  name: string;
  ticker?: string;
  quantity: number;
  investedValue: number;
  currentValue: number;
  currency: 'BRL' | 'USD';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  name: string;
  value: number;
  paymentMethod: 'card' | 'debit' | 'cash' | 'pix';
  date: Date;
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  value: number;
  billingDay: number;
  categoryId: string;
  active: boolean;
}

export interface InstallmentPurchase {
  id: string;
  name: string;
  totalValue: number;
  installmentValue: number;
  totalInstallments: number;
  paidInstallments: number;
  startDate: Date;
  categoryId: string;
}

export interface MonthlyOverview {
  month: string;
  year: number;
  totalExpenses: number;
  totalCard: number;
  totalInstallments: number;
  byCategory: Record<string, number>;
}
