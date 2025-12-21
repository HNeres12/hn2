import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Investment, investmentEntities } from '@/types/finance';
import { useAssetTypes } from '@/contexts/AssetTypeContext';

interface InvestmentChartsProps {
  investments: Investment[];
}

export function InvestmentCharts({ investments }: InvestmentChartsProps) {
  const { assetTypes } = useAssetTypes();

  // Chart by asset type
  const typeChartData = useMemo(() => {
    const byType: Record<string, { name: string; value: number; color: string }> = {};
    
    investments.forEach((inv) => {
      const assetType = assetTypes.find((t) => t.id === inv.assetTypeId);
      if (assetType) {
        if (!byType[assetType.id]) {
          byType[assetType.id] = {
            name: assetType.name,
            value: 0,
            color: assetType.color,
          };
        }
        byType[assetType.id].value += inv.currentValue || 0;
      }
    });

    return Object.values(byType).sort((a, b) => b.value - a.value);
  }, [investments, assetTypes]);

  // Chart by entity
  const entityChartData = useMemo(() => {
    const byEntity: Record<string, { name: string; value: number; color: string }> = {};
    
    const entityColors: Record<string, string> = {
      'pf': 'hsl(262, 83%, 58%)',
      'pj_operacional': 'hsl(174, 72%, 46%)',
      'holding': 'hsl(38, 92%, 50%)',
      'offshore': 'hsl(142, 72%, 46%)',
      'llc': 'hsl(200, 72%, 46%)',
    };
    
    investments.forEach((inv) => {
      const entity = inv.entity || 'sem_entidade';
      const entityLabel = inv.entity 
        ? investmentEntities.find((e) => e.value === inv.entity)?.label || entity
        : 'Sem Entidade';
      
      if (!byEntity[entity]) {
        byEntity[entity] = {
          name: entityLabel,
          value: 0,
          color: entityColors[entity] || 'hsl(var(--muted))',
        };
      }
      byEntity[entity].value += inv.currentValue;
    });

    return Object.values(byEntity).sort((a, b) => b.value - a.value);
  }, [investments]);

  const totalValue = useMemo(() => {
    return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  }, [investments]);

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
    return `${percent.toFixed(1)}%`;
  };

  if (investments.length === 0) {
    return (
      <div className="stat-card text-center py-8">
        <p className="text-muted-foreground">Nenhum investimento para exibir</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart by Asset Type */}
      <div className="stat-card animate-fade-in">
        <h3 className="font-semibold mb-2">Distribuição por Tipo de Ativo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Patrimônio total: <span className="font-mono font-semibold text-foreground">{formatValue(totalValue)}</span>
        </p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {typeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatValue(value), '']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string, entry: any) => (
                  <span className="text-sm text-muted-foreground">
                    {value} ({formatPercent(entry.payload.value)})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart by Entity */}
      {entityChartData.length > 0 && (
        <div className="stat-card animate-fade-in">
          <h3 className="font-semibold mb-2">Distribuição por Entidade</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Alocação entre estruturas jurídicas
          </p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={entityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {entityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatValue(value), '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string, entry: any) => (
                    <span className="text-sm text-muted-foreground">
                      {value} ({formatPercent(entry.payload.value)})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
