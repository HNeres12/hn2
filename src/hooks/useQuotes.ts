import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Quote {
  ticker: string;
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
}

type QuoteType = 'crypto' | 'stock_us' | 'treasury' | 'dollar';

export function useQuotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const { toast } = useToast();

  const fetchQuote = useCallback(async (type: QuoteType, ticker?: string): Promise<Quote | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-quotes', {
        body: { type, ticker },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const quote = data as Quote;
      setQuotes((prev) => ({
        ...prev,
        [quote.ticker]: quote,
      }));

      return quote;
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      toast({
        title: 'Erro ao buscar cotação',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const fetchMultipleQuotes = useCallback(async (
    requests: Array<{ type: QuoteType; ticker?: string }>
  ) => {
    setIsLoading(true);
    
    try {
      const results = await Promise.allSettled(
        requests.map(({ type, ticker }) => fetchQuote(type, ticker))
      );

      const successful = results.filter(
        (r): r is PromiseFulfilledResult<Quote | null> => r.status === 'fulfilled' && r.value !== null
      );

      console.log(`Fetched ${successful.length}/${requests.length} quotes successfully`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchQuote]);

  const fetchDollarQuote = useCallback(() => fetchQuote('dollar'), [fetchQuote]);
  const fetchCryptoQuote = useCallback((ticker: string) => fetchQuote('crypto', ticker), [fetchQuote]);
  const fetchUSStockQuote = useCallback((ticker: string) => fetchQuote('stock_us', ticker), [fetchQuote]);
  const fetchTreasuryQuote = useCallback(() => fetchQuote('treasury'), [fetchQuote]);

  return {
    quotes,
    isLoading,
    fetchQuote,
    fetchMultipleQuotes,
    fetchDollarQuote,
    fetchCryptoQuote,
    fetchUSStockQuote,
    fetchTreasuryQuote,
  };
}
