import { useState } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'cliente';
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
  ultimoAcceso: string;
}

const mockUsers: User[] = [
  { id: 'USR-001', nombre: 'Valentina Andrés', email: 'admin@vacontrol.com', rol: 'admin', estado: 'activo', fechaCreacion: '2026-01-01', ultimoAcceso: '2026-04-28' },
  { id: 'USR-002', nombre: 'Carlos Vendedor', email: 'carlos@vacontrol.com', rol: 'vendedor', estado: 'activo', fechaCreacion: '2026-02-15', ultimoAcceso: '2026-04-27' },
  { id: 'USR-003', nombre: 'Ana López', email: 'ana@vacontrol.com', rol: 'vendedor', estado: 'activo', fechaCreacion: '2026-03-10', ultimoAcceso: '2026-04-26' },
  { id: 'USR-004', nombre: 'Pedro Cliente', email: 'pedro@email.com', rol: 'cliente', estado: 'inactivo', fechaCreacion: '2026-04-01', ultimoAcceso: '2026-04-15' }
];

const permissions = {
  admin: ['Inventario', 'Ventas', 'Servicio Técnico', 'Clientes', 'Proveedores', 'Reportes', 'Usuarios'],
  vendedor: ['Inventario (Ver)', 'Ventas', 'Servicio Técnico', 'Clientes'],
  cliente: ['Ver Productos', 'Ver Cotizaciones']
};

export function Usuarios() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'vendedor' as 'admin' | 'vendedor' | 'cliente'
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '',
        rol: user.rol
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'vendedor'
      });
    }
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (!formData.nombre || !formData.email || (!editingUser && !formData.password)) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (editingUser) {
      setUsers(users.map((u) =>
        u.id === editingUser.id
          ? { ...u, nombre: formData.nombre, email: formData.email, rol: formData.rol }
          : u
      ));
      toast.success('Usuario actualizado correctamente');
    } else {
      const newUser: User = {
        id: `USR-${(users.length + 1).toString().padStart(3, '0')}`,
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
        estado: 'activo',
        fechaCreacion: new Date().toISOString().split('T')[0],
        ultimoAcceso: '-'
      };
      setUsers([...users, newUser]);
      toast.success('Usuario creado correctamente');
    }

    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    setUsers(users.map((u) =>
      u.id === id
        ? { ...u, estado: u.estado === 'activo' ? 'inactivo' as const : 'activo' as const }
        : u
    ));
    toast.success('Estado del usuario actualizado');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success('Usuario eliminado');
  };

  const roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'admin', label: 'Administrador' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'cliente', label: 'Cliente' }
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Rol',
      accessor: 'rol',
      cell: (value: string) => (
        <Badge
          variant={value === 'admin' ? 'primary' : value === 'vendedor' ? 'success' : 'default'}
        >
          {value === 'admin' ? 'Administrador' : value === 'vendedor' ? 'Vendedor' : 'Cliente'}
        </Badge>
      )
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (value: string) => (
        <Badge variant={value === 'activo' ? 'success' : 'default'}>
          {value === 'activo' ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    { header: 'Fecha Creación', accessor: 'fechaCreacion' },
    { header: 'Último Acceso', accessor: 'ultimoAcceso' },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (value: string, row: User) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setSelectedUser(row); setShowPermissionsModal(true); }}
          >
            <Shield className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={row.estado === 'activo' ? 'warning' : 'success'}
            onClick={() => handleToggleStatus(value)}
          >
            {row.estado === 'activo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(value)}>
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
          <h1 className="text-foreground mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra usuarios y permisos</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Total Usuarios</p>
              <h2 className="text-foreground">{users.length}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Administradores</p>
              <h2 className="text-foreground">{users.filter(u => u.rol === 'admin').length}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Vendedores</p>
              <h2 className="text-foreground">{users.filter(u => u.rol === 'vendedor').length}</h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">Usuarios Activos</p>
              <h2 className="text-foreground">{users.filter(u => u.estado === 'activo').length}</h2>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={roleOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>

        <Table columns={columns} data={filteredUsers} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre Completo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre del usuario"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@ejemplo.com"
          />
          {!editingUser && (
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          )}
          <Select
            label="Rol"
            options={roleOptions.slice(1)}
            value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'admin' | 'vendedor' | 'cliente' })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={`Permisos - ${selectedUser?.nombre}`}
        footer={
          <Button onClick={() => setShowPermissionsModal(false)}>
            Cerrar
          </Button>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-foreground mb-2">Rol: {selectedUser.rol === 'admin' ? 'Administrador' : selectedUser.rol === 'vendedor' ? 'Vendedor' : 'Cliente'}</p>
              <p className="text-muted-foreground">Los permisos se asignan según el rol del usuario</p>
            </div>
            <div>
              <h3 className="text-foreground mb-3">Permisos Asignados:</h3>
              <div className="space-y-2">
                {permissions[selectedUser.rol].map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-success/10 rounded-lg">
                    <Shield className="w-4 h-4 text-success" />
                    <span className="text-foreground">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
