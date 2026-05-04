import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wrench,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'servicio', label: 'Servicio Técnico', icon: Wrench },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'usuarios', label: 'Usuarios', icon: Settings }
];

export function Layout({ children, currentModule, onModuleChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-sidebar-foreground">VA Control</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {sidebarOpen ? (
            <div className="mb-3">
              <p className="text-sidebar-foreground mb-1">{user?.name}</p>
              <p className="text-sidebar-foreground/60">{user?.role}</p>
            </div>
          ) : null}
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className={`w-full text-sidebar-foreground hover:bg-sidebar-accent ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Cerrar Sesión'}
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LayoutDashboard className="w-5 h-5" />
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">
              {menuItems.find((item) => item.id === currentModule)?.label || 'Dashboard'}
            </span>
          </div>
          <div className="text-muted-foreground">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
