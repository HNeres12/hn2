import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Investment, AssetType } from '@/types/finance';
import { getIcon } from '@/lib/iconUtils';

interface AssetTypeCardProps {
  assetType: AssetType;
  investments: Investment[];
  index: number;
  dollarRate?: number;
}

export function AssetTypeCard({ assetType, investments, index, dollarRate = 5.5 }: AssetTypeCardProps) {
  // Helpers
  const toBRL = (value: number, currency?: string) => (currency === 'USD' ? value * dollarRate : value);

  const usdInvestments = investments.filter((inv) => inv.currency === 'USD');
  const brlInvestments = investments.filter((inv) => inv.currency !== 'USD');
  const isUsdOnly = usdInvestments.length > 0 && brlInvestments.length === 0;

  // Totals
  const totalInvestedUSD = usdInvestments.reduce((sum, inv) => sum + (inv.investedValue || 0), 0);
  const totalCurrentUSD = usdInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);

  const totalInvestedBRL = investments.reduce((sum, inv) => sum + toBRL(inv.investedValue || 0, inv.currency), 0);
  const totalCurrentBRL = investments.reduce((sum, inv) => sum + toBRL(inv.currentValue || 0, inv.currency), 0);

  const variation = totalCurrentBRL - totalInvestedBRL;
  const variationPercent = totalInvestedBRL > 0 ? (variation / totalInvestedBRL) * 100 : 0;
  const isPositive = variation >= 0;
  const hasInvestedData = totalInvestedBRL > 0;

  const IconComponent = getIcon(assetType.icon);

  return (
    <div className="stat-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${assetType.color}20` }}
        >
          <IconComponent className="w-5 h-5" style={{ color: assetType.color }} />
        </div>
        <div>
          <h3 className="font-semibold">{assetType.name}</h3>
          <p className="text-xs text-muted-foreground">{investments.length} ativo(s)</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Valor Atual</p>

          {isUsdOnly ? (
            <>
              <p className="font-mono text-xl font-semibold">
                $ {totalCurrentUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                ≈ R$ {totalCurrentBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-xl font-semibold">
                R$ {totalCurrentBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {usdInvestments.length > 0 && (
                <p className="font-mono text-xs text-muted-foreground">
                  Parte USD: $ {totalCurrentUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Investido</p>
            {hasInvestedData ? (
              isUsdOnly ? (
                <>
                  <p className="font-mono text-sm">
                    $ {totalInvestedUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    ≈ R$ {totalInvestedBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-sm">
                    R$ {totalInvestedBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {usdInvestments.length > 0 && (
                    <p className="font-mono text-xs text-muted-foreground">
                      Parte USD: $ {totalInvestedUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </>
              )
            ) : (
              <p className="text-xs text-muted-foreground">Não informado</p>
            )}
          </div>

          {hasInvestedData && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={cn('font-mono text-sm', isPositive ? 'number-positive' : 'number-negative')}>
                {isPositive ? '+' : ''}
                {variationPercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {investments.map((inv) => {
            const isUSD = inv.currency === 'USD';
            const valueBRL = isUSD && inv.currentValue !== undefined ? inv.currentValue * dollarRate : null;

            return (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[100px]">{inv.ticker || inv.name}</span>

                <div className="text-right">
                  {isUSD ? (
                    <>
                      <span className="font-mono">
                        {inv.currentValue !== undefined
                          ? `$ ${inv.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </span>
                      {valueBRL !== null && (
                        <span className="font-mono text-xs text-muted-foreground block">
                          ≈ R$ {valueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-mono">
                      {inv.currentValue !== undefined
                        ? `R$ ${inv.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '-'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

