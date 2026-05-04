import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, ShoppingBag } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  categoria: string;
}

interface Purchase {
  id: string;
  proveedor: string;
  fecha: string;
  productos: string;
  cantidad: number;
  total: number;
}

const mockSuppliers: Supplier[] = [
  { id: 'PRV-001', nombre: 'Tech Supplies Inc', empresa: 'Tech Corp', email: 'tech@supplies.com', telefono: '555-1001', direccion: 'Calle Industrial 100', categoria: 'Electrónica' },
  { id: 'PRV-002', nombre: 'Office Plus', empresa: 'Office Solutions', email: 'info@officeplus.com', telefono: '555-1002', direccion: 'Av. Comercial 200', categoria: 'Hogar' },
  { id: 'PRV-003', nombre: 'Sports World', empresa: 'Sports Global', email: 'ventas@sportsworld.com', telefono: '555-1003', direccion: 'Plaza Deportiva 300', categoria: 'Deportes' }
];

const mockPurchases: Purchase[] = [
  { id: 'COM-001', proveedor: 'Tech Supplies Inc', fecha: '2026-04-25', productos: 'Laptops HP x10', cantidad: 10, total: 6500 },
  { id: 'COM-002', proveedor: 'Office Plus', fecha: '2026-04-20', productos: 'Sillas Oficina x5', cantidad: 5, total: 600 },
  { id: 'COM-003', proveedor: 'Tech Supplies Inc', fecha: '2026-04-15', productos: 'Monitores Samsung x8', cantidad: 8, total: 1200 }
];

export function Proveedores() {
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [purchases, setPurchases] = useState(mockPurchases);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    categoria: 'Electrónica'
  });
  const [purchaseData, setPurchaseData] = useState({
    proveedor: '',
    productos: '',
    cantidad: '',
    total: ''
  });

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        nombre: supplier.nombre,
        empresa: supplier.empresa,
        email: supplier.email,
        telefono: supplier.telefono,
        direccion: supplier.direccion,
        categoria: supplier.categoria
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        direccion: '',
        categoria: 'Electrónica'
      });
    }
    setShowModal(true);
  };

  const handleSaveSupplier = () => {
    if (!formData.nombre || !formData.email) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    if (editingSupplier) {
      setSuppliers(suppliers.map((s) =>
        s.id === editingSupplier.id ? { ...s, ...formData } : s
      ));
      toast.success('Proveedor actualizado correctamente');
    } else {
      const newSupplier: Supplier = {
        id: `PRV-${(suppliers.length + 1).toString().padStart(3, '0')}`,
        ...formData
      };
      setSuppliers([...suppliers, newSupplier]);
      toast.success('Proveedor registrado correctamente');
    }

    setShowModal(false);
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== id));
    toast.success('Proveedor eliminado');
  };

  const handleRegisterPurchase = () => {
    if (!purchaseData.proveedor || !purchaseData.productos || !purchaseData.cantidad || !purchaseData.total) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const newPurchase: Purchase = {
      id: `COM-${(purchases.length + 1).toString().padStart(3, '0')}`,
      proveedor: purchaseData.proveedor,
      fecha: new Date().toISOString().split('T')[0],
      productos: purchaseData.productos,
      cantidad: parseInt(purchaseData.cantidad),
      total: parseFloat(purchaseData.total)
    };

    setPurchases([newPurchase, ...purchases]);
    toast.success('Compra registrada correctamente');
    setShowPurchaseModal(false);
    setPurchaseData({ proveedor: '', productos: '', cantidad: '', total: '' });
  };

  const supplierColumns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Proveedor',
      accessor: 'nombre',
      cell: (value: string, row: Supplier) => (
        <div>
          <p className="text-foreground">{value}</p>
          <p className="text-muted-foreground">{row.empresa}</p>
        </div>
      )
    },
    {
      header: 'Contacto',
      accessor: 'email',
      cell: (value: string, row: Supplier) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-foreground">
            <Mail className="w-4 h-4 text-muted-foreground" />
            {value}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            {row.telefono}
          </div>
        </div>
      )
    },
    { header: 'Dirección', accessor: 'direccion' },
    {
      header: 'Categoría',
      accessor: 'categoria',
      cell: (value: string) => <Badge variant="primary">{value}</Badge>
    },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (value: string, row: Supplier) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteSupplier(value)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const purchaseColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Proveedor', accessor: 'proveedor' },
    { header: 'Fecha', accessor: 'fecha' },
    { header: 'Productos', accessor: 'productos' },
    { header: 'Cantidad', accessor: 'cantidad' },
    {
      header: 'Total',
      accessor: 'total',
      cell: (value: number) => `$${value.toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Gestión de Proveedores</h1>
          <p className="text-muted-foreground">Administra proveedores y compras</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowPurchaseModal(true)}>
            <ShoppingBag className="w-5 h-5" />
            Registrar Compra
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5" />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Total Proveedores</p>
              <h2 className="text-foreground">{suppliers.length}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Compras Registradas</p>
              <h2 className="text-foreground">{purchases.length}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Total Invertido</p>
              <h2 className="text-foreground">${purchases.reduce((acc, p) => acc + p.total, 0).toFixed(2)}</h2>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Proveedores">
        <div className="mb-6">
          <Input
            placeholder="Buscar por nombre, empresa o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table columns={supplierColumns} data={filteredSuppliers} />
      </Card>

      <Card title="Historial de Compras">
        <Table columns={purchaseColumns} data={purchases} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSupplier}>
              {editingSupplier ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Proveedor"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre comercial"
          />
          <Input
            label="Empresa"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
            placeholder="Razón social"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@proveedor.com"
          />
          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="555-0000"
          />
          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Dirección completa"
          />
          <Input
            label="Categoría"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            placeholder="Electrónica, Hogar, etc."
          />
        </div>
      </Modal>

      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Registrar Compra"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterPurchase}>
              Registrar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Proveedor"
            value={purchaseData.proveedor}
            onChange={(e) => setPurchaseData({ ...purchaseData, proveedor: e.target.value })}
            placeholder="Nombre del proveedor"
          />
          <Input
            label="Productos"
            value={purchaseData.productos}
            onChange={(e) => setPurchaseData({ ...purchaseData, productos: e.target.value })}
            placeholder="Descripción de productos"
          />
          <Input
            label="Cantidad"
            type="number"
            value={purchaseData.cantidad}
            onChange={(e) => setPurchaseData({ ...purchaseData, cantidad: e.target.value })}
            placeholder="0"
          />
          <Input
            label="Total"
            type="number"
            value={purchaseData.total}
            onChange={(e) => setPurchaseData({ ...purchaseData, total: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </Modal>
    </div>
  );
}
