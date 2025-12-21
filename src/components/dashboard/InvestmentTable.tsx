import { TrendingUp, TrendingDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Investment, AssetType, investmentEntities, InvestmentEntity } from '@/types/finance';
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
import { Badge } from '@/components/ui/badge';

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

  const getEntityLabel = (entity?: InvestmentEntity) => {
    if (!entity) return null;
    return investmentEntities.find((e) => e.value === entity)?.label || entity;
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Ativo</TableHead>
            <TableHead className="text-muted-foreground">Tipo</TableHead>
            <TableHead className="text-muted-foreground">Entidade</TableHead>
            <TableHead className="text-muted-foreground">Corretora</TableHead>
            <TableHead className="text-muted-foreground text-right">Quantidade</TableHead>
            <TableHead className="text-muted-foreground text-right">Investido</TableHead>
            <TableHead className="text-muted-foreground text-right">Valor Atual</TableHead>
            <TableHead className="text-muted-foreground text-right">Variação</TableHead>
            <TableHead className="text-muted-foreground w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => {
            const hasInvestedValue = investment.investedValue !== undefined && investment.investedValue > 0;
            const variation = hasInvestedValue ? investment.currentValue - investment.investedValue : null;
            const variationPercent = hasInvestedValue && investment.investedValue 
              ? (variation! / investment.investedValue) * 100 
              : null;
            const isPositive = variation !== null ? variation >= 0 : true;
            const entityLabel = getEntityLabel(investment.entity);

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
                <TableCell>
                  {entityLabel ? (
                    <Badge variant="outline" className="text-xs">
                      {entityLabel}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {investment.broker ? (
                    <Badge variant="secondary" className="text-xs">
                      {investment.broker}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {investment.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 })}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {hasInvestedValue ? (
                    <>
                      {investment.currency === 'USD' ? '$' : 'R$'} {investment.investedValue!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs">Não informado</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {investment.currency === 'USD' ? '$' : 'R$'} {investment.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {variationPercent !== null ? (
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
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
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
