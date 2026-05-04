import { useState } from 'react';
import { Download, Filter, Calendar, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

const salesByMonth = [
  { mes: 'Enero', ventas: 12500, ordenes: 45, clientes: 32 },
  { mes: 'Febrero', ventas: 15200, ordenes: 52, clientes: 38 },
  { mes: 'Marzo', ventas: 18900, ordenes: 68, clientes: 45 },
  { mes: 'Abril', ventas: 22300, ordenes: 75, clientes: 52 },
  { mes: 'Mayo', ventas: 19800, ordenes: 63, clientes: 48 },
  { mes: 'Junio', ventas: 25600, ordenes: 82, clientes: 58 }
];

const topProducts = [
  { nombre: 'Laptop HP Pavilion', unidades: 45, ingresos: 38250 },
  { nombre: 'Monitor Samsung 24"', unidades: 68, ingresos: 14960 },
  { nombre: 'Mouse Logitech G502', unidades: 120, ingresos: 5400 },
  { nombre: 'Teclado Mecánico RGB', unidades: 85, ingresos: 8075 },
  { nombre: 'Silla Oficina Ergonómica', unidades: 32, ingresos: 5760 }
];

const categoryData = [
  { name: 'Electrónica', value: 45000, color: '#2563eb' },
  { name: 'Hogar', value: 28000, color: '#0ea5e9' },
  { name: 'Ropa', value: 18000, color: '#16a34a' },
  { name: 'Deportes', value: 15000, color: '#f59e0b' }
];

const inventoryValue = [
  { categoria: 'Electrónica', stock: 1234, valor: 185000 },
  { categoria: 'Hogar', stock: 567, valor: 68000 },
  { categoria: 'Ropa', stock: 890, valor: 45000 },
  { categoria: 'Deportes', stock: 432, valor: 32000 }
];

export function Reportes() {
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('ventas');

  const handleExport = (type: string) => {
    toast.success(`Exportando reporte de ${type}...`);
  };

  const periodOptions = [
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Último Mes' },
    { value: 'quarter', label: 'Último Trimestre' },
    { value: 'year', label: 'Último Año' }
  ];

  const reportOptions = [
    { value: 'ventas', label: 'Reporte de Ventas' },
    { value: 'inventario', label: 'Reporte de Inventario' },
    { value: 'clientes', label: 'Reporte de Clientes' },
    { value: 'financiero', label: 'Reporte Financiero' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">Análisis detallado del negocio</p>
        </div>
        <div className="flex gap-3">
          <Select options={periodOptions} value={period} onChange={(e) => setPeriod(e.target.value)} />
          <Select options={reportOptions} value={reportType} onChange={(e) => setReportType(e.target.value)} />
          <Button onClick={() => handleExport(reportType)}>
            <Download className="w-5 h-5" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Ventas Totales</p>
              <h2 className="text-foreground">$114,300</h2>
              <p className="text-success mt-1">+18.5% vs anterior</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Órdenes Totales</p>
              <h2 className="text-foreground">385</h2>
              <p className="text-success mt-1">+12.3% vs anterior</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Valor Inventario</p>
              <h2 className="text-foreground">$330,000</h2>
              <p className="text-muted-foreground mt-1">3,123 productos</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Clientes Activos</p>
              <h2 className="text-foreground">273</h2>
              <p className="text-success mt-1">+8.7% vs anterior</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ventas y Órdenes Mensuales" subtitle="Comparativa de los últimos 6 meses">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2} name="Ventas ($)" />
              <Line type="monotone" dataKey="ordenes" stroke="#16a34a" strokeWidth={2} name="Órdenes" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Clientes Nuevos por Mes" subtitle="Crecimiento de la base de clientes">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="clientes" fill="#0ea5e9" radius={[8, 8, 0, 0]} name="Clientes" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ventas por Categoría" subtitle="Distribución de ingresos">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Productos Más Vendidos" subtitle="Top 5 por unidades">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <p className="text-foreground mb-1">{product.nombre}</p>
                  <p className="text-muted-foreground">{product.unidades} unidades vendidas</p>
                </div>
                <div className="text-right">
                  <p className="text-foreground">${product.ingresos.toLocaleString()}</p>
                  <p className="text-muted-foreground">Ingresos</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Valor de Inventario por Categoría">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryValue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="categoria" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="stock" fill="#0ea5e9" radius={[8, 8, 0, 0]} name="Stock (unidades)" />
            <Bar dataKey="valor" fill="#2563eb" radius={[8, 8, 0, 0]} name="Valor ($)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
