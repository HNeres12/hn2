import { createContext, useContext, useState, ReactNode } from 'react';
import { Investment } from '@/types/finance';
import { investments as mockInvestments } from '@/data/mockData';

interface InvestmentContextType {
  investments: Investment[];
  addInvestment: (investment: Investment) => void;
  updateInvestment: (id: string, investment: Investment) => void;
  deleteInvestment: (id: string) => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);

  const addInvestment = (investment: Investment) => {
    setInvestments((prev) => [...prev, investment]);
  };

  const updateInvestment = (id: string, investment: Investment) => {
    setInvestments((prev) => prev.map((inv) => (inv.id === id ? investment : inv)));
  };

  const deleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  return (
    <InvestmentContext.Provider value={{ investments, addInvestment, updateInvestment, deleteInvestment }}>
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestments() {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestments must be used within InvestmentProvider');
  }
  return context;
}
