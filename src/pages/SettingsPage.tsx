import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Palette, Database, Shield } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    name: 'Usuário',
    email: 'usuario@email.com',
    notifications: true,
    autoRefresh: true,
    darkMode: true,
  });

  const handleSave = () => {
    toast({ title: 'Configurações salvas com sucesso!' });
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências do sistema
          </p>
        </div>

        <div className="stat-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">Perfil</h2>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="stat-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-success" />
            </div>
            <h2 className="font-semibold text-lg">Notificações</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações Push</p>
              <p className="text-sm text-muted-foreground">Receba alertas sobre seus investimentos</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>
        </div>

        <div className="stat-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-warning" />
            </div>
            <h2 className="font-semibold text-lg">Aparência</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tema Escuro</p>
              <p className="text-sm text-muted-foreground">Usar tema escuro na interface</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
            />
          </div>
        </div>

        <div className="stat-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="font-semibold text-lg">Dados</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Atualização Automática</p>
              <p className="text-sm text-muted-foreground">Atualizar cotações automaticamente</p>
            </div>
            <Switch
              checked={settings.autoRefresh}
              onCheckedChange={(checked) => setSettings({ ...settings, autoRefresh: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Seus dados estão seguros</p>
                <p className="text-muted-foreground">
                  Para persistência, conecte ao Lovable Cloud
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </div>
    </MainLayout>
  );
}
