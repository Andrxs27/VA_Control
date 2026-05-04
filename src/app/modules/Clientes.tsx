import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

interface Customer {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  compras: number;
  ultimoContacto: string;
}

const mockCustomers: Customer[] = [
  { id: 'CLI-001', nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '555-0001', direccion: 'Calle 123', compras: 5, ultimoContacto: '2026-04-28' },
  { id: 'CLI-002', nombre: 'María García', email: 'maria@email.com', telefono: '555-0002', direccion: 'Av. Principal 456', compras: 12, ultimoContacto: '2026-04-27' },
  { id: 'CLI-003', nombre: 'Carlos López', email: 'carlos@email.com', telefono: '555-0003', direccion: 'Plaza Central 789', compras: 3, ultimoContacto: '2026-04-25' },
  { id: 'CLI-004', nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '555-0004', direccion: 'Calle Norte 321', compras: 8, ultimoContacto: '2026-04-26' }
];

export function Clientes() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [quoteData, setQuoteData] = useState({
    productos: '',
    cantidad: '',
    precio: ''
  });

  const filteredCustomers = customers.filter((customer) =>
    customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.telefono.includes(searchTerm)
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        nombre: customer.nombre,
        email: customer.email,
        telefono: customer.telefono,
        direccion: customer.direccion
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveCustomer = () => {
    if (!formData.nombre || !formData.email) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    if (editingCustomer) {
      setCustomers(customers.map((c) =>
        c.id === editingCustomer.id
          ? { ...c, ...formData }
          : c
      ));
      toast.success('Cliente actualizado correctamente');
    } else {
      const newCustomer: Customer = {
        id: `CLI-${(customers.length + 1).toString().padStart(3, '0')}`,
        ...formData,
        compras: 0,
        ultimoContacto: new Date().toISOString().split('T')[0]
      };
      setCustomers([...customers, newCustomer]);
      toast.success('Cliente creado correctamente');
    }

    setShowModal(false);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
    toast.success('Cliente eliminado');
  };

  const handleCreateQuote = () => {
    if (!quoteData.productos || !quoteData.cantidad || !quoteData.precio) {
      toast.error('Por favor completa todos los campos de la cotización');
      return;
    }

    toast.success(`Cotización creada para ${selectedCustomer?.nombre}`);
    setShowQuoteModal(false);
    setQuoteData({ productos: '', cantidad: '', precio: '' });
  };

  const handleContactTracking = (customer: Customer) => {
    setCustomers(customers.map((c) =>
      c.id === customer.id
        ? { ...c, ultimoContacto: new Date().toISOString().split('T')[0] }
        : c
    ));
    toast.success('Contacto registrado');
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    {
      header: 'Contacto',
      accessor: 'email',
      cell: (value: string, row: Customer) => (
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
      header: 'Compras',
      accessor: 'compras',
      cell: (value: number) => <Badge variant="primary">{value}</Badge>
    },
    { header: 'Último Contacto', accessor: 'ultimoContacto' },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (value: string, row: Customer) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setSelectedCustomer(row); setShowQuoteModal(true); }}>
            <FileText className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleContactTracking(row)}>
            <Phone className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteCustomer(value)}>
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
          <h1 className="text-foreground mb-2">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra tu cartera de clientes</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Total Clientes</p>
              <h2 className="text-foreground">{customers.length}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Compras Totales</p>
              <h2 className="text-foreground">{customers.reduce((acc, c) => acc + c.compras, 0)}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Promedio Compras</p>
              <h2 className="text-foreground">
                {(customers.reduce((acc, c) => acc + c.compras, 0) / customers.length).toFixed(1)}
              </h2>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table columns={columns} data={filteredCustomers} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCustomer}>
              {editingCustomer ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre Completo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre del cliente"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@ejemplo.com"
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
        </div>
      </Modal>

      <Modal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        title={`Crear Cotización - ${selectedCustomer?.nombre}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowQuoteModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateQuote}>
              Generar Cotización
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Productos"
            value={quoteData.productos}
            onChange={(e) => setQuoteData({ ...quoteData, productos: e.target.value })}
            placeholder="Descripción de productos"
          />
          <Input
            label="Cantidad"
            type="number"
            value={quoteData.cantidad}
            onChange={(e) => setQuoteData({ ...quoteData, cantidad: e.target.value })}
            placeholder="0"
          />
          <Input
            label="Precio Unitario"
            type="number"
            value={quoteData.precio}
            onChange={(e) => setQuoteData({ ...quoteData, precio: e.target.value })}
            placeholder="0.00"
          />
          {quoteData.cantidad && quoteData.precio && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-foreground">
                Total: ${(parseFloat(quoteData.cantidad) * parseFloat(quoteData.precio)).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
