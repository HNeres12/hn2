import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PatrimonyCard } from '@/components/dashboard/PatrimonyCard';
import { AssetTypeCard } from '@/components/dashboard/AssetTypeCard';
import { investments as mockInvestments, assetTypes } from '@/data/mockData';

export default function InvestmentDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [investments] = useState(mockInvestments);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedValue, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const variation = totalCurrent - totalInvested;
  const variationPercent = totalInvested > 0 ? (variation / totalInvested) * 100 : 0;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const investmentsByType = assetTypes.map((type) => ({
    ...type,
    investments: investments.filter((inv) => inv.assetTypeId === type.id),
  })).filter((type) => type.investments.length > 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Investimentos</h1>
          <p className="text-muted-foreground">
            Acompanhe seu patrimônio e a performance dos seus ativos
          </p>
        </div>

        <PatrimonyCard
          totalValue={totalCurrent}
          totalInvested={totalInvested}
          variation={variation}
          variationPercent={variationPercent}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

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
