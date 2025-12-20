import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthFilterProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthFilter({ currentMonth, onMonthChange }: MonthFilterProps) {
  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onMonthChange(newDate);
  };

  const monthYear = currentMonth.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const isCurrentMonth = 
    currentMonth.getMonth() === new Date().getMonth() && 
    currentMonth.getFullYear() === new Date().getFullYear();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevMonth}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-medium min-w-[150px] text-center capitalize">
        {monthYear}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        disabled={isCurrentMonth}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
