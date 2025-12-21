import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { AssetType } from '@/types/finance';
import { assetTypes as defaultAssetTypes } from '@/data/mockData';

interface AssetTypeContextType {
  assetTypes: AssetType[];
  addAssetType: (assetType: AssetType) => void;
  updateAssetType: (id: string, assetType: AssetType) => void;
  deleteAssetType: (id: string) => void;
}

const AssetTypeContext = createContext<AssetTypeContextType | undefined>(undefined);

const ASSET_TYPES_STORAGE_KEY = 'asset_types_v1';

export function AssetTypeProvider({ children }: { children: ReactNode }) {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(() => {
    try {
      const saved = localStorage.getItem(ASSET_TYPES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return defaultAssetTypes;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ASSET_TYPES_STORAGE_KEY, JSON.stringify(assetTypes));
    } catch {
      // ignore
    }
  }, [assetTypes]);

  const addAssetType = (assetType: AssetType) => {
    setAssetTypes((prev) => [...prev, assetType]);
  };

  const updateAssetType = (id: string, assetType: AssetType) => {
    setAssetTypes((prev) => prev.map((at) => (at.id === id ? assetType : at)));
  };

  const deleteAssetType = (id: string) => {
    setAssetTypes((prev) => prev.filter((at) => at.id !== id));
  };

  const value = useMemo(
    () => ({ assetTypes, addAssetType, updateAssetType, deleteAssetType }),
    [assetTypes]
  );

  return <AssetTypeContext.Provider value={value}>{children}</AssetTypeContext.Provider>;
}

export function useAssetTypes() {
  const context = useContext(AssetTypeContext);
  if (!context) {
    throw new Error('useAssetTypes must be used within AssetTypeProvider');
  }
  return context;
}
