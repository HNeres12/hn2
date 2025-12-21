import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PatrimonyCard } from '@/components/dashboard/PatrimonyCard';
import { AssetTypeCard } from '@/components/dashboard/AssetTypeCard';
import { InvestmentCharts } from '@/components/dashboard/InvestmentCharts';
import { useInvestments } from '@/contexts/InvestmentContext';
import { useAssetTypes } from '@/contexts/AssetTypeContext';
import { useQuotes } from '@/hooks/useQuotes';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { investmentEntities, InvestmentEntity } from '@/types/finance';
import { isSelicLinkedInvestment, estimateSelicCurrentValue } from '@/lib/investmentValuation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function InvestmentDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<InvestmentEntity | 'all'>('all');
  const { investments } = useInvestments();
  const { assetTypes } = useAssetTypes();
  const { quotes, isLoading, fetchMultipleQuotes } = useQuotes();
  const { toast } = useToast();

  // Map asset type IDs to quote types
  const getQuoteRequestsForInvestments = () => {
    const requests: Array<{ type: 'crypto' | 'stock_us' | 'treasury' | 'dollar'; ticker?: string }> = [];

    // Always fetch dollar for USD conversions
    requests.push({ type: 'dollar' });

    investments.forEach((inv) => {
      const assetType = assetTypes.find((t) => t.id === inv.assetTypeId);
      if (!assetType) return;

      // Renda Fixa (Tesouro) — não depende de ticker
      if (assetType.name === 'Renda Fixa') {
        if (!requests.some((r) => r.type === 'treasury')) {
          requests.push({ type: 'treasury' });
        }
        return;
      }

      // Disponível (caixa): não depende de ticker/cotação
      if (assetType.name === 'Disponível') {
        return;
      }

      // Ativos sem ticker não precisam de cotação
      if (!inv.ticker) return;

      // Criptomoedas
      if (assetType.name === 'Criptomoedas') {
        requests.push({ type: 'crypto', ticker: inv.ticker });
        return;
      }

      // QUALQUER ativo em USD com ticker OU categoria "Ações EUA" busca cotação stock_us
      if (inv.currency === 'USD' || assetType.name === 'Ações EUA') {
        if (!requests.some((r) => r.type === 'stock_us' && r.ticker === inv.ticker)) {
          requests.push({ type: 'stock_us', ticker: inv.ticker });
        }
      }
    });

    return requests;
  };

  // Update investment values based on quotes
  const updatedInvestments = useMemo(() => {
    const dollarRate = quotes['USD']?.price || 5.5;
    const selicRate = quotes['SELIC']?.price;

    return investments.map((inv) => {
      const assetType = assetTypes.find((t) => t.id === inv.assetTypeId);
      if (!assetType) return inv;

      // Renda Fixa (Tesouro Selic): estima valor atual pelo SELIC
      if (
        assetType.name === 'Renda Fixa' &&
        selicRate !== undefined &&
        inv.investedValue !== undefined &&
        inv.investedValue > 0 &&
        isSelicLinkedInvestment(inv)
      ) {
        const createdAt = inv.createdAt instanceof Date ? inv.createdAt : new Date(inv.createdAt);
        const newCurrentValue = estimateSelicCurrentValue({
          investedValue: inv.investedValue,
          createdAt,
          selicRateAnnualPercent: selicRate,
        });

        return {
          ...inv,
          currentValue: newCurrentValue,
          updatedAt: new Date(),
        };
      }

      // Disponível (caixa): mantém valor original (em USD ou BRL conforme cadastro)
      if (assetType.name === 'Disponível') return inv;

      // Sem ticker: mantém valor original
      if (!inv.ticker) return inv;

      const ticker = inv.ticker.toUpperCase();
      const key =
        (inv.currency === 'USD' || assetType.name === 'Ações EUA') && ticker === 'USD'
          ? 'stock_us:USD'
          : ticker;

      const quote = quotes[key];
      if (!quote) return inv;

      let newCurrentValue = inv.currentValue;

      // Criptomoedas: cotação vem em BRL
      if (assetType.name === 'Criptomoedas') {
        newCurrentValue = inv.quantity * quote.price;
      }
      // QUALQUER ativo em USD com ticker: cotação vem em USD
      else if (inv.currency === 'USD' || assetType.name === 'Ações EUA') {
        newCurrentValue = inv.quantity * quote.price;
      }

      return {
        ...inv,
        currentValue: newCurrentValue,
        updatedAt: new Date(),
      };
    });
  }, [investments, quotes]);

  // Filter investments by entity
  const filteredInvestments = useMemo(() => {
    if (selectedEntity === 'all') return updatedInvestments;
    return updatedInvestments.filter((inv) => inv.entity === selectedEntity);
  }, [updatedInvestments, selectedEntity]);

  // Get unique entities from investments
  const availableEntities = useMemo(() => {
    const entities = new Set<InvestmentEntity>();
    investments.forEach((inv) => {
      if (inv.entity) entities.add(inv.entity);
    });
    return Array.from(entities);
  }, [investments]);

  // Get dollar rate for USD to BRL conversion in totals
  const dollarRateForTotals = quotes['USD']?.price || 5.5;
  
  const totalInvested = filteredInvestments.reduce((sum, inv) => {
    const value = inv.investedValue || 0;
    return sum + (inv.currency === 'USD' ? value * dollarRateForTotals : value);
  }, 0);
  
  const totalCurrent = filteredInvestments.reduce((sum, inv) => {
    const value = inv.currentValue || 0;
    return sum + (inv.currency === 'USD' ? value * dollarRateForTotals : value);
  }, 0);
  
  const variation = totalCurrent - totalInvested;
  const variationPercent = totalInvested > 0 ? (variation / totalInvested) * 100 : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const requests = getQuoteRequestsForInvestments();
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
    const requests = getQuoteRequestsForInvestments();
    if (requests.length > 0) {
      fetchMultipleQuotes(requests).then(() => {
        setLastUpdate(new Date());
      });
    }
  }, [investments]);

  const investmentsByType = assetTypes.map((type) => ({
    ...type,
    investments: filteredInvestments.filter((inv) => inv.assetTypeId === type.id),
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
          <div className="flex items-center gap-3">
            {availableEntities.length > 0 && (
              <Select value={selectedEntity} onValueChange={(value: InvestmentEntity | 'all') => setSelectedEntity(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as entidades</SelectItem>
                  {investmentEntities
                    .filter((ent) => availableEntities.includes(ent.value))
                    .map((ent) => (
                      <SelectItem key={ent.value} value={ent.value}>
                        {ent.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
            {lastUpdate && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3" />
                Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
              </Badge>
            )}
          </div>
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

        {/* Investment Charts */}
        <InvestmentCharts investments={filteredInvestments} dollarRate={dollarRateForTotals} />

        <div>
          <h2 className="text-xl font-semibold mb-4">Ativos por Categoria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {investmentsByType.map((type, index) => (
              <AssetTypeCard
                key={type.id}
                assetType={type}
                investments={type.investments}
                index={index}
                dollarRate={dollarRateForTotals}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
