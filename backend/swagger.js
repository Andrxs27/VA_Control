const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VA_Control API',
      version: '1.0.0',
      description:
        'Documentación de la API REST de VA_Control: sistema de gestión de ventas, ' +
        'órdenes de servicio, inventario, clientes y usuarios para negocios de reparación/servicio técnico.',
      contact: {
        name: 'VA_Control'
      }
    },
    servers: [
      {
        url: 'https://vacontrol-production.up.railway.app',
        description: 'Servidor de producción (Railway)'
      },
      {
        url: 'http://localhost:8080',
        description: 'Servidor local de desarrollo'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Autenticación y sesión del usuario' },
      { name: 'Usuarios', description: 'Gestión de usuarios del sistema (admin, vendedor, técnico)' },
      { name: 'Clientes', description: 'Gestión de clientes' },
      { name: 'Productos', description: 'Catálogo de productos' },
      { name: 'Ventas', description: 'Registro y gestión de ventas' },
      { name: 'Órdenes de servicio', description: 'Órdenes de reparación / servicio técnico' },
      { name: 'Facturas', description: 'Facturación de ventas y órdenes de servicio' },
      { name: 'Inventario', description: 'Stock, alertas y movimientos de inventario' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensaje descriptivo del error' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@vacontrol.com' },
            password: { type: 'string', format: 'password', example: '123456' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Bienvenido' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            usuario: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'Andrés Pérez' },
                email: { type: 'string', example: 'admin@vacontrol.com' },
                rol: { type: 'string', enum: ['admin', 'vendedor', 'tecnico'], example: 'admin' }
              }
            }
          }
        },
        CambiarPasswordRequest: {
          type: 'object',
          required: ['passwordActual', 'passwordNueva'],
          properties: {
            passwordActual: { type: 'string', example: '123456' },
            passwordNueva: { type: 'string', example: 'nuevaClave123' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Andrés Pérez' },
            email: { type: 'string', example: 'andres@vacontrol.com' },
            rol: { type: 'string', enum: ['admin', 'vendedor', 'tecnico'], example: 'vendedor' },
            activo: { type: 'boolean', example: true }
          }
        },
        UsuarioInput: {
          type: 'object',
          required: ['nombre', 'email', 'rol'],
          properties: {
            nombre: { type: 'string', example: 'Andrés Pérez' },
            email: { type: 'string', example: 'andres@vacontrol.com' },
            password: { type: 'string', example: 'claveSegura123', description: 'Obligatoria al crear, opcional al editar' },
            rol: { type: 'string', enum: ['admin', 'vendedor', 'tecnico'], example: 'vendedor' }
          }
        },
        Cliente: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            identificacion: { type: 'string', example: '1098765432' },
            nombre: { type: 'string', example: 'Juan Gómez' },
            email: { type: 'string', nullable: true, example: 'juan@correo.com' },
            telefono: { type: 'string', nullable: true, example: '3001234567' },
            direccion: { type: 'string', nullable: true, example: 'Calle 10 # 20-30' },
            tipo: { type: 'string', enum: ['particular', 'empresa'], example: 'particular' },
            notas: { type: 'string', nullable: true },
            activo: { type: 'boolean', example: true },
            creado_en: { type: 'string', format: 'date-time' },
            actualizado_en: { type: 'string', format: 'date-time' }
          }
        },
        ClienteInput: {
          type: 'object',
          required: ['nombre', 'identificacion'],
          properties: {
            identificacion: { type: 'string', example: '1098765432' },
            nombre: { type: 'string', example: 'Juan Gómez' },
            email: { type: 'string', example: 'juan@correo.com' },
            telefono: { type: 'string', example: '3001234567' },
            direccion: { type: 'string', example: 'Calle 10 # 20-30' },
            tipo: { type: 'string', enum: ['particular', 'empresa'], example: 'particular' },
            notas: { type: 'string', example: 'Cliente frecuente' }
          }
        },
        Producto: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            sku: { type: 'string', example: 'PROD-001' },
            nombre: { type: 'string', example: 'Pantalla Samsung A52' },
            descripcion: { type: 'string', example: 'Pantalla original OLED' },
            categoria: { type: 'string', enum: ['electronicos', 'repuestos', 'servicios'], example: 'repuestos' },
            stock: { type: 'integer', example: 15 },
            stock_minimo: { type: 'integer', example: 5 },
            precio_venta: { type: 'number', format: 'float', example: 85000 },
            activo: { type: 'boolean', example: true },
            creado_en: { type: 'string', format: 'date-time' },
            actualizado_en: { type: 'string', format: 'date-time' }
          }
        },
        ProductoInput: {
          type: 'object',
          required: ['sku', 'nombre', 'categoria', 'precio_venta'],
          properties: {
            sku: { type: 'string', example: 'PROD-001' },
            nombre: { type: 'string', example: 'Pantalla Samsung A52' },
            descripcion: { type: 'string', example: 'Pantalla original OLED' },
            categoria: { type: 'string', enum: ['electronicos', 'repuestos', 'servicios'], example: 'repuestos' },
            stock: { type: 'integer', example: 15 },
            stock_minimo: { type: 'integer', example: 5 },
            precio_venta: { type: 'number', format: 'float', example: 85000 }
          }
        },
        OrdenServicioInput: {
          type: 'object',
          required: ['cliente_id', 'equipo'],
          properties: {
            cliente_id: { type: 'integer', example: 1 },
            tecnico_id: { type: 'integer', example: 3 },
            equipo: { type: 'string', example: 'Portátil' },
            marca: { type: 'string', example: 'HP' },
            modelo: { type: 'string', example: 'Pavilion 14' },
            serial_equipo: { type: 'string', example: 'SN-998877' },
            falla: { type: 'string', example: 'No enciende' },
            diagnostico: { type: 'string', example: 'Fuente de poder dañada' },
            estado: { type: 'string', example: 'en_proceso' },
            tipo_entrega: { type: 'string', example: 'taller' },
            fecha_promesa: { type: 'string', format: 'date', example: '2026-07-01' },
            costo_servicio: { type: 'number', format: 'float', example: 60000 },
            notas: { type: 'string', example: 'Cliente autoriza diagnóstico' }
          }
        },
        OrdenServicio: {
          allOf: [
            { $ref: '#/components/schemas/OrdenServicioInput' },
            {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                creado_en: { type: 'string', format: 'date-time' },
                actualizado_en: { type: 'string', format: 'date-time' }
              }
            }
          ]
        },
        InventarioResumen: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 3 },
            sku: { type: 'string', example: 'PROD-001' },
            nombre: { type: 'string', example: 'Pantalla Samsung A52' },
            categoria: { type: 'string', example: 'repuestos' },
            stock: { type: 'integer', example: 4 },
            stock_minimo: { type: 'integer', example: 5 },
            activo: { type: 'boolean', example: true },
            actualizado_en: { type: 'string', format: 'date-time' },
            estado_stock: { type: 'string', enum: ['sin_stock', 'stock_bajo', 'normal'], example: 'stock_bajo' },
            ultimo_movimiento: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        MovimientoInventarioInput: {
          type: 'object',
          required: ['producto_id', 'tipo', 'cantidad'],
          properties: {
            producto_id: { type: 'integer', example: 3 },
            tipo: { type: 'string', enum: ['entrada', 'salida', 'ajuste'], example: 'entrada' },
            cantidad: { type: 'integer', example: 10, description: 'En "ajuste" representa el nuevo valor absoluto de stock' },
            motivo: { type: 'string', example: 'Compra a proveedor' }
          }
        },
        MovimientoInventario: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            tipo: { type: 'string', enum: ['entrada', 'salida', 'ajuste'], example: 'entrada' },
            cantidad: { type: 'integer', example: 10 },
            stock_antes: { type: 'integer', example: 5 },
            stock_despues: { type: 'integer', example: 15 },
            motivo: { type: 'string', nullable: true },
            creado_en: { type: 'string', format: 'date-time' },
            producto_id: { type: 'integer', example: 3 },
            producto_sku: { type: 'string', example: 'PROD-001' },
            producto_nombre: { type: 'string', example: 'Pantalla Samsung A52' },
            usuario_nombre: { type: 'string', nullable: true, example: 'Andrés Pérez' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;