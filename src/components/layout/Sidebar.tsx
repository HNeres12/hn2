import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  PiggyBank,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard Investimentos', icon: LayoutDashboard },
  { path: '/investments', label: 'Gestão de Investimentos', icon: Wallet },
  { path: '/finances', label: 'Dashboard Finanças', icon: PiggyBank },
  { path: '/expenses', label: 'Cadastro de Despesas', icon: Receipt },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">FinanceHub</h1>
              <p className="text-xs text-muted-foreground">Controle Total</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto glow-primary">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item',
                isActive && 'nav-item-active',
                collapsed && 'justify-center px-3'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className={cn(
              'w-full text-muted-foreground hover:text-destructive',
              collapsed ? 'justify-center' : 'justify-start gap-2'
            )}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sair</span>}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>
    </aside>
  );
}
