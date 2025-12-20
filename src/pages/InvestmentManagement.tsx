import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { InvestmentTable } from '@/components/dashboard/InvestmentTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { assetTypes } from '@/data/mockData';
import { useInvestments } from '@/contexts/InvestmentContext';
import { Investment, investmentEntities, InvestmentEntity } from '@/types/finance';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function InvestmentManagement() {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useInvestments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    assetTypeId: '',
    name: '',
    ticker: '',
    quantity: '',
    investedValue: '',
    currentValue: '',
    currency: 'BRL' as 'BRL' | 'USD',
    entity: '' as InvestmentEntity | '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      assetTypeId: '',
      name: '',
      ticker: '',
      quantity: '',
      investedValue: '',
      currentValue: '',
      currency: 'BRL',
      entity: '',
      notes: '',
    });
    setEditingInvestment(null);
  };

  const handleOpenDialog = (investment?: Investment) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData({
        assetTypeId: investment.assetTypeId,
        name: investment.name,
        ticker: investment.ticker || '',
        quantity: investment.quantity.toString(),
        investedValue: investment.investedValue.toString(),
        currentValue: investment.currentValue.toString(),
        currency: investment.currency,
        entity: investment.entity || '',
        notes: investment.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.assetTypeId || !formData.name || !formData.quantity || !formData.investedValue) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const newInvestment: Investment = {
      id: editingInvestment?.id || Date.now().toString(),
      assetTypeId: formData.assetTypeId,
      name: formData.name,
      ticker: formData.ticker || undefined,
      quantity: parseFloat(formData.quantity),
      investedValue: parseFloat(formData.investedValue),
      currentValue: parseFloat(formData.currentValue) || parseFloat(formData.investedValue),
      currency: formData.currency,
      entity: formData.entity || undefined,
      notes: formData.notes || undefined,
      createdAt: editingInvestment?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingInvestment) {
      updateInvestment(editingInvestment.id, newInvestment);
      toast({ title: 'Investimento atualizado com sucesso!' });
    } else {
      addInvestment(newInvestment);
      toast({ title: 'Investimento cadastrado com sucesso!' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteInvestment(id);
    toast({ title: 'Investimento excluído com sucesso!' });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestão de Investimentos</h1>
            <p className="text-muted-foreground">
              Cadastre, edite e acompanhe seus investimentos
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Investimento
          </Button>
        </div>

        <InvestmentTable
          investments={investments}
          assetTypes={assetTypes}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do investimento abaixo
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="assetType">Tipo de Ativo *</Label>
                <Select
                  value={formData.assetTypeId}
                  onValueChange={(value) => setFormData({ ...formData, assetTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Ativo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Bitcoin"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ticker">Ticker</Label>
                  <Input
                    id="ticker"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                    placeholder="Ex: BTC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="any"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Moeda *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: 'BRL' | 'USD') => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="entity">Entidade</Label>
              <Select
                value={formData.entity}
                onValueChange={(value: InvestmentEntity) => setFormData({ ...formData, entity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a entidade" />
                </SelectTrigger>
                <SelectContent>
                  {investmentEntities.map((ent) => (
                    <SelectItem key={ent.value} value={ent.value}>
                      {ent.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="investedValue">Valor Investido *</Label>
                  <Input
                    id="investedValue"
                    type="number"
                    step="0.01"
                    value={formData.investedValue}
                    onChange={(e) => setFormData({ ...formData, investedValue: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentValue">Valor Atual</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingInvestment ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
