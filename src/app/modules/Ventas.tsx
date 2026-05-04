import { useState } from 'react';
import { Plus, FileText, CreditCard, Search, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

interface Sale {
  id: string;
  fecha: string;
  cliente: string;
  total: number;
  impuesto: number;
  subtotal: number;
  estado: 'pagada' | 'pendiente' | 'anulada';
  metodoPago: string;
}

const mockSales: Sale[] = [
  { id: 'FAC-001', fecha: '2026-04-28', cliente: 'Juan Pérez', subtotal: 850, impuesto: 136, total: 986, estado: 'pagada', metodoPago: 'Tarjeta' },
  { id: 'FAC-002', fecha: '2026-04-27', cliente: 'María García', subtotal: 450, impuesto: 72, total: 522, estado: 'pagada', metodoPago: 'Efectivo' },
  { id: 'FAC-003', fecha: '2026-04-27', cliente: 'Carlos López', subtotal: 1200, impuesto: 192, total: 1392, estado: 'pendiente', metodoPago: 'Transferencia' },
  { id: 'FAC-004', fecha: '2026-04-26', cliente: 'Ana Martínez', subtotal: 320, impuesto: 51.2, total: 371.2, estado: 'pagada', metodoPago: 'Tarjeta' },
  { id: 'FAC-005', fecha: '2026-04-25', cliente: 'Luis Rodríguez', subtotal: 680, impuesto: 108.8, total: 788.8, estado: 'anulada', metodoPago: 'Efectivo' }
];

const estadoOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'anulada', label: 'Anulada' }
];

export function Ventas() {
  const [sales, setSales] = useState(mockSales);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    cliente: '',
    productos: '',
    subtotal: '',
    impuesto: '16',
    metodoPago: 'Efectivo'
  });

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || sale.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSale = () => {
    if (!formData.cliente || !formData.subtotal) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    const subtotal = parseFloat(formData.subtotal);
    const impuesto = subtotal * (parseFloat(formData.impuesto) / 100);
    const total = subtotal + impuesto;

    const newSale: Sale = {
      id: `FAC-${(sales.length + 1).toString().padStart(3, '0')}`,
      fecha: new Date().toISOString().split('T')[0],
      cliente: formData.cliente,
      subtotal,
      impuesto,
      total,
      estado: 'pendiente',
      metodoPago: formData.metodoPago
    };

    setSales([newSale, ...sales]);
    setShowModal(false);
    setShowPaymentModal(true);
    setSelectedSale(newSale);
    toast.success('Factura generada correctamente');
  };

  const handleRegisterPayment = () => {
    if (selectedSale) {
      setSales(sales.map((s) =>
        s.id === selectedSale.id ? { ...s, estado: 'pagada' as const } : s
      ));
      toast.success('Pago registrado correctamente');
      setShowPaymentModal(false);
      setSelectedSale(null);
    }
  };

  const handleCancelSale = (id: string) => {
    setSales(sales.map((s) =>
      s.id === id ? { ...s, estado: 'anulada' as const } : s
    ));
    toast.success('Nota de crédito generada');
  };

  const columns = [
    { header: 'Factura', accessor: 'id' },
    { header: 'Fecha', accessor: 'fecha' },
    { header: 'Cliente', accessor: 'cliente' },
    {
      header: 'Subtotal',
      accessor: 'subtotal',
      cell: (value: number) => `$${value.toFixed(2)}`
    },
    {
      header: 'Impuesto',
      accessor: 'impuesto',
      cell: (value: number) => `$${value.toFixed(2)}`
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (value: number) => `$${value.toFixed(2)}`
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (value: string) => (
        <Badge
          variant={
            value === 'pagada' ? 'success' :
            value === 'pendiente' ? 'warning' :
            'destructive'
          }
        >
          {value === 'pagada' ? 'Pagada' : value === 'pendiente' ? 'Pendiente' : 'Anulada'}
        </Badge>
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (value: string, row: Sale) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.info(`Descargar ${value}`)}>
            <Download className="w-4 h-4" />
          </Button>
          {row.estado === 'pagada' && (
            <Button size="sm" variant="destructive" onClick={() => handleCancelSale(value)}>
              Anular
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
          <h1 className="text-foreground mb-2">Gestión de Ventas</h1>
          <p className="text-muted-foreground">Facturación y control de pagos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" />
          Nueva Factura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Total Facturado</p>
              <h2 className="text-foreground">${sales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}</h2>
            </div>
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Pagos Recibidos</p>
              <h2 className="text-foreground">
                ${sales.filter(s => s.estado === 'pagada').reduce((acc, s) => acc + s.total, 0).toFixed(2)}
              </h2>
            </div>
            <CreditCard className="w-8 h-8 text-success" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Pendientes</p>
              <h2 className="text-foreground">
                ${sales.filter(s => s.estado === 'pendiente').reduce((acc, s) => acc + s.total, 0).toFixed(2)}
              </h2>
            </div>
            <FileText className="w-8 h-8 text-warning" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por factura o cliente..."
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

        <Table columns={columns} data={filteredSales} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Factura"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSale}>
              Generar Factura
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Cliente"
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            placeholder="Nombre del cliente"
          />
          <Input
            label="Productos (separados por coma)"
            value={formData.productos}
            onChange={(e) => setFormData({ ...formData, productos: e.target.value })}
            placeholder="Producto 1, Producto 2..."
          />
          <Input
            label="Subtotal"
            type="number"
            value={formData.subtotal}
            onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Impuesto (%)"
            type="number"
            value={formData.impuesto}
            onChange={(e) => setFormData({ ...formData, impuesto: e.target.value })}
          />
          <Select
            label="Método de Pago"
            options={[
              { value: 'Efectivo', label: 'Efectivo' },
              { value: 'Tarjeta', label: 'Tarjeta' },
              { value: 'Transferencia', label: 'Transferencia' }
            ]}
            value={formData.metodoPago}
            onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
          />
          {formData.subtotal && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-foreground mb-2">
                Total a Pagar: ${(parseFloat(formData.subtotal) * (1 + parseFloat(formData.impuesto) / 100)).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Registrar Pago"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterPayment}>
              Confirmar Pago
            </Button>
          </>
        }
      >
        {selectedSale && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-foreground mb-4">Detalle de Factura</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Factura:</span>
                  <span className="text-foreground">{selectedSale.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="text-foreground">{selectedSale.cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground">${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuesto:</span>
                  <span className="text-foreground">${selectedSale.impuesto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-foreground">Total:</span>
                  <span className="text-foreground">${selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              ¿Confirmar el pago de ${selectedSale.total.toFixed(2)} mediante {selectedSale.metodoPago}?
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
