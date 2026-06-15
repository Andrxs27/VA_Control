/* ==========================================================================
   config.js — VA Control
   Maneja: Tema (oscuro/claro), Idioma (ES/EN), Menú de Configuración, Logout
   Incluir en TODOS los módulos DESPUÉS de auth.js
   ========================================================================== */

// ==================== TRADUCCIONES ====================
const VA_TRADUCCIONES = {
  es: {
    // Sidebar - Nav sections
    'nav_principal': 'Principal',
    'nav_operaciones': 'Operaciones',
    'nav_administracion': 'Administración',
    // Sidebar - Nav items
    'nav_dashboard': 'Dashboard',
    'nav_productos': 'Productos',
    'nav_inventario': 'Inventario',
    'nav_ventas': 'Ventas',
    'nav_ordenes': 'Órdenes de Servicio',
    'nav_facturas': 'Facturas',
    'nav_clientes': 'Clientes',
    'nav_usuarios': 'Usuarios',
    'nav_reportes': 'Reportes',
    // Sidebar - Logo
    'logo_sub': 'Sistema de Gestión',
    // Topbar
    'topbar_alertas': 'Alertas de stock',
    'topbar_config': 'Configuración',
    // Menú configuración
    'cfg_tema': 'Tema',
    'cfg_tema_claro': 'Modo Claro',
    'cfg_tema_oscuro': 'Modo Oscuro',
    'cfg_idioma': 'Idioma',
    'cfg_cerrar': 'Cerrar Sesión',
    // Modal logout
    'logout_titulo': '¿Cerrar sesión?',
    'logout_msg': 'Se cerrará tu sesión actual. Tendrás que volver a iniciar sesión para acceder al sistema.',
    'logout_confirmar': 'Sí, cerrar sesión',
    'logout_cancelar': 'Cancelar',
    // Páginas - títulos
    'titulo_dashboard': 'Dashboard',
    'titulo_productos': 'Productos',
    'titulo_inventario': 'Inventario',
    'titulo_ventas': 'Ventas',
    'titulo_ordenes': 'Órdenes de Servicio',
    'titulo_facturas': 'Facturas',
    'titulo_clientes': 'Clientes',
    'titulo_usuarios': 'Usuarios',
    'titulo_reportes': 'Reportes',
    // Botones comunes
    'btn_cancelar': 'Cancelar',
    'btn_guardar': 'Guardar',
    'btn_confirmar': 'Confirmar',
    'btn_cerrar': 'Cerrar',
    'btn_nuevo_producto': 'Nuevo Producto',
    'btn_nuevo_cliente': 'Nuevo Cliente',
    'btn_nuevo_usuario': 'Nuevo Usuario',
    'btn_nueva_venta': 'Nueva Venta',
    'btn_nueva_orden': 'Nueva Orden',
    'btn_emitir_factura': 'Emitir Factura',
    'btn_registrar_mov': 'Registrar Movimiento',
    'btn_exportar_excel': 'Exportar Excel',
    'btn_crear_cliente': 'Crear Cliente',
    'btn_crear_usuario': 'Crear Usuario',
    'btn_guardar_orden': 'Guardar Orden',
    'btn_registrar_venta': 'Registrar Venta',
    'btn_emitir': 'Emitir',
    'btn_registrar': 'Registrar',
    'btn_nuevo_mov': 'Nuevo Movimiento',
    // Roles
    'rol_admin': 'Administrador',
    'rol_vendedor': 'Vendedor',
    'rol_tecnico': 'Técnico',
    'rol_cliente': 'Cliente',
    // Login
    'login_titulo': 'Iniciar Sesión',
    'login_sub': 'Ingresa tus credenciales para acceder',
    'login_email_label': 'Correo electrónico',
    'login_pass_label': 'Contraseña',
    'login_btn': 'Entrar',
    'login_footer': 'VA Control © 2026 — Solo personal autorizado',
    'login_brand_sub': 'Sistema de Gestión Empresarial',
    'login_error': 'Error al iniciar sesión',
    // 401
    '401_msg': 'Acceso denegado. No tienes permisos de Administrador para gestionar usuarios.',
    '401_btn': 'Volver al Dashboard',
    // Secciones de módulos
    'sec_catalogo_titulo': 'Catálogo de Productos',
    'sec_catalogo_sub': 'Gestión de SKUs, precios y categorías',
    'sec_inventario_titulo': 'Control de Inventario',
    'sec_inventario_sub': 'Movimientos, niveles de stock y alertas en tiempo real',
    'sec_ventas_titulo': 'Ventas',
    'sec_ventas_sub': 'Registro de transacciones comerciales',
    'sec_ordenes_titulo': 'Órdenes de Servicio',
    'sec_ordenes_sub': 'Gestión de reparaciones y servicios técnicos',
    'sec_facturas_titulo': 'Facturas',
    'sec_facturas_sub': 'Documentos de cobro y registro fiscal',
    'sec_clientes_titulo': 'Clientes del Sistema',
    'sec_clientes_sub': 'Gestión de la cartera de clientes y cuentas',
    'sec_usuarios_titulo': 'Usuarios del Sistema',
    'sec_usuarios_sub': 'Gestión de roles y permisos',
    'sec_reportes_titulo': 'Reportes y Análisis',
    'sec_reportes_sub': 'Métricas de negocio en tiempo real',
    // Tablas - encabezados comunes
    'th_id': 'ID',
    'th_nombre': 'Nombre',
    'th_email': 'Email',
    'th_rol': 'Rol',
    'th_estado': 'Estado',
    'th_acciones': 'Acciones',
    'th_sku': 'SKU',
    'th_producto': 'Producto',
    'th_categoria': 'Categoría',
    'th_stock': 'Stock',
    'th_precio': 'Precio Venta',
    'th_fecha': 'Fecha',
    // Búsqueda
    'buscar_producto': 'Buscar por nombre, SKU...',
    'buscar_cliente': 'Buscar por nombre, identificación, email o teléfono...',
    'buscar_usuario': 'Buscar por nombre, email o rol...',
    'buscar_venta': 'Buscar por cliente, ID...',
    'buscar_orden': 'Buscar por ID, cliente, técnico, equipo...',
    'buscar_factura': 'Buscar por factura, venta...',
    'buscar_inventario': 'Buscar por nombre o SKU...',
    // Filtros
    'filtro_categorias': 'Todas las categorías',
    'filtro_metodos': 'Todos los métodos',
    'filtro_estados_stock': 'Todos los estados',
    'filtro_sin_stock': 'Sin stock',
    'filtro_stock_bajo': 'Stock bajo',
    'filtro_normal': 'Normal',
    // Estados de órdenes (tabs)
    'tab_todas': 'Todas',
    'tab_pendientes': 'Pendientes',
    'tab_en_proceso': 'En Proceso',
    'tab_completadas': 'Completadas',
    'tab_entregadas': 'Entregadas',
    // Modales - campos
    'lbl_sku': 'SKU *',
    'lbl_nombre_producto': 'Nombre *',
    'lbl_precio_venta': 'Precio de Venta',
    'lbl_stock_inicial': 'Stock Inicial',
    'lbl_stock_minimo': 'Stock Mínimo',
    'lbl_descripcion': 'Descripción',
    'lbl_identificacion': 'Identificación / NIT / RUT *',
    'lbl_nombre_razon': 'Nombre o Razón Social *',
    'lbl_telefono': 'Teléfono (Opcional)',
    'lbl_email_opcional': 'Email (Opcional)',
    'lbl_direccion': 'Dirección',
    'lbl_tipo_cliente': 'Tipo de Cliente',
    'lbl_notas': 'Notas / Observaciones Internas',
    'lbl_nombre_completo': 'Nombre Completo',
    'lbl_password': 'Contraseña',
    'lbl_confirm_password': 'Confirmar Contraseña',
    'lbl_vendedor': 'Vendedor',
    'lbl_cliente': 'Cliente',
    'lbl_metodo_pago': 'Método de Pago',
    'lbl_total': 'Total ($)',
    'lbl_tecnico': 'Técnico Asignado',
    'lbl_equipo': 'Equipo *',
    'lbl_fecha_promesa': 'Fecha Promesa',
    'lbl_falla': 'Descripción de la Falla *',
    'lbl_tipo_entrega': 'Tipo de Entrega',
    'lbl_estado_orden': 'Estado de la Orden',
    'lbl_tipo_factura': 'Tipo de Factura',
    'lbl_referencia': 'Referencia ID',
    'lbl_subtotal': 'Subtotal ($)',
    'lbl_iva': 'IVA (%)',
    'lbl_producto': 'Producto *',
    'lbl_tipo_mov': 'Tipo de Movimiento *',
    'lbl_cantidad': 'Cantidad *',
    'lbl_motivo': 'Motivo / Referencia',
    'lbl_marca': 'Marca',
    'lbl_modelo': 'Modelo',
    'lbl_serial': 'Serial del Equipo',
    'lbl_costo': 'Costo del Servicio',
    'lbl_diagnostico': 'Diagnóstico Técnico',
    'lbl_notas_internas': 'Notas Internas',
    // Placeholders
    'ph_sku': 'EJ: ELEC-001',
    'ph_nombre_producto': 'Nombre del producto',
    'ph_precio': '0.00',
    'ph_stock': '0',
    'ph_stock_min': '5',
    'ph_descripcion': 'Detalles o especificaciones del producto',
    'ph_identificacion': '12345678-9',
    'ph_nombre_razon': 'Juan Pérez o Empresa S.A.',
    'ph_email': 'cliente@email.com',
    'ph_telefono': '+56 9 1234 5678',
    'ph_direccion': 'Av. Principal 123, Ciudad',
    'ph_notas': 'Detalles comerciales, condiciones de pago...',
    'ph_nombre_completo': 'Juan Pérez',
    'ph_email_usuario': 'usuario@email.com',
    'ph_password': '••••••••',
    'ph_equipo': 'Ej: iPhone 13 Pro',
    'ph_falla': 'Describe el problema',
    'ph_marca': 'Ej: Apple, Samsung',
    'ph_modelo': 'Ej: A2483, SM-G991B',
    'ph_serial': 'Número de serie',
    'ph_costo': '0',
    'ph_diagnostico': 'Reparación efectuada o estatus técnico',
    'ph_notas_int': 'Observaciones adicionales (opcional)',
    'ph_ref': 'ID de venta u orden',
    'ph_motivo': 'Ej: Compra proveedor XYZ',
    // Selects - opciones
    'opt_seleccionar': 'Seleccionar...',
    'opt_asignar_tecnico': 'Asignar técnico...',
    'opt_seleccionar_producto': 'Seleccionar producto...',
    'opt_seleccionar_producto_mov': '— Seleccionar producto —',
    'opt_electronica': 'Electrónica',
    'opt_repuestos': 'Repuestos',
    'opt_servicios': 'Servicios',
    'opt_electronicos': 'Electrónicos',
    'opt_particular': 'Persona Natural / Particular',
    'opt_empresa': 'Empresa / Corporativo',
    'opt_efectivo': 'Efectivo',
    'opt_tarjeta': 'Tarjeta',
    'opt_transferencia': 'Transferencia',
    'opt_credito': 'Crédito',
    'opt_otro': 'Otro',
    'opt_tienda': 'Retiro en Tienda',
    'opt_domicilio': 'Entrega a Domicilio',
    'opt_pendiente': 'Pendiente',
    'opt_en_proceso': 'En Proceso',
    'opt_completado': 'Completado',
    'opt_entregado': 'Entregado',
    'opt_cancelado': 'Cancelado',
    'opt_por_venta': 'Por Venta',
    'opt_por_servicio': 'Por Orden de Servicio',
    'opt_entrada': 'Entrada — Compra / recepción',
    'opt_salida': 'Salida — Uso / venta / pérdida',
    'opt_ajuste': 'Ajuste — Corrección manual de stock',
    // Modales - títulos
    'modal_nuevo_producto': 'Nuevo Producto',
    'modal_nuevo_cliente': 'Nuevo Cliente',
    'modal_nuevo_usuario': 'Nuevo Usuario',
    'modal_nueva_venta': 'Nueva Venta',
    'modal_nueva_orden': 'Nueva Orden de Servicio',
    'modal_emitir_factura': 'Emitir Factura',
    'modal_registrar_mov': 'Registrar Movimiento de Inventario',
    'modal_historial': 'Historial de Movimientos',
    'modal_confirmar': 'Confirmar Acción',
    // Reportes
    'rep_ingresos': 'Ingresos del Período',
    'rep_ordenes_comp': 'Órdenes Completadas',
    'rep_sin_stock': 'Productos Sin Stock',
    'rep_facturas': 'Facturas Emitidas',
    'rep_ventas_meses': 'Ventas de los últimos 6 meses',
    'rep_metodos_pago': 'Ventas por método de pago',
    'rep_ordenes_estado': 'Órdenes por estado',
    'rep_inventario_cat': 'Inventario por categoría (valor)',
    'rep_top_vendedores': 'Top vendedores del período',
    'rep_top_clientes': 'Top clientes del período',
    'rep_stock_critico': 'Stock crítico',
    'rep_ventas_periodo': 'Ventas del período',
    'btn_filtrar': 'Filtrar',
    'btn_limpiar': 'Limpiar',
    'btn_excel': 'Excel',
    // Inventario mov tipos (en tabla)
    'mov_entrada': 'Entrada',
    'mov_salida': 'Salida',
    'mov_ajuste': 'Ajuste',
    // Alertas
    'alert_rec_schema': 'Recomendación de esquema',
    'alert_rec_tabla': 'Se recomienda tabla',
    // KPIs Dashboard
    'kpi_productos': 'Productos Activos',
    'kpi_stock_bajo': 'Stock Bajo',
    'kpi_ordenes_pend': 'Órdenes Pendientes',
    'kpi_ordenes_ent': 'Órdenes Entregadas',
    'kpi_en_catalogo': 'en catálogo',
    'kpi_rep_repos': 'requieren reposición',
    'kpi_pend_proc': 'pendientes y en proceso',
    'kpi_comp_ent': 'completadas y entregadas',
    // Dashboard paneles
    'dash_actividad': 'Actividad últimos 7 días',
    'dash_ordenes_rec': 'Órdenes recientes',
    'dash_alertas_stock': 'Alertas de Stock',
    // Tablas encabezados específicos
    'th_identificacion': 'Identificación / RUT',
    'th_razon_social': 'Nombre / Razón Social',
    'th_minimo': 'Mínimo',
    'th_ultimo_mov': 'Último Mov.',
    'th_cliente': 'Cliente',
    'th_tecnico': 'Técnico',
    'th_equipo_falla': 'Equipo / Falla',
    'th_entrega': 'Entrega',
    'th_fecha_promesa': 'Fecha Promesa',
    'th_id_venta': '#ID',
    'th_vendedor': 'Vendedor',
    'th_metodo': 'Método Pago',
    'th_tipo': 'Tipo',
    'th_referencia': 'Referencia',
    'th_subtotal': 'Subtotal',
    'th_iva': 'IVA',
    'th_factura': '#Factura',
    'th_accion': 'Acción',
    // Confirmación de logout
    'confirm_cancelar': 'Cancelar',
    // Exportar
    'exportar_excel': 'Exportar Excel',
  },
  en: {
    // Sidebar - Nav sections
    'nav_principal': 'Main',
    'nav_operaciones': 'Operations',
    'nav_administracion': 'Administration',
    // Sidebar - Nav items
    'nav_dashboard': 'Dashboard',
    'nav_productos': 'Products',
    'nav_inventario': 'Inventory',
    'nav_ventas': 'Sales',
    'nav_ordenes': 'Service Orders',
    'nav_facturas': 'Invoices',
    'nav_clientes': 'Clients',
    'nav_usuarios': 'Users',
    'nav_reportes': 'Reports',
    // Sidebar - Logo
    'logo_sub': 'Management System',
    // Topbar
    'topbar_alertas': 'Stock alerts',
    'topbar_config': 'Settings',
    // Menú configuración
    'cfg_tema': 'Theme',
    'cfg_tema_claro': 'Light Mode',
    'cfg_tema_oscuro': 'Dark Mode',
    'cfg_idioma': 'Language',
    'cfg_cerrar': 'Log Out',
    // Modal logout
    'logout_titulo': 'Log out?',
    'logout_msg': 'Your current session will be closed. You will need to log in again to access the system.',
    'logout_confirmar': 'Yes, log out',
    'logout_cancelar': 'Cancel',
    // Páginas - títulos
    'titulo_dashboard': 'Dashboard',
    'titulo_productos': 'Products',
    'titulo_inventario': 'Inventory',
    'titulo_ventas': 'Sales',
    'titulo_ordenes': 'Service Orders',
    'titulo_facturas': 'Invoices',
    'titulo_clientes': 'Clients',
    'titulo_usuarios': 'Users',
    'titulo_reportes': 'Reports',
    // Botones comunes
    'btn_cancelar': 'Cancel',
    'btn_guardar': 'Save',
    'btn_confirmar': 'Confirm',
    'btn_cerrar': 'Close',
    'btn_nuevo_producto': 'New Product',
    'btn_nuevo_cliente': 'New Client',
    'btn_nuevo_usuario': 'New User',
    'btn_nueva_venta': 'New Sale',
    'btn_nueva_orden': 'New Order',
    'btn_emitir_factura': 'Issue Invoice',
    'btn_registrar_mov': 'Register Movement',
    'btn_exportar_excel': 'Export Excel',
    'btn_crear_cliente': 'Create Client',
    'btn_crear_usuario': 'Create User',
    'btn_guardar_orden': 'Save Order',
    'btn_registrar_venta': 'Register Sale',
    'btn_emitir': 'Issue',
    'btn_registrar': 'Register',
    'btn_nuevo_mov': 'New Movement',
    // Roles
    'rol_admin': 'Administrator',
    'rol_vendedor': 'Seller',
    'rol_tecnico': 'Technician',
    'rol_cliente': 'Client',
    // Login
    'login_titulo': 'Log In',
    'login_sub': 'Enter your credentials to access',
    'login_email_label': 'Email address',
    'login_pass_label': 'Password',
    'login_btn': 'Enter',
    'login_footer': 'VA Control © 2026 — Authorized personnel only',
    'login_brand_sub': 'Business Management System',
    'login_error': 'Login error',
    // 401
    '401_msg': 'Access denied. You do not have Administrator permissions to manage users.',
    '401_btn': 'Back to Dashboard',
    // Secciones de módulos
    'sec_catalogo_titulo': 'Product Catalog',
    'sec_catalogo_sub': 'Management of SKUs, prices and categories',
    'sec_inventario_titulo': 'Inventory Control',
    'sec_inventario_sub': 'Movements, stock levels and real-time alerts',
    'sec_ventas_titulo': 'Sales',
    'sec_ventas_sub': 'Record of commercial transactions',
    'sec_ordenes_titulo': 'Service Orders',
    'sec_ordenes_sub': 'Management of repairs and technical services',
    'sec_facturas_titulo': 'Invoices',
    'sec_facturas_sub': 'Billing documents and tax records',
    'sec_clientes_titulo': 'System Clients',
    'sec_clientes_sub': 'Management of client portfolio and accounts',
    'sec_usuarios_titulo': 'System Users',
    'sec_usuarios_sub': 'Role and permissions management',
    'sec_reportes_titulo': 'Reports & Analytics',
    'sec_reportes_sub': 'Real-time business metrics',
    // Tablas - encabezados comunes
    'th_id': 'ID',
    'th_nombre': 'Name',
    'th_email': 'Email',
    'th_rol': 'Role',
    'th_estado': 'Status',
    'th_acciones': 'Actions',
    'th_sku': 'SKU',
    'th_producto': 'Product',
    'th_categoria': 'Category',
    'th_stock': 'Stock',
    'th_precio': 'Sale Price',
    'th_fecha': 'Date',
    // Búsqueda
    'buscar_producto': 'Search by name, SKU...',
    'buscar_cliente': 'Search by name, ID, email or phone...',
    'buscar_usuario': 'Search by name, email or role...',
    'buscar_venta': 'Search by client, ID...',
    'buscar_orden': 'Search by ID, client, technician, device...',
    'buscar_factura': 'Search by invoice, sale...',
    'buscar_inventario': 'Search by name or SKU...',
    // Filtros
    'filtro_categorias': 'All categories',
    'filtro_metodos': 'All methods',
    'filtro_estados_stock': 'All statuses',
    'filtro_sin_stock': 'Out of stock',
    'filtro_stock_bajo': 'Low stock',
    'filtro_normal': 'Normal',
    // Estados de órdenes (tabs)
    'tab_todas': 'All',
    'tab_pendientes': 'Pending',
    'tab_en_proceso': 'In Progress',
    'tab_completadas': 'Completed',
    'tab_entregadas': 'Delivered',
    // Modales - campos
    'lbl_sku': 'SKU *',
    'lbl_nombre_producto': 'Name *',
    'lbl_precio_venta': 'Sale Price',
    'lbl_stock_inicial': 'Initial Stock',
    'lbl_stock_minimo': 'Minimum Stock',
    'lbl_descripcion': 'Description',
    'lbl_identificacion': 'ID / NIT / Tax ID *',
    'lbl_nombre_razon': 'Name or Company Name *',
    'lbl_telefono': 'Phone (Optional)',
    'lbl_email_opcional': 'Email (Optional)',
    'lbl_direccion': 'Address',
    'lbl_tipo_cliente': 'Client Type',
    'lbl_notas': 'Notes / Internal Observations',
    'lbl_nombre_completo': 'Full Name',
    'lbl_password': 'Password',
    'lbl_confirm_password': 'Confirm Password',
    'lbl_vendedor': 'Seller',
    'lbl_cliente': 'Client',
    'lbl_metodo_pago': 'Payment Method',
    'lbl_total': 'Total ($)',
    'lbl_tecnico': 'Assigned Technician',
    'lbl_equipo': 'Device *',
    'lbl_fecha_promesa': 'Promise Date',
    'lbl_falla': 'Failure Description *',
    'lbl_tipo_entrega': 'Delivery Type',
    'lbl_estado_orden': 'Order Status',
    'lbl_tipo_factura': 'Invoice Type',
    'lbl_referencia': 'Reference ID',
    'lbl_subtotal': 'Subtotal ($)',
    'lbl_iva': 'VAT (%)',
    'lbl_producto': 'Product *',
    'lbl_tipo_mov': 'Movement Type *',
    'lbl_cantidad': 'Quantity *',
    'lbl_motivo': 'Reason / Reference',
    'lbl_marca': 'Brand',
    'lbl_modelo': 'Model',
    'lbl_serial': 'Device Serial',
    'lbl_costo': 'Service Cost',
    'lbl_diagnostico': 'Technical Diagnosis',
    'lbl_notas_internas': 'Internal Notes',
    // Placeholders
    'ph_sku': 'E.G.: ELEC-001',
    'ph_nombre_producto': 'Product name',
    'ph_precio': '0.00',
    'ph_stock': '0',
    'ph_stock_min': '5',
    'ph_descripcion': 'Product details or specifications',
    'ph_identificacion': '12345678-9',
    'ph_nombre_razon': 'John Doe or Company Inc.',
    'ph_email': 'client@email.com',
    'ph_telefono': '+1 555 123 4567',
    'ph_direccion': '123 Main St, City',
    'ph_notas': 'Commercial details, payment terms...',
    'ph_nombre_completo': 'John Doe',
    'ph_email_usuario': 'user@email.com',
    'ph_password': '••••••••',
    'ph_equipo': 'E.g.: iPhone 13 Pro',
    'ph_falla': 'Describe the problem',
    'ph_marca': 'E.g.: Apple, Samsung',
    'ph_modelo': 'E.g.: A2483, SM-G991B',
    'ph_serial': 'Serial number',
    'ph_costo': '0',
    'ph_diagnostico': 'Repair performed or technical status',
    'ph_notas_int': 'Additional observations (optional)',
    'ph_ref': 'Sale or order ID',
    'ph_motivo': 'E.g.: Purchase from supplier XYZ',
    // Selects - opciones
    'opt_seleccionar': 'Select...',
    'opt_asignar_tecnico': 'Assign technician...',
    'opt_seleccionar_producto': 'Select product...',
    'opt_seleccionar_producto_mov': '— Select product —',
    'opt_electronica': 'Electronics',
    'opt_repuestos': 'Spare Parts',
    'opt_servicios': 'Services',
    'opt_electronicos': 'Electronics',
    'opt_particular': 'Individual / Consumer',
    'opt_empresa': 'Company / Corporate',
    'opt_efectivo': 'Cash',
    'opt_tarjeta': 'Card',
    'opt_transferencia': 'Transfer',
    'opt_credito': 'Credit',
    'opt_otro': 'Other',
    'opt_tienda': 'Store Pickup',
    'opt_domicilio': 'Home Delivery',
    'opt_pendiente': 'Pending',
    'opt_en_proceso': 'In Progress',
    'opt_completado': 'Completed',
    'opt_entregado': 'Delivered',
    'opt_cancelado': 'Cancelled',
    'opt_por_venta': 'By Sale',
    'opt_por_servicio': 'By Service Order',
    'opt_entrada': 'Entry — Purchase / reception',
    'opt_salida': 'Exit — Usage / sale / loss',
    'opt_ajuste': 'Adjustment — Manual stock correction',
    // Modales - títulos
    'modal_nuevo_producto': 'New Product',
    'modal_nuevo_cliente': 'New Client',
    'modal_nuevo_usuario': 'New User',
    'modal_nueva_venta': 'New Sale',
    'modal_nueva_orden': 'New Service Order',
    'modal_emitir_factura': 'Issue Invoice',
    'modal_registrar_mov': 'Register Inventory Movement',
    'modal_historial': 'Movement History',
    'modal_confirmar': 'Confirm Action',
    // Reportes
    'rep_ingresos': 'Period Revenue',
    'rep_ordenes_comp': 'Completed Orders',
    'rep_sin_stock': 'Out of Stock Products',
    'rep_facturas': 'Issued Invoices',
    'rep_ventas_meses': 'Sales over the last 6 months',
    'rep_metodos_pago': 'Sales by payment method',
    'rep_ordenes_estado': 'Orders by status',
    'rep_inventario_cat': 'Inventory by category (value)',
    'rep_top_vendedores': 'Top sellers of the period',
    'rep_top_clientes': 'Top clients of the period',
    'rep_stock_critico': 'Critical stock',
    'rep_ventas_periodo': 'Sales of the period',
    'btn_filtrar': 'Filter',
    'btn_limpiar': 'Clear',
    'btn_excel': 'Excel',
    // Inventario mov tipos
    'mov_entrada': 'Entry',
    'mov_salida': 'Exit',
    'mov_ajuste': 'Adjustment',
    // Alertas
    'alert_rec_schema': 'Schema recommendation',
    'alert_rec_tabla': 'Table recommended',
    // KPIs Dashboard
    'kpi_productos': 'Active Products',
    'kpi_stock_bajo': 'Low Stock',
    'kpi_ordenes_pend': 'Pending Orders',
    'kpi_ordenes_ent': 'Delivered Orders',
    'kpi_en_catalogo': 'in catalog',
    'kpi_rep_repos': 'need restocking',
    'kpi_pend_proc': 'pending and in progress',
    'kpi_comp_ent': 'completed and delivered',
    // Dashboard paneles
    'dash_actividad': 'Activity last 7 days',
    'dash_ordenes_rec': 'Recent orders',
    'dash_alertas_stock': 'Stock Alerts',
    // Tablas encabezados específicos
    'th_identificacion': 'ID / Tax ID',
    'th_razon_social': 'Name / Company',
    'th_minimo': 'Minimum',
    'th_ultimo_mov': 'Last Mov.',
    'th_cliente': 'Client',
    'th_tecnico': 'Technician',
    'th_equipo_falla': 'Device / Issue',
    'th_entrega': 'Delivery',
    'th_fecha_promesa': 'Promise Date',
    'th_id_venta': '#ID',
    'th_vendedor': 'Seller',
    'th_metodo': 'Payment Method',
    'th_tipo': 'Type',
    'th_referencia': 'Reference',
    'th_subtotal': 'Subtotal',
    'th_iva': 'VAT',
    'th_factura': '#Invoice',
    'th_accion': 'Action',
    // Confirmación de logout
    'confirm_cancelar': 'Cancel',
    // Exportar
    'exportar_excel': 'Export Excel',
  }
};

