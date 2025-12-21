import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Investment } from '@/types/finance';
import { investments as mockInvestments } from '@/data/mockData';

interface InvestmentContextType {
  investments: Investment[];
  addInvestment: (investment: Investment) => void;
  updateInvestment: (id: string, investment: Investment) => void;
  deleteInvestment: (id: string) => void;
  resetInvestments: () => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

const INVESTMENTS_STORAGE_KEY = 'investments_v1';

function reviveInvestments(raw: unknown): Investment[] | null {
  if (!Array.isArray(raw)) return null;

  try {
    return raw.map((inv: any) => ({
      ...inv,
      createdAt: new Date(inv.createdAt),
      updatedAt: new Date(inv.updatedAt),
    })) as Investment[];
  } catch {
    return null;
  }
}

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const saved = localStorage.getItem(INVESTMENTS_STORAGE_KEY);
      if (saved) {
        const revived = reviveInvestments(JSON.parse(saved));
        if (revived) return revived;
      }
    } catch {
      // ignore
    }

    return mockInvestments;
  });

  useEffect(() => {
    try {
      localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(investments));
    } catch {
      // ignore
    }
  }, [investments]);

  const addInvestment = (investment: Investment) => {
    setInvestments((prev) => [...prev, investment]);
  };

  const updateInvestment = (id: string, investment: Investment) => {
    setInvestments((prev) => prev.map((inv) => (inv.id === id ? investment : inv)));
  };

  const deleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  const resetInvestments = () => {
    setInvestments(mockInvestments);
  };

  const value = useMemo(
    () => ({ investments, addInvestment, updateInvestment, deleteInvestment, resetInvestments }),
    [investments]
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

