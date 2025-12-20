import { ExpenseCategory } from '@/types/finance';
import { getIcon } from '@/lib/iconUtils';

interface CategoryBreakdownProps {
  categories: ExpenseCategory[];
  expenses: Record<string, number>;
  total: number;
}

export function CategoryBreakdown({ categories, expenses, total }: CategoryBreakdownProps) {
  const sortedCategories = categories
    .map((cat) => ({
      ...cat,
      value: expenses[cat.id] || 0,
      percentage: total > 0 ? ((expenses[cat.id] || 0) / total) * 100 : 0,
    }))
    .filter((cat) => cat.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="stat-card animate-fade-in">
      <h3 className="font-semibold mb-4">Gastos por Categoria</h3>
      <div className="space-y-4">
        {sortedCategories.map((category) => {
          const IconComponent = getIcon(category.icon);
          
          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">
                    R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