// ==================== ESTADO GLOBAL ====================
const VA_CONFIG = {
  get idioma() { return localStorage.getItem('va_idioma') || 'es'; },
  get tema()   { return localStorage.getItem('va_tema')   || 'dark'; },
  set idioma(v) { localStorage.setItem('va_idioma', v); },
  set tema(v)   { localStorage.setItem('va_tema',   v); }
};

// ==================== HELPER DE TRADUCCIÓN ====================
function t(clave) {
  return VA_TRADUCCIONES[VA_CONFIG.idioma][clave] || VA_TRADUCCIONES['es'][clave] || clave;
}

// ==================== TEMA ====================
function aplicarTema(tema) {
  const root = document.documentElement;
  if (tema === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
  VA_CONFIG.tema = tema;
  // Actualizar texto del botón de tema en el menú
  const btnTema = document.getElementById('cfg-btn-tema');
  if (btnTema) {
    const icono = tema === 'light' ? 'ti-moon' : 'ti-sun';
    const texto = tema === 'light' ? t('cfg_tema_oscuro') : t('cfg_tema_claro');
    btnTema.innerHTML = `<i class="ti ${icono}"></i><span>${texto}</span>`;
  }
}

function toggleTema() {
  const nuevo = VA_CONFIG.tema === 'dark' ? 'light' : 'dark';
  aplicarTema(nuevo);
  cerrarMenuConfig();
}

// ==================== IDIOMA ====================
function aplicarIdioma(idioma) {
  VA_CONFIG.idioma = idioma;
  traducirPagina();
  // Actualizar botón de idioma
  const btnIdioma = document.getElementById('cfg-btn-idioma');
  if (btnIdioma) {
    const esActivo = idioma === 'es';
    btnIdioma.innerHTML = `<i class="ti ti-language"></i><span>${t('cfg_idioma')}: ${esActivo ? 'ES' : 'EN'}</span>`;
  }
}

function toggleIdioma() {
  const nuevo = VA_CONFIG.idioma === 'es' ? 'en' : 'es';
  aplicarIdioma(nuevo);
  cerrarMenuConfig();
}

// ==================== TRADUCCIÓN DE PÁGINA ====================
function traducirPagina() {
  // Traduce todos los elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const clave = el.getAttribute('data-i18n');
    const tipo  = el.getAttribute('data-i18n-type') || 'text';
    const traduccion = t(clave);
    if (tipo === 'placeholder') {
      el.placeholder = traduccion;
    } else if (tipo === 'title') {
      el.title = traduccion;
    } else if (tipo === 'value') {
      el.textContent = traduccion;
    } else {
      el.textContent = traduccion;
    }
  });

  // Traduce el <title> del documento
  const titulos = {
    'dashboard.html': 'titulo_dashboard',
    'productos.html': 'titulo_productos',
    'inventario.html': 'titulo_inventario',
    'ventas.html': 'titulo_ventas',
    'ordenes.html': 'titulo_ordenes',
    'facturas.html': 'titulo_facturas',
    'clientes.html': 'titulo_clientes',
    'usuarios.html': 'titulo_usuarios',
    'reportes.html': 'titulo_reportes',
    'login.html': 'login_titulo',
    '401.html': '401_msg',
  };
  const pagina = window.location.pathname.split('/').pop();
  if (titulos[pagina]) {
    document.title = `VA Control — ${t(titulos[pagina])}`;
  }

  // Actualizar el page-title del topbar
  const pageTitle = document.getElementById('page-title');
  const mapaPageTitle = {
    'dashboard.html': 'titulo_dashboard',
    'productos.html': 'titulo_productos',
    'inventario.html': 'titulo_inventario',
    'ventas.html': 'titulo_ventas',
    'ordenes.html': 'titulo_ordenes',
    'facturas.html': 'titulo_facturas',
    'clientes.html': 'titulo_clientes',
    'usuarios.html': 'titulo_usuarios',
    'reportes.html': 'titulo_reportes',
  };
  if (pageTitle && mapaPageTitle[pagina]) {
    pageTitle.textContent = t(mapaPageTitle[pagina]);
  }

  // Actualizar texto del botón de tema e idioma después de traducir
  aplicarTema(VA_CONFIG.tema);
  const btnIdioma = document.getElementById('cfg-btn-idioma');
  if (btnIdioma) {
    const idioma = VA_CONFIG.idioma;
    btnIdioma.innerHTML = `<i class="ti ti-language"></i><span>${t('cfg_idioma')}: ${idioma === 'es' ? 'ES' : 'EN'}</span>`;
  }
}

