import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PatrimonyCard } from '@/components/dashboard/PatrimonyCard';
import { AssetTypeCard } from '@/components/dashboard/AssetTypeCard';
import { investments as mockInvestments, assetTypes } from '@/data/mockData';
import { useQuotes } from '@/hooks/useQuotes';
import { useToast } from '@/hooks/use-toast';
import { Investment } from '@/types/finance';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export default function InvestmentDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { quotes, isLoading, fetchMultipleQuotes, fetchDollarQuote } = useQuotes();
  const { toast } = useToast();

  // Map asset type IDs to quote types
  const getQuoteRequestsForInvestments = (invs: Investment[]) => {
    const requests: Array<{ type: 'crypto' | 'stock_us' | 'treasury' | 'dollar'; ticker?: string }> = [];
    
    // Always fetch dollar for USD conversions
    requests.push({ type: 'dollar' });

    invs.forEach((inv) => {
      const assetType = assetTypes.find((t) => t.id === inv.assetTypeId);
      if (!assetType || !inv.ticker) return;

      // Criptomoedas
      if (assetType.name === 'Criptomoedas') {
        requests.push({ type: 'crypto', ticker: inv.ticker });
      }
      // Ações EUA
      else if (assetType.name === 'Ações EUA') {
        requests.push({ type: 'stock_us', ticker: inv.ticker });
      }
      // Renda Fixa (Tesouro)
      else if (assetType.name === 'Renda Fixa') {
        if (!requests.some((r) => r.type === 'treasury')) {
          requests.push({ type: 'treasury' });
        }
      }
    });

    return requests;
  };

  // Update investment values based on quotes
  const updatedInvestments = useMemo(() => {
    if (Object.keys(quotes).length === 0) return investments;

    const dollarRate = quotes['USD']?.price || 5.5; // Fallback to approximate rate

    return investments.map((inv) => {
      const assetType = assetTypes.find((t) => t.id === inv.assetTypeId);
      if (!assetType || !inv.ticker) return inv;

      const quote = quotes[inv.ticker.toUpperCase()];
      if (!quote) return inv;

      let newCurrentValue = inv.currentValue;

      if (assetType.name === 'Criptomoedas') {
        // Crypto quotes come in BRL
        newCurrentValue = inv.quantity * quote.price;
      } else if (assetType.name === 'Ações EUA') {
        // US stocks come in USD, convert to BRL
        newCurrentValue = inv.quantity * quote.price * dollarRate;
      }

      return {
        ...inv,
        currentValue: newCurrentValue,
        updatedAt: new Date(),
      };
    });
  }, [investments, quotes]);

  const totalInvested = updatedInvestments.reduce((sum, inv) => sum + inv.investedValue, 0);
  const totalCurrent = updatedInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const variation = totalCurrent - totalInvested;
  const variationPercent = totalInvested > 0 ? (variation / totalInvested) * 100 : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const requests = getQuoteRequestsForInvestments(investments);
      await fetchMultipleQuotes(requests);
      setLastUpdate(new Date());
      
      toast({
        title: 'Cotações atualizadas',
        description: 'Os valores foram atualizados com sucesso.',
      });
    } catch (error) {
      console.error('Error refreshing quotes:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-fetch quotes on mount
  useEffect(() => {
    const requests = getQuoteRequestsForInvestments(mockInvestments);
    if (requests.length > 0) {
      fetchMultipleQuotes(requests).then(() => {
        setLastUpdate(new Date());
      });
    }
  }, []);

  const investmentsByType = assetTypes.map((type) => ({
    ...type,
    investments: updatedInvestments.filter((inv) => inv.assetTypeId === type.id),
  })).filter((type) => type.investments.length > 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard de Investimentos</h1>
            <p className="text-muted-foreground">
              Acompanhe seu patrimônio e a performance dos seus ativos
            </p>
          </div>
          {lastUpdate && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3" />
              Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
            </Badge>
          )}
        </div>

        <PatrimonyCard
          totalValue={totalCurrent}
          totalInvested={totalInvested}
          variation={variation}
          variationPercent={variationPercent}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || isLoading}
        />

        {/* Quote status badges */}
        {Object.keys(quotes).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(quotes).map(([ticker, quote]) => (
              <Badge key={ticker} variant="secondary" className="font-mono text-xs">
                {ticker}: {quote.currency === 'BRL' ? 'R$' : '$'} {quote.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Badge>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Ativos por Categoria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {investmentsByType.map((type, index) => (
              <AssetTypeCard
                key={type.id}
                assetType={type}
                investments={type.investments}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
