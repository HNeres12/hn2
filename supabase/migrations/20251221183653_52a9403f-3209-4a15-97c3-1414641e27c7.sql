-- Tabela de tipos de ativos
CREATE TABLE public.asset_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'TrendingUp',
  color TEXT NOT NULL DEFAULT 'hsl(174, 72%, 46%)',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de investimentos
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  ticker TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  invested_value NUMERIC,
  current_value NUMERIC,
  currency TEXT NOT NULL DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD')),
  entity TEXT CHECK (entity IN ('pf', 'pj_operacional', 'holding', 'offshore', 'llc')),
  broker TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de categorias de despesas
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Circle',
  color TEXT NOT NULL DEFAULT 'hsl(174, 72%, 46%)',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de despesas
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card', 'debit', 'cash', 'pix')),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  billing_day INTEGER NOT NULL DEFAULT 1 CHECK (billing_day >= 1 AND billing_day <= 31),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de despesas fixas
CREATE TABLE public.fixed_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  due_day INTEGER NOT NULL DEFAULT 5 CHECK (due_day >= 1 AND due_day <= 31),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de compras parceladas
CREATE TABLE public.installment_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  total_value NUMERIC NOT NULL,
  installment_value NUMERIC NOT NULL,
  total_installments INTEGER NOT NULL,
  paid_installments INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies para asset_types
CREATE POLICY "Users can view own asset types" ON public.asset_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own asset types" ON public.asset_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own asset types" ON public.asset_types FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own asset types" ON public.asset_types FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para investments
CREATE POLICY "Users can view own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para expense_categories
CREATE POLICY "Users can view own expense categories" ON public.expense_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own expense categories" ON public.expense_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expense categories" ON public.expense_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expense categories" ON public.expense_categories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para expenses
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para fixed_expenses
CREATE POLICY "Users can view own fixed expenses" ON public.fixed_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fixed expenses" ON public.fixed_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fixed expenses" ON public.fixed_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fixed expenses" ON public.fixed_expenses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para installment_purchases
CREATE POLICY "Users can view own installment purchases" ON public.installment_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own installment purchases" ON public.installment_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own installment purchases" ON public.installment_purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own installment purchases" ON public.installment_purchases FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();