// ==================== MENÚ DE CONFIGURACIÓN ====================
function crearMenuConfig() {
  // Evitar duplicados
  if (document.getElementById('cfg-dropdown')) return;

  const dropdown = document.createElement('div');
  dropdown.id = 'cfg-dropdown';
  dropdown.className = 'cfg-dropdown';
  dropdown.innerHTML = `
    <button class="cfg-item" id="cfg-btn-tema" onclick="toggleTema()">
      <i class="ti ti-sun"></i><span>${t('cfg_tema_claro')}</span>
    </button>
    <div class="cfg-separator"></div>
    <button class="cfg-item" id="cfg-btn-idioma" onclick="toggleIdioma()">
      <i class="ti ti-language"></i><span>${t('cfg_idioma')}: ${VA_CONFIG.idioma === 'es' ? 'ES' : 'EN'}</span>
    </button>
    <div class="cfg-separator"></div>
    <button class="cfg-item cfg-item--danger" onclick="abrirModalLogout()">
      <i class="ti ti-logout"></i><span>${t('cfg_cerrar')}</span>
    </button>
  `;
  document.body.appendChild(dropdown);

  // Cerrar al hacer clic fuera
  document.addEventListener('click', function cerrarAlClickAfuera(e) {
    const btnCfg = document.getElementById('btn-config');
    if (!dropdown.contains(e.target) && e.target !== btnCfg && !btnCfg?.contains(e.target)) {
      cerrarMenuConfig();
    }
  });
}

