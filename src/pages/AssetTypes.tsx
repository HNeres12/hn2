import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { assetTypes as mockAssetTypes } from '@/data/mockData';
import { AssetType } from '@/types/finance';
import { getIcon } from '@/lib/iconUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const availableIcons = [
  'Bitcoin', 'TrendingUp', 'DollarSign', 'Shield', 'Building', 'Wallet',
  'PiggyBank', 'Landmark', 'Gem', 'Coins', 'Banknote', 'BarChart3',
];

const availableColors = [
  { name: 'Dourado', value: 'hsl(38, 92%, 50%)' },
  { name: 'Verde', value: 'hsl(142, 72%, 46%)' },
  { name: 'Cyan', value: 'hsl(174, 72%, 46%)' },
  { name: 'Roxo', value: 'hsl(262, 83%, 58%)' },
  { name: 'Azul', value: 'hsl(200, 72%, 46%)' },
  { name: 'Vermelho', value: 'hsl(0, 72%, 51%)' },
  { name: 'Rosa', value: 'hsl(340, 82%, 52%)' },
];

export default function AssetTypes() {
  const [assetTypes, setAssetTypes] = useState(mockAssetTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AssetType | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    icon: 'Wallet',
    color: 'hsl(174, 72%, 46%)',
  });

  const resetForm = () => {
    setFormData({ name: '', icon: 'Wallet', color: 'hsl(174, 72%, 46%)' });
    setEditingType(null);
  };

  const handleOpenDialog = (type?: AssetType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        icon: type.icon,
        color: type.color,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: 'Erro',
        description: 'Informe o nome do tipo de ativo',
        variant: 'destructive',
      });
      return;
    }

    const newType: AssetType = {
      id: editingType?.id || Date.now().toString(),
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
    };

    if (editingType) {
      setAssetTypes(assetTypes.map((t) => (t.id === editingType.id ? newType : t)));
      toast({ title: 'Tipo de ativo atualizado!' });
    } else {
      setAssetTypes([...assetTypes, newType]);
      toast({ title: 'Tipo de ativo cadastrado!' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setAssetTypes(assetTypes.filter((t) => t.id !== id));
    toast({ title: 'Tipo de ativo excluído!' });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tipos de Ativos</h1>
            <p className="text-muted-foreground">
              Gerencie as categorias de investimentos
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Tipo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assetTypes.map((type, index) => {
            const IconComponent = getIcon(type.icon);

            return (
              <div
                key={type.id}
                className="stat-card animate-slide-up flex items-center justify-between"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${type.color}20` }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: type.color }} />
                  </div>
                  <span className="font-semibold">{type.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(type)}
                    className="h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(type.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'Editar Tipo de Ativo' : 'Novo Tipo de Ativo'}
              </DialogTitle>
              <DialogDescription>
                Configure o tipo de ativo abaixo
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Criptomoedas"
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
                    {availableIcons.map((icon) => {
                      const IconComp = getIcon(icon);
                      return (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <IconComp className="w-4 h-4" />
                            <span>{icon}</span>
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
                {editingType ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
