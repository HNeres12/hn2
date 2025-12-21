import { useState } from 'react';
import { Plus, Pencil, Trash2, Building, Bitcoin, TrendingUp, DollarSign, Shield, Landmark, Car, Gem, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAssetTypes } from '@/contexts/AssetTypeContext';
import { Badge } from '@/components/ui/badge';
import { AssetType } from '@/types/finance';

const availableIcons = [
  { name: 'Bitcoin', icon: Bitcoin },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Shield', icon: Shield },
  { name: 'Building', icon: Building },
  { name: 'Landmark', icon: Landmark },
  { name: 'Car', icon: Car },
  { name: 'Gem', icon: Gem },
  { name: 'Wallet', icon: Wallet },
];

const availableColors = [
  { name: 'Laranja', value: 'hsl(38, 92%, 50%)' },
  { name: 'Verde', value: 'hsl(142, 72%, 46%)' },
  { name: 'Ciano', value: 'hsl(174, 72%, 46%)' },
  { name: 'Roxo', value: 'hsl(262, 83%, 58%)' },
  { name: 'Azul', value: 'hsl(200, 72%, 46%)' },
  { name: 'Rosa', value: 'hsl(340, 82%, 52%)' },
  { name: 'Amarelo', value: 'hsl(48, 92%, 50%)' },
  { name: 'Vermelho', value: 'hsl(0, 72%, 50%)' },
];

export function AssetTypeManager() {
  const { assetTypes, addAssetType, updateAssetType, deleteAssetType } = useAssetTypes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssetType, setEditingAssetType] = useState<AssetType | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    icon: 'TrendingUp',
    color: 'hsl(142, 72%, 46%)',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'TrendingUp',
      color: 'hsl(142, 72%, 46%)',
    });
    setEditingAssetType(null);
  };

  const handleOpenDialog = (assetType?: AssetType) => {
    if (assetType) {
      setEditingAssetType(assetType);
      setFormData({
        name: assetType.name,
        icon: assetType.icon,
        color: assetType.color,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do tipo de ativo é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    const newAssetType: AssetType = {
      id: editingAssetType?.id || Date.now().toString(),
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
    };

    if (editingAssetType) {
      updateAssetType(editingAssetType.id, newAssetType);
      toast({ title: 'Tipo de ativo atualizado!' });
    } else {
      addAssetType(newAssetType);
      toast({ title: 'Tipo de ativo criado!' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteAssetType(id);
    toast({ title: 'Tipo de ativo excluído!' });
  };

  const getIconComponent = (iconName: string) => {
    const found = availableIcons.find((i) => i.name === iconName);
    return found ? found.icon : TrendingUp;
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tipos de Ativos</h3>
        <Button size="sm" variant="outline" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-1" />
          Novo Tipo
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {assetTypes.map((type) => {
          const IconComponent = getIconComponent(type.icon);
          return (
            <Badge
              key={type.id}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
              style={{ borderLeft: `3px solid ${type.color}` }}
            >
              <IconComponent className="w-4 h-4" style={{ color: type.color }} />
              <span>{type.name}</span>
              <button
                onClick={() => handleOpenDialog(type)}
                className="ml-1 p-0.5 hover:bg-muted rounded"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(type.id)}
                className="p-0.5 hover:bg-destructive/20 rounded text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </Badge>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingAssetType ? 'Editar Tipo de Ativo' : 'Novo Tipo de Ativo'}
            </DialogTitle>
            <DialogDescription>
              Defina o nome, ícone e cor do tipo de ativo
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Imóveis, Veículos, Joias..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Ícone</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <SelectItem key={item.name} value={item.name}>
                        <div className="flex items-center gap-2">
                          <IconComp className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Cor</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingAssetType ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