function abrirMenuConfig() {
  const dropdown = document.getElementById('cfg-dropdown');
  if (!dropdown) return;
  const btnCfg = document.getElementById('btn-config');
  const rect = btnCfg.getBoundingClientRect();
  dropdown.style.top  = (rect.bottom + 8) + 'px';
  dropdown.style.right = (window.innerWidth - rect.right) + 'px';
  dropdown.classList.toggle('cfg-dropdown--open');
  // Sincronizar texto del tema
  aplicarTema(VA_CONFIG.tema);
}

function cerrarMenuConfig() {
  const dropdown = document.getElementById('cfg-dropdown');
  if (dropdown) dropdown.classList.remove('cfg-dropdown--open');
}

// ==================== MODAL LOGOUT ====================
function crearModalLogout() {
  if (document.getElementById('modal-logout-cfg')) return;
  const overlay = document.createElement('div');
  overlay.id = 'modal-logout-cfg';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal modal-confirm">
      <div class="confirm-icon-box confirm-danger" style="background:var(--red-bg);color:var(--red);display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;margin-bottom:16px;">
        <i class="ti ti-logout" style="font-size:28px;"></i>
      </div>
      <h3 class="confirm-title" id="logout-titulo"></h3>
      <p class="confirm-message" id="logout-msg"></p>
      <div class="confirm-actions">
        <button class="btn btn-ghost btn-flex" id="logout-btn-cancelar" onclick="cerrarModalLogout()"></button>
        <button class="btn btn-flex" id="logout-btn-confirmar"
          style="background:var(--red);color:#fff;font-weight:600;"
          onclick="logout()">
        </button>
      </div>
    </div>
  `;
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) cerrarModalLogout();
  });
  document.body.appendChild(overlay);
}

function abrirModalLogout() {
  cerrarMenuConfig();
  // Actualizar textos antes de abrir
  document.getElementById('logout-titulo').textContent     = t('logout_titulo');
  document.getElementById('logout-msg').textContent        = t('logout_msg');
  document.getElementById('logout-btn-cancelar').textContent = t('logout_cancelar');
  document.getElementById('logout-btn-confirmar').textContent = t('logout_confirmar');
  document.getElementById('modal-logout-cfg').classList.add('open');
}

function cerrarModalLogout() {
  const m = document.getElementById('modal-logout-cfg');
  if (m) m.classList.remove('open');
}

// ==================== INYECCIÓN DEL BOTÓN DE CONFIGURACIÓN ====================
function inyectarBotonConfig() {
  // Buscar el icon-btn de configuración (el que tiene ti-settings)
  const btns = document.querySelectorAll('.icon-btn');
  let btnConfig = null;
  btns.forEach(btn => {
    if (btn.querySelector('.ti-settings')) btnConfig = btn;
  });
  if (!btnConfig) return;

  // Agregar id y evento
  btnConfig.id = 'btn-config';
  btnConfig.setAttribute('data-i18n', 'topbar_config');
  btnConfig.setAttribute('data-i18n-type', 'title');
  btnConfig.removeAttribute('onclick');
  btnConfig.addEventListener('click', function(e) {
    e.stopPropagation();
    abrirMenuConfig();
  });
}

// ==================== QUITAR BOTÓN LOGOUT DEL SIDEBAR ====================
function quitarLogoutSidebar() {
  // Eliminar el botón de logout inline del sidebar footer
  const btnsLogout = document.querySelectorAll('.sidebar-footer button[onclick*="logout"]');
  btnsLogout.forEach(btn => btn.remove());
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
  // 1. Aplicar tema guardado
  aplicarTema(VA_CONFIG.tema);

  // 2. Crear menú y modal
  crearMenuConfig();
  crearModalLogout();

  // 3. Inyectar el evento en el botón de configuración existente
  inyectarBotonConfig();

  // 4. Quitar el botón de logout del sidebar
  quitarLogoutSidebar();

  // 5. Aplicar idioma (traduce toda la página)
  aplicarIdioma(VA_CONFIG.idioma);
});