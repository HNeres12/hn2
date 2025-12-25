import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DateRangeFilterProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
  minDate?: Date;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentYear = new Date().getFullYear();

export function DateRangeFilter({ startDate, endDate, onRangeChange, minDate }: DateRangeFilterProps) {
  const minYear = minDate ? minDate.getFullYear() : currentYear - 2;
  const years = Array.from({ length: currentYear - minYear + 3 }, (_, i) => minYear + i);
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState({ month: startDate.getMonth(), year: startDate.getFullYear() });
  const [tempEnd, setTempEnd] = useState({ month: endDate.getMonth(), year: endDate.getFullYear() });

  const handleApply = () => {
    // Ensure selected date is not before minDate
    let finalStart = new Date(tempStart.year, tempStart.month, 1);
    if (minDate && finalStart < minDate) {
      finalStart = minDate;
    }
    const newEnd = new Date(tempEnd.year, tempEnd.month + 1, 0); // Last day of month
    onRangeChange(finalStart, newEnd);
    setIsOpen(false);
  };

  // Check if a month/year combination is disabled
  const isMonthDisabled = (month: number, year: number) => {
    if (!minDate) return false;
    const date = new Date(year, month, 1);
    return date < minDate;
  };

  const formatRange = () => {
    const startStr = `${months[startDate.getMonth()].slice(0, 3)}/${startDate.getFullYear()}`;
    const endStr = `${months[endDate.getMonth()].slice(0, 3)}/${endDate.getFullYear()}`;
    return `${startStr} - ${endStr}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatRange()}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">De</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={tempStart.month.toString()}
                onValueChange={(v) => setTempStart({ ...tempStart, month: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, idx) => (
                    <SelectItem 
                      key={idx} 
                      value={idx.toString()}
                      disabled={isMonthDisabled(idx, tempStart.year)}
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={tempStart.year.toString()}
                onValueChange={(v) => setTempStart({ ...tempStart, year: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Até</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={tempEnd.month.toString()}
                onValueChange={(v) => setTempEnd({ ...tempEnd, month: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={tempEnd.year.toString()}
                onValueChange={(v) => setTempEnd({ ...tempEnd, year: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleApply} className="w-full">
            Aplicar Filtro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
