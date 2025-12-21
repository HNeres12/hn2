import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
import { AssetType } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface AssetTypeContextType {
  assetTypes: AssetType[];
  loading: boolean;
  addAssetType: (assetType: Omit<AssetType, 'id'>) => Promise<void>;
  updateAssetType: (id: string, assetType: Partial<AssetType>) => Promise<void>;
  deleteAssetType: (id: string) => Promise<void>;
  refreshAssetTypes: () => Promise<void>;
}

const AssetTypeContext = createContext<AssetTypeContextType | undefined>(undefined);

export function AssetTypeProvider({ children }: { children: ReactNode }) {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshAssetTypes = useCallback(async () => {
    if (!user) {
      setAssetTypes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('asset_types')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setAssetTypes(
        (data || []).map((item) => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
          color: item.color,
        }))
      );
    } catch (error) {
      console.error('Error fetching asset types:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAssetTypes();
  }, [refreshAssetTypes]);

  const addAssetType = async (assetType: Omit<AssetType, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('asset_types')
      .insert({
        user_id: user.id,
        name: assetType.name,
        icon: assetType.icon,
        color: assetType.color,
      })
      .select()
      .single();

    if (error) throw error;

    setAssetTypes((prev) => [
      ...prev,
      { id: data.id, name: data.name, icon: data.icon, color: data.color },
    ]);
  };

  const updateAssetType = async (id: string, assetType: Partial<AssetType>) => {
    const { error } = await supabase
      .from('asset_types')
      .update({
        name: assetType.name,
        icon: assetType.icon,
        color: assetType.color,
      })
      .eq('id', id);

    if (error) throw error;

    setAssetTypes((prev) =>
      prev.map((at) => (at.id === id ? { ...at, ...assetType } : at))
    );
  };

  const deleteAssetType = async (id: string) => {
    const { error } = await supabase.from('asset_types').delete().eq('id', id);

    if (error) throw error;

    setAssetTypes((prev) => prev.filter((at) => at.id !== id));
  };

  const value = useMemo(
    () => ({ assetTypes, loading, addAssetType, updateAssetType, deleteAssetType, refreshAssetTypes }),
    [assetTypes, loading, refreshAssetTypes]
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
