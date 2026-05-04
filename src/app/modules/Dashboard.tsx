import { TrendingUp, TrendingDown, Package, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const statsCards = [
  { title: 'Ventas del Mes', value: '$45,230', change: '+12.5%', icon: DollarSign, trend: 'up' },
  { title: 'Productos en Stock', value: '1,234', change: '-3.2%', icon: Package, trend: 'down' },
  { title: 'Órdenes Hoy', value: '87', change: '+8.1%', icon: ShoppingCart, trend: 'up' },
  { title: 'Productos Bajo Stock', value: '23', change: '+5', icon: AlertTriangle, trend: 'warning' }
];

const salesData = [
  { month: 'Ene', ventas: 4000, ordenes: 240 },
  { month: 'Feb', ventas: 3000, ordenes: 198 },
  { month: 'Mar', ventas: 5000, ordenes: 380 },
  { month: 'Abr', ventas: 4500, ordenes: 308 },
  { month: 'May', ventas: 6000, ordenes: 420 },
  { month: 'Jun', ventas: 5500, ordenes: 380 }
];

const categoryData = [
  { name: 'Electrónica', value: 4500, color: '#2563eb' },
  { name: 'Hogar', value: 3200, color: '#0ea5e9' },
  { name: 'Ropa', value: 2800, color: '#16a34a' },
  { name: 'Deportes', value: 1900, color: '#f59e0b' }
];

const lowStockProducts = [
  { name: 'Laptop HP', stock: 3, category: 'Electrónica' },
  { name: 'Mouse Logitech', stock: 5, category: 'Electrónica' },
  { name: 'Silla Oficina', stock: 2, category: 'Hogar' },
  { name: 'Monitor Samsung', stock: 4, category: 'Electrónica' }
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground mb-2">{stat.title}</p>
                  <h2 className="text-foreground mb-2">{stat.value}</h2>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : stat.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                    <span
                      className={`${
                        stat.trend === 'up'
                          ? 'text-success'
                          : stat.trend === 'down'
                          ? 'text-destructive'
                          : 'text-warning'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ventas Mensuales" subtitle="Últimos 6 meses">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="ventas" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Órdenes por Mes" subtitle="Últimos 6 meses">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="ordenes" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ventas por Categoría" subtitle="Distribución actual">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((cat, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-muted-foreground">{cat.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Productos Bajo Stock" subtitle="Requieren reabastecimiento">
          <div className="space-y-3">
            {lowStockProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20"
              >
                <div>
                  <p className="text-foreground mb-1">{product.name}</p>
                  <p className="text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-warning mb-1">{product.stock} unidades</p>
                  <p className="text-muted-foreground">Reabastecer</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
