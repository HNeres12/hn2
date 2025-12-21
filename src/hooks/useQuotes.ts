import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Quote {
  ticker: string;
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
  isEstimate?: boolean;
}

type QuoteType = 'crypto' | 'stock_us' | 'treasury' | 'dollar';

type QuoteCache = Record<string, Quote>;
const QUOTES_CACHE_KEY = 'quotes_cache_v1';

function readQuoteCache(): QuoteCache {
  try {
    const raw = localStorage.getItem(QUOTES_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as QuoteCache;
  } catch {
    return {};
  }
}

function writeQuoteCache(cache: QuoteCache) {
  try {
    localStorage.setItem(QUOTES_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

function shouldUseCachedQuote(quote: Quote, cached?: Quote) {
  // O fallback atual do backend para stocks EUA usa $100 quando a API é rate-limited.
  // Para evitar oscilação, se vier $100 estimado e existir um valor anterior diferente, usamos o cache.
  const isSuspiciousUsd100 =
    quote.currency === 'USD' &&
    quote.price === 100 &&
    quote.isEstimate === true &&
    quote.source?.toLowerCase().includes('fallback');

  if (!isSuspiciousUsd100) return false;
  if (!cached) return false;
  if (cached.currency !== 'USD') return false;
  if (!Number.isFinite(cached.price) || cached.price <= 0) return false;
  if (cached.price === 100) return false;
  return true;
}

export function useQuotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const { toast } = useToast();

  const fetchQuote = useCallback(
    async (type: QuoteType, ticker?: string): Promise<Quote | null> => {
      try {
        const { data, error } = await supabase.functions.invoke('get-quotes', {
          body: { type, ticker },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        const incoming = data as Quote;

        const cache = readQuoteCache();
        const cached = cache[incoming.ticker];

        const effective: Quote = shouldUseCachedQuote(incoming, cached)
          ? {
              ...cached,
              // mantém o horário "agora" pra UI não parecer travada
              updatedAt: incoming.updatedAt,
              source: `${cached.source} (última válida)` ,
            }
          : incoming;

        // Atualiza cache sempre que recebemos um valor "bom".
        // (Evita gravar o fallback $100 por cima de um valor real.)
        const isUsd100Estimate =
          incoming.currency === 'USD' && incoming.price === 100 && incoming.isEstimate === true;

        if (!isUsd100Estimate) {
          cache[incoming.ticker] = incoming;
          writeQuoteCache(cache);
        }

        setQuotes((prev) => ({
          ...prev,
          [effective.ticker]: effective,
        }));

        return effective;
      } catch (error: any) {
        console.error('Error fetching quote:', error);
        toast({
          title: 'Erro ao buscar cotação',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const fetchMultipleQuotes = useCallback(
    async (requests: Array<{ type: QuoteType; ticker?: string }>) => {
      setIsLoading(true);

      try {
        const results = await Promise.allSettled(requests.map(({ type, ticker }) => fetchQuote(type, ticker)));

        const successful = results.filter(
          (r): r is PromiseFulfilledResult<Quote | null> => r.status === 'fulfilled' && r.value !== null
        );

        console.log(`Fetched ${successful.length}/${requests.length} quotes successfully`);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchQuote]
  );

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

