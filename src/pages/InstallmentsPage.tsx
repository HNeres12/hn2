import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { installmentPurchases as mockInstallments, expenseCategories } from '@/data/mockData';
import { InstallmentPurchase } from '@/types/finance';
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState(mockInstallments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<InstallmentPurchase | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    totalValue: '',
    totalInstallments: '',
    paidInstallments: '0',
    startDate: new Date().toISOString().split('T')[0],
    categoryId: '8',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      totalValue: '',
      totalInstallments: '',
      paidInstallments: '0',
      startDate: new Date().toISOString().split('T')[0],
      categoryId: '8',
    });
    setEditingInstallment(null);
  };

  const handleOpenDialog = (installment?: InstallmentPurchase) => {
    if (installment) {
      setEditingInstallment(installment);
      setFormData({
        name: installment.name,
        totalValue: installment.totalValue.toString(),
        totalInstallments: installment.totalInstallments.toString(),
        paidInstallments: installment.paidInstallments.toString(),
        startDate: installment.startDate.toISOString().split('T')[0],
        categoryId: installment.categoryId,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.totalValue || !formData.totalInstallments) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const totalValue = parseFloat(formData.totalValue);
    const totalInstallments = parseInt(formData.totalInstallments);
    const installmentValue = totalValue / totalInstallments;

    const newInstallment: InstallmentPurchase = {
      id: editingInstallment?.id || Date.now().toString(),
      name: formData.name,
      totalValue,
      installmentValue,
      totalInstallments,
      paidInstallments: parseInt(formData.paidInstallments),
      startDate: new Date(formData.startDate),
      categoryId: formData.categoryId,
    };

    if (editingInstallment) {
      setInstallments(installments.map((i) => (i.id === editingInstallment.id ? newInstallment : i)));
      toast({ title: 'Compra parcelada atualizada!' });
    } else {
      setInstallments([...installments, newInstallment]);
      toast({ title: 'Compra parcelada cadastrada!' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setInstallments(installments.filter((i) => i.id !== id));
    toast({ title: 'Compra parcelada excluída!' });
  };

  const payInstallment = (id: string) => {
    setInstallments(installments.map((i) => {
      if (i.id === id && i.paidInstallments < i.totalInstallments) {
        return { ...i, paidInstallments: i.paidInstallments + 1 };
      }
      return i;
    }));
    toast({ title: 'Parcela registrada!' });
  };

  const totalMonthly = installments.reduce((sum, i) => {
    const remaining = i.totalInstallments - i.paidInstallments;
    return remaining > 0 ? sum + i.installmentValue : sum;
  }, 0);

  const totalRemaining = installments.reduce((sum, i) => {
    const remaining = i.totalInstallments - i.paidInstallments;
    return sum + remaining * i.installmentValue;
  }, 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Compras Parceladas</h1>
            <p className="text-muted-foreground">
              Acompanhe suas compras no cartão
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Compra
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="stat-card">
            <p className="text-muted-foreground text-sm mb-1">Parcelas Mensais</p>
            <p className="text-3xl font-bold font-mono text-warning">
              R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-muted-foreground text-sm mb-1">Total Restante</p>
            <p className="text-3xl font-bold font-mono">
              R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {installments.map((installment, index) => {
            const progress = (installment.paidInstallments / installment.totalInstallments) * 100;
            const remaining = installment.totalInstallments - installment.paidInstallments;
            const isComplete = remaining === 0;

            return (
              <div
                key={installment.id}
                className="stat-card animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{installment.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {installment.paidInstallments}/{installment.totalInstallments} parcelas pagas
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!isComplete && (
                        <DropdownMenuItem onClick={() => payInstallment(installment.id)}>
                          Registrar Parcela
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleOpenDialog(installment)}>
                        <Pencil className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(installment.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Parcela</span>
                    <span className="font-mono text-lg font-semibold">
                      R$ {installment.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <Progress value={progress} className="h-3" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isComplete ? 'Quitado!' : `${remaining} parcelas restantes`}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      R$ {(remaining * installment.installmentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>
                {editingInstallment ? 'Editar Compra Parcelada' : 'Nova Compra Parcelada'}
              </DialogTitle>
              <DialogDescription>
                Configure os dados da compra
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Descrição *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: MacBook Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalValue">Valor Total *</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    step="0.01"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalInstallments">Nº Parcelas *</Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    min="1"
                    value={formData.totalInstallments}
                    onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="paidInstallments">Parcelas Pagas</Label>
                  <Input
                    id="paidInstallments"
                    type="number"
                    min="0"
                    value={formData.paidInstallments}
                    onChange={(e) => setFormData({ ...formData, paidInstallments: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Data Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
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
                {editingInstallment ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
