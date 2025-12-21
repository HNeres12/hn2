import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
import { Investment } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface InvestmentContextType {
  investments: Investment[];
  loading: boolean;
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  refreshInvestments: () => Promise<void>;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshInvestments = useCallback(async () => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setInvestments(
        (data || []).map((item) => ({
          id: item.id,
          assetTypeId: item.asset_type_id || '',
          name: item.name,
          ticker: item.ticker || undefined,
          quantity: Number(item.quantity),
          investedValue: item.invested_value ? Number(item.invested_value) : undefined,
          currentValue: item.current_value ? Number(item.current_value) : undefined,
          currency: item.currency as 'BRL' | 'USD',
          entity: item.entity as Investment['entity'],
          broker: item.broker || undefined,
          notes: item.notes || undefined,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        }))
      );
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshInvestments();
  }, [refreshInvestments]);

  const addInvestment = async (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('investments')
      .insert({
        user_id: user.id,
        asset_type_id: investment.assetTypeId || null,
        name: investment.name,
        ticker: investment.ticker || null,
        quantity: investment.quantity,
        invested_value: investment.investedValue || null,
        current_value: investment.currentValue || null,
        currency: investment.currency,
        entity: investment.entity || null,
        broker: investment.broker || null,
        notes: investment.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    setInvestments((prev) => [
      ...prev,
      {
        id: data.id,
        assetTypeId: data.asset_type_id || '',
        name: data.name,
        ticker: data.ticker || undefined,
        quantity: Number(data.quantity),
        investedValue: data.invested_value ? Number(data.invested_value) : undefined,
        currentValue: data.current_value ? Number(data.current_value) : undefined,
        currency: data.currency as 'BRL' | 'USD',
        entity: data.entity as Investment['entity'],
        broker: data.broker || undefined,
        notes: data.notes || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
    ]);
  };

  const updateInvestment = async (id: string, investment: Partial<Investment>) => {
    const updateData: Record<string, unknown> = {};
    
    if (investment.assetTypeId !== undefined) updateData.asset_type_id = investment.assetTypeId || null;
    if (investment.name !== undefined) updateData.name = investment.name;
    if (investment.ticker !== undefined) updateData.ticker = investment.ticker || null;
    if (investment.quantity !== undefined) updateData.quantity = investment.quantity;
    if (investment.investedValue !== undefined) updateData.invested_value = investment.investedValue || null;
    if (investment.currentValue !== undefined) updateData.current_value = investment.currentValue || null;
    if (investment.currency !== undefined) updateData.currency = investment.currency;
    if (investment.entity !== undefined) updateData.entity = investment.entity || null;
    if (investment.broker !== undefined) updateData.broker = investment.broker || null;
    if (investment.notes !== undefined) updateData.notes = investment.notes || null;

    const { error } = await supabase
      .from('investments')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...investment, updatedAt: new Date() } : inv))
    );
  };

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id);

    if (error) throw error;

    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  const value = useMemo(
    () => ({ investments, loading, addInvestment, updateInvestment, deleteInvestment, refreshInvestments }),
    [investments, loading, refreshInvestments]
  );

  return <InvestmentContext.Provider value={value}>{children}</InvestmentContext.Provider>;
}

export function useInvestments() {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestments must be used within InvestmentProvider');
  }
  return context;
}
