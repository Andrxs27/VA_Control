import { useState } from 'react';
import { Plus, Edit, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

interface ServiceOrder {
  id: string;
  fecha: string;
  cliente: string;
  equipo: string;
  problema: string;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  tecnico: string;
  diagnostico: string;
  precio: number;
  garantia: boolean;
}

const mockOrders: ServiceOrder[] = [
  { id: 'OS-001', fecha: '2026-04-28', cliente: 'Juan Pérez', equipo: 'Laptop HP', problema: 'No enciende', estado: 'en_proceso', tecnico: 'Carlos Tech', diagnostico: 'Batería defectuosa', precio: 120, garantia: true },
  { id: 'OS-002', fecha: '2026-04-27', cliente: 'María García', equipo: 'iPhone 12', problema: 'Pantalla rota', estado: 'completada', tecnico: 'Ana Repair', diagnostico: 'Reemplazo de pantalla', precio: 250, garantia: false },
  { id: 'OS-003', fecha: '2026-04-27', cliente: 'Luis Rodríguez', equipo: 'PC Desktop', problema: 'Lento', estado: 'pendiente', tecnico: 'Sin asignar', diagnostico: '', precio: 0, garantia: false },
  { id: 'OS-004', fecha: '2026-04-26', cliente: 'Ana Martínez', equipo: 'Tablet Samsung', problema: 'No carga', estado: 'completada', tecnico: 'Carlos Tech', diagnostico: 'Puerto USB dañado', precio: 85, garantia: true }
];

const tecnicos = [
  { value: 'Sin asignar', label: 'Sin asignar' },
  { value: 'Carlos Tech', label: 'Carlos Tech' },
  { value: 'Ana Repair', label: 'Ana Repair' },
  { value: 'Luis Fix', label: 'Luis Fix' }
];

const estadoOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' }
];

export function ServicioTecnico() {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [formData, setFormData] = useState({
    cliente: '',
    equipo: '',
    problema: '',
    tecnico: 'Sin asignar',
    diagnostico: '',
    precio: '',
    garantia: false
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.equipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (order?: ServiceOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        cliente: order.cliente,
        equipo: order.equipo,
        problema: order.problema,
        tecnico: order.tecnico,
        diagnostico: order.diagnostico,
        precio: order.precio.toString(),
        garantia: order.garantia
      });
    } else {
      setEditingOrder(null);
      setFormData({
        cliente: '',
        equipo: '',
        problema: '',
        tecnico: 'Sin asignar',
        diagnostico: '',
        precio: '',
        garantia: false
      });
    }
    setShowModal(true);
  };

  const handleSaveOrder = () => {
    if (!formData.cliente || !formData.equipo || !formData.problema) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    if (editingOrder) {
      setOrders(orders.map((o) =>
        o.id === editingOrder.id
          ? {
              ...o,
              cliente: formData.cliente,
              equipo: formData.equipo,
              problema: formData.problema,
              tecnico: formData.tecnico,
              diagnostico: formData.diagnostico,
              precio: formData.precio ? parseFloat(formData.precio) : 0,
              garantia: formData.garantia,
              estado: formData.tecnico !== 'Sin asignar' ? 'en_proceso' as const : 'pendiente' as const
            }
          : o
      ));
      toast.success('Orden actualizada correctamente');
    } else {
      const newOrder: ServiceOrder = {
        id: `OS-${(orders.length + 1).toString().padStart(3, '0')}`,
        fecha: new Date().toISOString().split('T')[0],
        cliente: formData.cliente,
        equipo: formData.equipo,
        problema: formData.problema,
        estado: 'pendiente',
        tecnico: formData.tecnico,
        diagnostico: formData.diagnostico,
        precio: formData.precio ? parseFloat(formData.precio) : 0,
        garantia: formData.garantia
      };
      setOrders([newOrder, ...orders]);
      toast.success('Orden de servicio creada');
    }

    setShowModal(false);
  };

  const handleChangeStatus = (id: string, estado: ServiceOrder['estado']) => {
    setOrders(orders.map((o) => o.id === id ? { ...o, estado } : o));
    toast.success(`Orden ${estado === 'completada' ? 'completada' : estado === 'cancelada' ? 'cancelada' : 'actualizada'}`);
  };

  const columns = [
    { header: 'Orden', accessor: 'id' },
    { header: 'Fecha', accessor: 'fecha' },
    { header: 'Cliente', accessor: 'cliente' },
    { header: 'Equipo', accessor: 'equipo' },
    { header: 'Problema', accessor: 'problema' },
    { header: 'Técnico', accessor: 'tecnico' },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (value: string) => (
        <Badge
          variant={
            value === 'completada' ? 'success' :
            value === 'en_proceso' ? 'primary' :
            value === 'cancelada' ? 'destructive' :
            'default'
          }
        >
          {value === 'completada' ? 'Completada' :
           value === 'en_proceso' ? 'En Proceso' :
           value === 'cancelada' ? 'Cancelada' :
           'Pendiente'}
        </Badge>
      )
    },
    {
      header: 'Garantía',
      accessor: 'garantia',
      cell: (value: boolean) => (
        value ? <Badge variant="success">Sí</Badge> : <Badge variant="default">No</Badge>
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (value: string, row: ServiceOrder) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          {row.estado === 'en_proceso' && (
            <Button size="sm" variant="success" onClick={() => handleChangeStatus(value, 'completada')}>
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          {row.estado !== 'cancelada' && row.estado !== 'completada' && (
            <Button size="sm" variant="destructive" onClick={() => handleChangeStatus(value, 'cancelada')}>
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Servicio Técnico</h1>
          <p className="text-muted-foreground">Gestión de órdenes de reparación</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5" />
          Nueva Orden
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Pendientes</p>
              <h2 className="text-foreground">{orders.filter(o => o.estado === 'pendiente').length}</h2>
            </div>
            <Clock className="w-8 h-8 text-warning" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">En Proceso</p>
              <h2 className="text-foreground">{orders.filter(o => o.estado === 'en_proceso').length}</h2>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Completadas</p>
              <h2 className="text-foreground">{orders.filter(o => o.estado === 'completada').length}</h2>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Con Garantía</p>
              <h2 className="text-foreground">{orders.filter(o => o.garantia).length}</h2>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por orden, cliente o equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={estadoOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        <Table columns={columns} data={filteredOrders} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingOrder ? 'Editar Orden' : 'Nueva Orden de Servicio'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOrder}>
              {editingOrder ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cliente"
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            placeholder="Nombre del cliente"
          />
          <Input
            label="Equipo"
            value={formData.equipo}
            onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
            placeholder="Ej: Laptop HP"
          />
          <Input
            label="Problema Reportado"
            value={formData.problema}
            onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
            placeholder="Describe el problema"
            className="md:col-span-2"
          />
          <Select
            label="Técnico Asignado"
            options={tecnicos}
            value={formData.tecnico}
            onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
          />
          <Input
            label="Precio Estimado"
            type="number"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Diagnóstico"
            value={formData.diagnostico}
            onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
            placeholder="Diagnóstico técnico"
            className="md:col-span-2"
          />
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="garantia"
              checked={formData.garantia}
              onChange={(e) => setFormData({ ...formData, garantia: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="garantia" className="text-foreground cursor-pointer">
              Servicio con garantía
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
