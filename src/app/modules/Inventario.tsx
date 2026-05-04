import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Package, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  costo: number;
  stock: number;
  minStock: number;
  sku: string;
}

const mockProducts: Product[] = [
  { id: '1', nombre: 'Laptop HP Pavilion', categoria: 'Electrónica', precio: 850, costo: 650, stock: 15, minStock: 5, sku: 'LPT-001' },
  { id: '2', nombre: 'Mouse Logitech G502', categoria: 'Electrónica', precio: 45, costo: 30, stock: 5, minStock: 10, sku: 'MSE-002' },
  { id: '3', nombre: 'Silla Oficina Ergonómica', categoria: 'Hogar', precio: 180, costo: 120, stock: 8, minStock: 3, sku: 'SLL-003' },
  { id: '4', nombre: 'Monitor Samsung 24"', categoria: 'Electrónica', precio: 220, costo: 150, stock: 12, minStock: 5, sku: 'MON-004' },
  { id: '5', nombre: 'Teclado Mecánico RGB', categoria: 'Electrónica', precio: 95, costo: 65, stock: 20, minStock: 8, sku: 'TEC-005' }
];

const categorias = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Electrónica', label: 'Electrónica' },
  { value: 'Hogar', label: 'Hogar' },
  { value: 'Ropa', label: 'Ropa' },
  { value: 'Deportes', label: 'Deportes' }
];

export function Inventario() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Electrónica',
    precio: '',
    costo: '',
    stock: '',
    minStock: '',
    sku: ''
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        nombre: product.nombre,
        categoria: product.categoria,
        precio: product.precio.toString(),
        costo: product.costo.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        sku: product.sku
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: '',
        categoria: 'Electrónica',
        precio: '',
        costo: '',
        stock: '',
        minStock: '',
        sku: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveProduct = () => {
    if (!formData.nombre || !formData.precio || !formData.costo || !formData.stock) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const ganancia = ((parseFloat(formData.precio) - parseFloat(formData.costo)) / parseFloat(formData.costo) * 100).toFixed(1);

    if (editingProduct) {
      setProducts(products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              nombre: formData.nombre,
              categoria: formData.categoria,
              precio: parseFloat(formData.precio),
              costo: parseFloat(formData.costo),
              stock: parseInt(formData.stock),
              minStock: parseInt(formData.minStock),
              sku: formData.sku
            }
          : p
      ));
      toast.success(`Producto actualizado | Ganancia: ${ganancia}%`);
    } else {
      const newProduct: Product = {
        id: (products.length + 1).toString(),
        nombre: formData.nombre,
        categoria: formData.categoria,
        precio: parseFloat(formData.precio),
        costo: parseFloat(formData.costo),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        sku: formData.sku
      };
      setProducts([...products, newProduct]);
      toast.success(`Producto creado | Ganancia: ${ganancia}%`);
    }

    setShowModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success('Producto eliminado');
  };

  const columns = [
    { header: 'SKU', accessor: 'sku' },
    { header: 'Producto', accessor: 'nombre' },
    { header: 'Categoría', accessor: 'categoria' },
    {
      header: 'Precio',
      accessor: 'precio',
      cell: (value: number) => `$${value.toFixed(2)}`
    },
    {
      header: 'Stock',
      accessor: 'stock',
      cell: (value: number, row: Product) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {value <= row.minStock && (
            <AlertTriangle className="w-4 h-4 text-warning" />
          )}
        </div>
      )
    },
    {
      header: 'Ganancia',
      accessor: 'precio',
      cell: (value: number, row: Product) => {
        const ganancia = ((value - row.costo) / row.costo * 100).toFixed(1);
        return <Badge variant="success">+{ganancia}%</Badge>;
      }
    },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (value: string, row: Product) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(value)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Gestión de Inventario</h1>
          <p className="text-muted-foreground">Administra productos y control de stock</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-foreground mb-1">Productos Bajo Stock</h3>
              <p className="text-muted-foreground">
                {lowStockProducts.length} producto(s) requieren reabastecimiento
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={categorias}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>

        <Table columns={columns} data={filteredProducts} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Producto"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Laptop HP Pavilion"
          />
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Ej: LPT-001"
          />
          <Select
            label="Categoría"
            options={categorias.slice(1)}
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          />
          <Input
            label="Precio de Venta"
            type="number"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Costo"
            type="number"
            value={formData.costo}
            onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Stock Actual"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="0"
          />
          <Input
            label="Stock Mínimo"
            type="number"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
            placeholder="0"
          />
        </div>
        {formData.precio && formData.costo && (
          <div className="mt-4 p-4 bg-success/10 rounded-lg">
            <p className="text-success">
              Porcentaje de Ganancia: {((parseFloat(formData.precio) - parseFloat(formData.costo)) / parseFloat(formData.costo) * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
