import { TrendingUp, TrendingDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Investment, AssetType } from '@/types/finance';
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
import { Button } from '@/components/ui/button';

interface InvestmentTableProps {
  investments: Investment[];
  assetTypes: AssetType[];
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
}

export function InvestmentTable({ investments, assetTypes, onEdit, onDelete }: InvestmentTableProps) {
  const getAssetTypeName = (id: string) => {
    return assetTypes.find((t) => t.id === id)?.name || 'Desconhecido';
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Ativo</TableHead>
            <TableHead className="text-muted-foreground">Tipo</TableHead>
            <TableHead className="text-muted-foreground text-right">Quantidade</TableHead>
            <TableHead className="text-muted-foreground text-right">Investido</TableHead>
            <TableHead className="text-muted-foreground text-right">Valor Atual</TableHead>
            <TableHead className="text-muted-foreground text-right">Variação</TableHead>
            <TableHead className="text-muted-foreground text-center">Moeda</TableHead>
            <TableHead className="text-muted-foreground w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => {
            const variation = investment.currentValue - investment.investedValue;
            const variationPercent = (variation / investment.investedValue) * 100;
            const isPositive = variation >= 0;

            return (
              <TableRow key={investment.id} className="border-border">
                <TableCell className="font-medium">
                  <div>
                    <p>{investment.name}</p>
                    {investment.ticker && (
                      <p className="text-xs text-muted-foreground">{investment.ticker}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getAssetTypeName(investment.assetTypeId)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {investment.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 })}
                </TableCell>
                <TableCell className="text-right font-mono">
                  R$ {investment.investedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  R$ {investment.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={cn('font-mono', isPositive ? 'number-positive' : 'number-negative')}>
                      {isPositive ? '+' : ''}{variationPercent.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                    {investment.currency}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(investment)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(investment.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
