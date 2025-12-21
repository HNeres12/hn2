export interface AssetType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type InvestmentEntity = 'pf' | 'pj_operacional' | 'holding' | 'offshore' | 'llc';

export const investmentEntities: { value: InvestmentEntity; label: string }[] = [
  { value: 'pf', label: 'Pessoa Física' },
  { value: 'pj_operacional', label: 'CNPJ Operacional' },
  { value: 'holding', label: 'Holding Patrimonial' },
  { value: 'offshore', label: 'Offshore' },
  { value: 'llc', label: 'LLC' },
];

export interface Investment {
  id: string;
  assetTypeId: string;
  name: string;
  ticker?: string;
  quantity: number;
  investedValue?: number; // Opcional para investimentos antigos sem valor conhecido
  currentValue?: number; // Opcional - calculado automaticamente quando há cotação
  currency: 'BRL' | 'USD';
  entity?: InvestmentEntity;
  broker?: string; // Corretora/local onde o ativo está investido
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

export interface FixedExpense {
  id: string;
  name: string;
  value: number;
  dueDay: number;
  categoryId: string;
  active: boolean;
}

export interface MonthlyOverview {
  month: string;
  year: number;
  totalExpenses: number;
  totalCard: number;
  totalInstallments: number;
  byCategory: Record<string, number>;
}
