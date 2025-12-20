import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import { subscriptions as mockSubscriptions, expenseCategories } from '@/data/mockData';
import { Subscription } from '@/types/finance';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    value: '',
    billingDay: '1',
    categoryId: '4',
    active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      billingDay: '1',
      categoryId: '4',
      active: true,
    });
    setEditingSubscription(null);
  };

  const handleOpenDialog = (subscription?: Subscription) => {
    if (subscription) {
      setEditingSubscription(subscription);
      setFormData({
        name: subscription.name,
        value: subscription.value.toString(),
        billingDay: subscription.billingDay.toString(),
        categoryId: subscription.categoryId,
        active: subscription.active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.value) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const newSubscription: Subscription = {
      id: editingSubscription?.id || Date.now().toString(),
      name: formData.name,
      value: parseFloat(formData.value),
      billingDay: parseInt(formData.billingDay),
      categoryId: formData.categoryId,
      active: formData.active,
    };

    if (editingSubscription) {
      setSubscriptions(subscriptions.map((s) => (s.id === editingSubscription.id ? newSubscription : s)));
      toast({ title: 'Assinatura atualizada!' });
    } else {
      setSubscriptions([...subscriptions, newSubscription]);
      toast({ title: 'Assinatura cadastrada!' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
    toast({ title: 'Assinatura excluída!' });
  };

  const toggleActive = (id: string) => {
    setSubscriptions(subscriptions.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const totalActive = subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.value, 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assinaturas</h1>
            <p className="text-muted-foreground">
              Gerencie seus serviços recorrentes
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Assinatura
          </Button>
        </div>

        <div className="stat-card glow-primary max-w-sm">
          <p className="text-muted-foreground text-sm mb-1">Total Mensal Ativo</p>
          <p className="text-3xl font-bold font-mono">
            R$ {totalActive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((subscription, index) => (
            <div
              key={subscription.id}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold">{subscription.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Cobrança dia {subscription.billingDay}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={subscription.active ? 'default' : 'secondary'}
                    className={subscription.active ? 'bg-success/20 text-success' : ''}
                  >
                    {subscription.active ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {subscription.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleActive(subscription.id)}>
                        {subscription.active ? (
                          <>
                            <X className="w-4 h-4 mr-2" /> Desativar
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" /> Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenDialog(subscription)}>
                        <Pencil className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(subscription.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="font-mono text-2xl font-semibold">
                R$ {subscription.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? 'Editar Assinatura' : 'Nova Assinatura'}
              </DialogTitle>
              <DialogDescription>
                Configure os dados da assinatura
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Netflix"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="value">Valor Mensal *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingDay">Dia da Cobrança</Label>
                  <Input
                    id="billingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.billingDay}
                    onChange={(e) => setFormData({ ...formData, billingDay: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Assinatura Ativa</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingSubscription ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
