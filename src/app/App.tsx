import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './modules/Dashboard';
import { Inventario } from './modules/Inventario';
import { Ventas } from './modules/Ventas';
import { ServicioTecnico } from './modules/ServicioTecnico';
import { Clientes } from './modules/Clientes';
import { Proveedores } from './modules/Proveedores';
import { Reportes } from './modules/Reportes';
import { Usuarios } from './modules/Usuarios';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentModule, setCurrentModule] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventario':
        return <Inventario />;
      case 'ventas':
        return <Ventas />;
      case 'servicio':
        return <ServicioTecnico />;
      case 'clientes':
        return <Clientes />;
      case 'proveedores':
        return <Proveedores />;
      case 'reportes':
        return <Reportes />;
      case 'usuarios':
        return <Usuarios />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentModule={currentModule} onModuleChange={setCurrentModule}>
      {renderModule()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="size-full">
        <AppContent />
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
}