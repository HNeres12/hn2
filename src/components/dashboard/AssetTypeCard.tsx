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

type CurrencyView = 'BRL' | 'USD';

export function AssetTypeCard({ assetType, investments, index, dollarRate = 5.5 }: AssetTypeCardProps) {
  // Usa apenas o campo `currency` oficial para determinar a moeda
  // Não tenta "adivinhar" USD pelo nome/ticker
  const getMoney = (inv: Investment) => {
    const investedRaw = inv.investedValue ?? 0;
    const currentRaw = inv.currentValue ?? 0;

    const isDeclaredUsd = inv.currency === 'USD';
    const view: CurrencyView = isDeclaredUsd ? 'USD' : 'BRL';

    if (isDeclaredUsd) {
      const investedUSD = investedRaw;
      const currentUSD = currentRaw;
      return {
        view,
        investedUSD,
        currentUSD,
        investedBRL: investedUSD * dollarRate,
        currentBRL: currentUSD * dollarRate,
      };
    }

    return {
      view,
      investedBRL: investedRaw,
      currentBRL: currentRaw,
      investedUSD: 0,
      currentUSD: 0,
    };
  };

  const rows = investments.map((inv) => ({ inv, money: getMoney(inv) }));

  const usdRows = rows.filter((r) => r.money.view === 'USD');
  const brlRows = rows.filter((r) => r.money.view === 'BRL');
  const isUsdOnly = usdRows.length > 0 && brlRows.length === 0;

  const totalInvestedUSD = usdRows.reduce((sum, r) => sum + (r.money.investedUSD || 0), 0);
  const totalCurrentUSD = usdRows.reduce((sum, r) => sum + (r.money.currentUSD || 0), 0);

  const totalInvestedBRL = rows.reduce((sum, r) => sum + (r.money.investedBRL || 0), 0);
  const totalCurrentBRL = rows.reduce((sum, r) => sum + (r.money.currentBRL || 0), 0);

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
              {usdRows.length > 0 && (
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
                  {usdRows.length > 0 && (
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
          {rows.map(({ inv, money }) => {
            const label = inv.ticker || inv.name;

            if (money.view === 'USD') {
              const usd = inv.currency === 'USD' ? (inv.currentValue ?? 0) : money.currentUSD;
              const brl = money.currentBRL;

              return (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[100px]">{label}</span>
                  <div className="text-right">
                    <span className="font-mono">
                      $ {usd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground block">
                      ≈ R$ {brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[100px]">{label}</span>
                <div className="text-right">
                  <span className="font-mono">
                    {inv.currentValue !== undefined
                      ? `R$ ${inv.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

