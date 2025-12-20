import { LucideIcon } from 'lucide-react';
import {
  Home, UtensilsCrossed, Car, CreditCard, Gamepad2, Heart,
  GraduationCap, MoreHorizontal, Circle, Wallet, Repeat, Calendar,
  Bitcoin, TrendingUp, DollarSign, Shield, Building, PiggyBank,
  Landmark, Gem, Coins, Banknote, BarChart3
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Home, UtensilsCrossed, Car, CreditCard, Gamepad2, Heart,
  GraduationCap, MoreHorizontal, Circle, Wallet, Repeat, Calendar,
  Bitcoin, TrendingUp, DollarSign, Shield, Building, PiggyBank,
  Landmark, Gem, Coins, Banknote, BarChart3
};

export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Circle;
}
