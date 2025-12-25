import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { Expense, Subscription, InstallmentPurchase, FixedExpense } from '@/types/finance';
import { getIcon } from '@/lib/iconUtils';
import { Checkbox } from '@/components/ui/checkbox';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const paymentMethods = [
  { value: 'card', label: 'Cartão de Crédito' },
  { value: 'debit', label: 'Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
];

type DialogType = 'expense' | 'subscription' | 'installment' | 'fixed' | null;

export default function ExpenseManagement() {
  const { 
    expenses, subscriptions, installments, fixedExpenses, expenseCategories,
    addExpense, updateExpense, deleteExpense,
    addSubscription, updateSubscription, deleteSubscription, toggleSubscription,
    addInstallment, updateInstallment, deleteInstallment, payInstallment,
    addFixedExpense, updateFixedExpense, deleteFixedExpense, toggleFixedExpense,
  } = useExpenses();
  
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    categoryId: '', value: '', paymentMethod: 'card' as Expense['paymentMethod'],
    month: currentMonth.toString(), year: currentYear.toString(),
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    name: '', value: '', billingDay: '1', categoryId: '', active: true,
  });

  const [installmentForm, setInstallmentForm] = useState({
    name: '', totalValue: '', totalInstallments: '', paidInstallments: '0',
    startDate: new Date().toISOString().split('T')[0], categoryId: '',
  });

  const [fixedForm, setFixedForm] = useState({
    name: '', value: '', dueDay: '5', categoryId: '', active: true,
  });

  const resetForms = () => {
    setExpenseForm({ categoryId: '', value: '', paymentMethod: 'card', month: currentMonth.toString(), year: currentYear.toString() });
    setSubscriptionForm({ name: '', value: '', billingDay: '1', categoryId: '', active: true });
    setInstallmentForm({ name: '', totalValue: '', totalInstallments: '', paidInstallments: '0', startDate: new Date().toISOString().split('T')[0], categoryId: '' });
    setFixedForm({ name: '', value: '', dueDay: '5', categoryId: '', active: true });
    setEditingItem(null);
  };

  const handleOpenDialog = (type: DialogType, item?: any) => {
    resetForms();
    setDialogType(type);
    if (item) {
      setEditingItem(item);
      if (type === 'expense') {
        setExpenseForm({
          categoryId: item.categoryId, value: item.value.toString(),
          paymentMethod: item.paymentMethod, month: item.month.toString(), year: item.year.toString(),
        });
      } else if (type === 'subscription') {
        setSubscriptionForm({
          name: item.name, value: item.value.toString(), billingDay: item.billingDay.toString(),
          categoryId: item.categoryId, active: item.active,
        });
      } else if (type === 'installment') {
        setInstallmentForm({
          name: item.name, totalValue: item.totalValue.toString(), totalInstallments: item.totalInstallments.toString(),
          paidInstallments: item.paidInstallments.toString(), startDate: item.startDate.toISOString().split('T')[0], categoryId: item.categoryId,
        });
      } else if (type === 'fixed') {
        setFixedForm({
          name: item.name, value: item.value.toString(), dueDay: item.dueDay.toString(),
          categoryId: item.categoryId, active: item.active,
        });
      }
    }
  };

  const handleSaveExpense = async () => {
    if (!expenseForm.categoryId || !expenseForm.value) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    try {
      const category = getCategory(expenseForm.categoryId);
      const expenseData = {
        categoryId: expenseForm.categoryId, 
        name: category?.name || 'Despesa',
        value: parseFloat(expenseForm.value),
        paymentMethod: expenseForm.paymentMethod, 
        month: parseInt(expenseForm.month), 
        year: parseInt(expenseForm.year),
      };
      if (editingItem) {
        await updateExpense(editingItem.id, expenseData);
        toast({ title: 'Despesa atualizada!' });
      } else {
        await addExpense(expenseData);
        toast({ title: 'Despesa cadastrada!' });
      }
      setDialogType(null);
      resetForms();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar a despesa. Tente novamente.', variant: 'destructive' });
    }
  };

  const handleSaveSubscription = async () => {
    if (!subscriptionForm.name || !subscriptionForm.value) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    try {
      const subData = {
        name: subscriptionForm.name, 
        value: parseFloat(subscriptionForm.value),
        billingDay: parseInt(subscriptionForm.billingDay), 
        categoryId: subscriptionForm.categoryId, 
        active: subscriptionForm.active,
      };
      if (editingItem) {
        await updateSubscription(editingItem.id, subData);
        toast({ title: 'Assinatura atualizada!' });
      } else {
        await addSubscription(subData);
        toast({ title: 'Assinatura cadastrada!' });
      }
      setDialogType(null);
      resetForms();
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar a assinatura. Tente novamente.', variant: 'destructive' });
    }
  };

  const handleSaveInstallment = async () => {
    if (!installmentForm.name || !installmentForm.totalValue || !installmentForm.totalInstallments) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    try {
      const totalValue = parseFloat(installmentForm.totalValue);
      const totalInstallments = parseInt(installmentForm.totalInstallments);
      const instData = {
        name: installmentForm.name, 
        totalValue, 
        installmentValue: totalValue / totalInstallments,
        totalInstallments, 
        paidInstallments: parseInt(installmentForm.paidInstallments),
        startDate: new Date(installmentForm.startDate), 
        categoryId: installmentForm.categoryId,
      };
      if (editingItem) {
        await updateInstallment(editingItem.id, instData);
        toast({ title: 'Compra parcelada atualizada!' });
      } else {
        await addInstallment(instData);
        toast({ title: 'Compra parcelada cadastrada!' });
      }
      setDialogType(null);
      resetForms();
    } catch (error) {
      console.error('Erro ao salvar parcelamento:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar o parcelamento. Tente novamente.', variant: 'destructive' });
    }
  };

  const handleSaveFixed = async () => {
    if (!fixedForm.name || !fixedForm.value) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    try {
      const fixedData = {
        name: fixedForm.name, 
        value: parseFloat(fixedForm.value),
        dueDay: parseInt(fixedForm.dueDay), 
        categoryId: fixedForm.categoryId, 
        active: fixedForm.active,
      };
      if (editingItem) {
        await updateFixedExpense(editingItem.id, fixedData);
        toast({ title: 'Despesa fixa atualizada!' });
      } else {
        await addFixedExpense(fixedData);
        toast({ title: 'Despesa fixa cadastrada!' });
      }
      setDialogType(null);
      resetForms();
    } catch (error) {
      console.error('Erro ao salvar despesa fixa:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar a despesa fixa. Tente novamente.', variant: 'destructive' });
    }
  };

  const getCategory = (id: string) => expenseCategories.find((c) => c.id === id);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cadastro de Despesas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas despesas, assinaturas, parcelas e contas fixas
          </p>
        </div>

        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="fixed">Fixas</TabsTrigger>
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            <TabsTrigger value="installments">Parceladas</TabsTrigger>
          </TabsList>

          {/* DESPESAS */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {selectedExpenses.size > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      selectedExpenses.forEach(id => deleteExpense(id));
                      setSelectedExpenses(new Set());
                      toast({ title: `${selectedExpenses.size} despesa(s) excluída(s)!` });
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir {selectedExpenses.size} selecionada(s)
                  </Button>
                )}
              </div>
              <Button onClick={() => handleOpenDialog('expense')} className="gap-2">
                <Plus className="w-4 h-4" /> Nova Despesa
              </Button>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={expenses.length > 0 && selectedExpenses.size === expenses.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedExpenses(new Set(expenses.map(e => e.id)));
                          } else {
                            setSelectedExpenses(new Set());
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Competência</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const category = getCategory(expense.categoryId);
                    const IconComponent = category ? getIcon(category.icon) : getIcon('Circle');
                    const isSelected = selectedExpenses.has(expense.id);
                    return (
                      <TableRow key={expense.id} className={`border-border ${isSelected ? 'bg-muted/50' : ''}`}>
                        <TableCell>
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedExpenses);
                              if (checked) {
                                newSelected.add(expense.id);
                              } else {
                                newSelected.delete(expense.id);
                              }
                              setSelectedExpenses(newSelected);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${category?.color}20` }}>
                              <IconComponent className="w-3 h-3" style={{ color: category?.color }} />
                            </div>
                            <span className="font-medium">{category?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell><span className="px-2 py-1 rounded-md bg-secondary text-xs">{paymentMethods.find((p) => p.value === expense.paymentMethod)?.label}</span></TableCell>
                        <TableCell className="text-muted-foreground">{String(expense.month).padStart(2, '0')}/{expense.year}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog('expense', expense)}><Pencil className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { deleteExpense(expense.id); setSelectedExpenses(prev => { const n = new Set(prev); n.delete(expense.id); return n; }); toast({ title: 'Despesa excluída!' }); }} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* DESPESAS FIXAS */}
          <TabsContent value="fixed" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="stat-card glow-primary max-w-xs">
                <p className="text-muted-foreground text-sm mb-1">Total Mensal</p>
                <p className="text-2xl font-bold font-mono">R$ {fixedExpenses.filter(f => f.active).reduce((sum, f) => sum + f.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <Button onClick={() => handleOpenDialog('fixed')} className="gap-2"><Plus className="w-4 h-4" /> Nova Despesa Fixa</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fixedExpenses.map((fixed, index) => (
                <div key={fixed.id} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{fixed.name}</h3>
                      <p className="text-sm text-muted-foreground">Vencimento dia {fixed.dueDay}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={fixed.active ? 'default' : 'secondary'} className={fixed.active ? 'bg-success/20 text-success' : ''}>
                        {fixed.active ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}{fixed.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleFixedExpense(fixed.id)}>{fixed.active ? <><X className="w-4 h-4 mr-2" /> Desativar</> : <><Check className="w-4 h-4 mr-2" /> Ativar</>}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDialog('fixed', fixed)}><Pencil className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { deleteFixedExpense(fixed.id); toast({ title: 'Despesa fixa excluída!' }); }} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="font-mono text-2xl font-semibold">R$ {fixed.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ASSINATURAS */}
          <TabsContent value="subscriptions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="stat-card glow-primary max-w-xs">
                <p className="text-muted-foreground text-sm mb-1">Total Mensal Ativo</p>
                <p className="text-2xl font-bold font-mono">R$ {subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <Button onClick={() => handleOpenDialog('subscription')} className="gap-2"><Plus className="w-4 h-4" /> Nova Assinatura</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((sub, index) => (
                <div key={sub.id} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{sub.name}</h3>
                      <p className="text-sm text-muted-foreground">Cobrança dia {sub.billingDay}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={sub.active ? 'default' : 'secondary'} className={sub.active ? 'bg-success/20 text-success' : ''}>
                        {sub.active ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}{sub.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleSubscription(sub.id)}>{sub.active ? <><X className="w-4 h-4 mr-2" /> Desativar</> : <><Check className="w-4 h-4 mr-2" /> Ativar</>}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDialog('subscription', sub)}><Pencil className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { deleteSubscription(sub.id); toast({ title: 'Assinatura excluída!' }); }} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="font-mono text-2xl font-semibold">R$ {sub.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* COMPRAS PARCELADAS */}
          <TabsContent value="installments" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div className="stat-card">
                  <p className="text-muted-foreground text-sm mb-1">Parcelas Mensais</p>
                  <p className="text-2xl font-bold font-mono text-warning">R$ {installments.reduce((sum, i) => i.totalInstallments - i.paidInstallments > 0 ? sum + i.installmentValue : sum, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="stat-card">
                  <p className="text-muted-foreground text-sm mb-1">Total Restante</p>
                  <p className="text-2xl font-bold font-mono">R$ {installments.reduce((sum, i) => sum + (i.totalInstallments - i.paidInstallments) * i.installmentValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <Button onClick={() => handleOpenDialog('installment')} className="gap-2"><Plus className="w-4 h-4" /> Nova Compra</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {installments.map((inst, index) => {
                const progress = (inst.paidInstallments / inst.totalInstallments) * 100;
                const remaining = inst.totalInstallments - inst.paidInstallments;
                const isComplete = remaining === 0;
                return (
                  <div key={inst.id} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{inst.name}</h3>
                        <p className="text-sm text-muted-foreground">{inst.paidInstallments}/{inst.totalInstallments} parcelas pagas</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!isComplete && <DropdownMenuItem onClick={() => { payInstallment(inst.id); toast({ title: 'Parcela registrada!' }); }}>Registrar Parcela</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => handleOpenDialog('installment', inst)}><Pencil className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { deleteInstallment(inst.id); toast({ title: 'Compra excluída!' }); }} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Parcela</span>
                        <span className="font-mono text-lg font-semibold">R$ {inst.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{isComplete ? 'Quitado!' : `${remaining} parcelas restantes`}</span>
                        <span className="font-mono text-muted-foreground">R$ {(remaining * inst.installmentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* DIALOGS */}
        <Dialog open={dialogType === 'expense'} onOpenChange={(open) => !open && setDialogType(null)}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
              <DialogDescription>Preencha os dados da despesa</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Categoria *</Label>
                  <Select value={expenseForm.categoryId} onValueChange={(value) => setExpenseForm({ ...expenseForm, categoryId: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{expenseCategories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Valor *</Label>
                  <Input type="number" step="0.01" value={expenseForm.value} onChange={(e) => setExpenseForm({ ...expenseForm, value: e.target.value })} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Forma de Pagamento</Label>
                  <Select value={expenseForm.paymentMethod} onValueChange={(value: Expense['paymentMethod']) => setExpenseForm({ ...expenseForm, paymentMethod: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{paymentMethods.map((method) => <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Mês</Label>
                  <Select value={expenseForm.month} onValueChange={(value) => setExpenseForm({ ...expenseForm, month: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Ano</Label>
                  <Select value={expenseForm.year} onValueChange={(value) => setExpenseForm({ ...expenseForm, year: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2023, 2024, 2025, 2026].map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogType(null)}>Cancelar</Button>
              <Button onClick={handleSaveExpense}>{editingItem ? 'Salvar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogType === 'subscription'} onOpenChange={(open) => !open && setDialogType(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Assinatura' : 'Nova Assinatura'}</DialogTitle>
              <DialogDescription>Configure os dados da assinatura</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome do Serviço *</Label>
                <Input value={subscriptionForm.name} onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name: e.target.value })} placeholder="Ex: Netflix" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor Mensal *</Label>
                  <Input type="number" step="0.01" value={subscriptionForm.value} onChange={(e) => setSubscriptionForm({ ...subscriptionForm, value: e.target.value })} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Dia da Cobrança</Label>
                  <Input type="number" min="1" max="31" value={subscriptionForm.billingDay} onChange={(e) => setSubscriptionForm({ ...subscriptionForm, billingDay: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Assinatura Ativa</Label>
                <Switch checked={subscriptionForm.active} onCheckedChange={(checked) => setSubscriptionForm({ ...subscriptionForm, active: checked })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogType(null)}>Cancelar</Button>
              <Button onClick={handleSaveSubscription}>{editingItem ? 'Salvar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogType === 'installment'} onOpenChange={(open) => !open && setDialogType(null)}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Compra Parcelada' : 'Nova Compra Parcelada'}</DialogTitle>
              <DialogDescription>Configure os dados da compra</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Descrição *</Label>
                <Input value={installmentForm.name} onChange={(e) => setInstallmentForm({ ...installmentForm, name: e.target.value })} placeholder="Ex: MacBook Pro" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor Total *</Label>
                  <Input type="number" step="0.01" value={installmentForm.totalValue} onChange={(e) => setInstallmentForm({ ...installmentForm, totalValue: e.target.value })} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Nº Parcelas *</Label>
                  <Input type="number" min="1" value={installmentForm.totalInstallments} onChange={(e) => setInstallmentForm({ ...installmentForm, totalInstallments: e.target.value })} placeholder="12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Parcelas Pagas</Label>
                  <Input type="number" min="0" value={installmentForm.paidInstallments} onChange={(e) => setInstallmentForm({ ...installmentForm, paidInstallments: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Data Início</Label>
                  <Input type="date" value={installmentForm.startDate} onChange={(e) => setInstallmentForm({ ...installmentForm, startDate: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogType(null)}>Cancelar</Button>
              <Button onClick={handleSaveInstallment}>{editingItem ? 'Salvar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogType === 'fixed'} onOpenChange={(open) => !open && setDialogType(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}</DialogTitle>
              <DialogDescription>Configure os dados da despesa fixa</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome *</Label>
                <Input value={fixedForm.name} onChange={(e) => setFixedForm({ ...fixedForm, name: e.target.value })} placeholder="Ex: Aluguel" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor Mensal *</Label>
                  <Input type="number" step="0.01" value={fixedForm.value} onChange={(e) => setFixedForm({ ...fixedForm, value: e.target.value })} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Dia de Vencimento</Label>
                  <Input type="number" min="1" max="31" value={fixedForm.dueDay} onChange={(e) => setFixedForm({ ...fixedForm, dueDay: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Despesa Ativa</Label>
                <Switch checked={fixedForm.active} onCheckedChange={(checked) => setFixedForm({ ...fixedForm, active: checked })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogType(null)}>Cancelar</Button>
              <Button onClick={handleSaveFixed}>{editingItem ? 'Salvar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
