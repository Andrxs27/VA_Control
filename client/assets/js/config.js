
// TRADUCCIONES 
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
    'btn_guardar_cambios': 'Guardar Cambios',
    'btn_editar_producto': 'Editar Producto',
    'btn_editar_cliente': 'Editar Cliente',
    'btn_editar_usuario': 'Editar Usuario',
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
    'login_campos_requeridos': 'Por favor completa todos los campos.',
    'login_error_conexion': 'No se pudo conectar con el servidor. Verifica que esté activo.',
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
    'ph_telefono': '+57 300 123 4567',
    'ph_direccion': 'Av. Principal 123, Ciudad',
    'ph_notas': 'Detalles comerciales, condiciones de pago...',
    'ph_nombre_completo': 'Juan Pérez',
    'ph_email_usuario': 'usuario@email.com',
    'ph_password': '••••••••',
    'ph_password_editar': 'Dejar en blanco para no cambiar',
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
    'opt_seleccionar_vendedor': 'Seleccione un Vendedor...',
    'opt_seleccionar_cliente': 'Seleccione un Cliente...',
    'opt_asignar_tecnico': 'Sin asignar',
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
    'modal_editar_producto': 'Editar Producto',
    'modal_nuevo_cliente': 'Nuevo Cliente',
    'modal_editar_cliente': 'Editar Cliente',
    'modal_nuevo_usuario': 'Nuevo Usuario',
    'modal_editar_usuario': 'Editar Usuario',
    'modal_nueva_venta': 'Nueva Venta',
    'modal_nueva_orden': 'Nueva Orden de Servicio',
    'modal_editar_orden': 'Editar Orden',
    'modal_emitir_factura': 'Emitir Factura',
    'modal_editar_factura': 'Editar Factura',
    'modal_registrar_mov': 'Registrar Movimiento de Inventario',
    'modal_historial': 'Historial de Movimientos',
    'modal_confirmar': 'Confirmar Acción',
    // Estados - badges
    'estado_activo': 'Activo',
    'estado_inactivo': 'Inactivo',
    'estado_pendiente': 'Pendiente',
    'estado_en_proceso': 'En Proceso',
    'estado_completado': 'Completado',
    'estado_entregado': 'Entregado',
    'estado_cancelado': 'Cancelado',
    // Acciones en tabla
    'accion_editar': 'Editar',
    'accion_eliminar': 'Eliminar',
    'accion_desactivar': 'Desactivar',
    'accion_activar': 'Activar',
    'accion_ver_detalle': 'Ver detalle',
    'accion_eliminar_venta': 'Eliminar venta',
    'accion_registrar_mov': 'Registrar movimiento',
    'accion_ver_historial': 'Ver historial',
    // Confirmaciones - títulos
    'confirm_desactivar_orden': '¿Desactivar orden de servicio?',
    'confirm_reactivar_orden': '¿Reactivar orden de servicio?',
    'confirm_eliminar_orden': '¿Eliminar orden de servicio?',
    'confirm_desactivar_producto': '¿Desactivar producto?',
    'confirm_reactivar_producto': '¿Reactivar producto?',
    'confirm_eliminar_producto': '¿Eliminar producto?',
    'confirm_activar_cliente': '¿Activar cuenta de cliente?',
    'confirm_desactivar_cliente': '¿Desactivar cuenta de cliente?',
    'confirm_eliminar_cliente': '¿Eliminar cuenta de cliente?',
    'confirm_activar_usuario': '¿Activar cuenta de usuario?',
    'confirm_desactivar_usuario': '¿Desactivar cuenta de usuario?',
    'confirm_eliminar_usuario': '¿Eliminar cuenta de usuario?',
    'confirm_eliminar_venta': '¿Eliminar esta venta?',
    'confirm_eliminar_factura': '¿Eliminar esta factura?',
    // Confirmaciones - mensajes
    'confirm_msg_desactivar_orden': 'La orden quedará inhabilitada temporalmente.',
    'confirm_msg_reactivar_orden': 'La orden volverá a estar activa.',
    'confirm_msg_eliminar_orden': 'La orden se eliminará de forma permanente. Esta acción no se puede revertir.',
    'confirm_msg_desactivar_producto': 'El producto dejará de estar visible en el catálogo.',
    'confirm_msg_reactivar_producto': 'El producto volverá a estar disponible en el catálogo.',
    'confirm_msg_eliminar_producto': 'Al confirmar, el producto se eliminará permanentemente. Esta acción es irreversible.',
    'confirm_msg_activar_cliente': 'El cliente cambiará a estado activo.',
    'confirm_msg_desactivar_cliente': 'El cliente pasará a estar inactivo temporalmente.',
    'confirm_msg_eliminar_cliente': 'El registro se eliminará de forma permanente.',
    'confirm_msg_activar_usuario': 'El usuario recuperará el acceso al sistema.',
    'confirm_msg_desactivar_usuario': 'El usuario será inhabilitado temporalmente.',
    'confirm_msg_eliminar_usuario': 'La cuenta se eliminará permanentemente.',
    'confirm_msg_eliminar_venta': 'La venta se eliminará definitivamente y el stock será restaurado.',
    'confirm_msg_eliminar_factura': '¿Seguro que deseas eliminar esta factura?',
    // Toasts - éxito
    'toast_orden_eliminada': 'Orden eliminada',
    'toast_orden_desactivada': 'Orden desactivada con éxito',
    'toast_orden_activada': 'Orden activada con éxito',
    'toast_orden_actualizada': 'Orden actualizada correctamente',
    'toast_orden_creada': 'Orden creada correctamente',
    'toast_producto_creado': 'Producto creado correctamente',
    'toast_producto_actualizado': 'Producto actualizado con éxito',
    'toast_producto_eliminado': 'Producto eliminado correctamente',
    'toast_producto_activado': 'Producto activado con éxito',
    'toast_producto_desactivado': 'Producto desactivado con éxito',
    'toast_cliente_creado': 'Cliente creado correctamente',
    'toast_cliente_actualizado': 'Cliente actualizado correctamente',
    'toast_cliente_eliminado': 'Cliente eliminado permanentemente',
    'toast_estado_actualizado': 'Estado actualizado correctamente',
    'toast_usuario_creado': 'Usuario creado correctamente',
    'toast_usuario_actualizado': 'Usuario actualizado',
    'toast_usuario_eliminado': 'Usuario eliminado permanentemente',
    'toast_venta_creada': 'Venta registrada con éxito',
    'toast_venta_eliminada': 'Venta eliminada y stock restaurado',
    'toast_mov_registrado': 'Movimiento registrado correctamente',
    'toast_excel_generando': 'Generando archivo Excel...',
    'toast_excel_descargado': 'Excel descargado correctamente',
    // Toasts - error
    'toast_error_operacion': 'No se pudo realizar la operación',
    'toast_error_orden_datos': 'No se pudieron cargar los datos de la orden',
    'toast_error_orden_guardar': 'Error al guardar la orden en el servidor',
    'toast_error_campos_obligatorios': 'Por favor completa los campos obligatorios (*)',
    'toast_error_venta_eliminar': 'No se pudo eliminar la venta',
    'toast_error_mov_campos': 'Completa los campos obligatorios: producto, tipo y cantidad',
    'toast_error_mov_registrar': 'Error al registrar el movimiento',
    'toast_error_formulario': 'No se pudo preparar el formulario',
    'toast_error_inventario': 'Error al cargar inventario: ',
    'toast_error_historial': 'Error al cargar el historial: ',
    'toast_error_excel_cargando': 'La librería de Excel aún se está cargando',
    'toast_error_excel_sin_datos': 'No hay datos para exportar',
    'toast_error_excel_exportar': 'Error al exportar Excel: ',
    'toast_error_selectores': 'Error al inicializar los selectores',
    'toast_error_ventas': 'Error al consultar ventas',
    'toast_error_venta_detalle': 'No se pudo cargar el detalle de la venta',
    'toast_error_reporte': 'No se pudo generar el reporte.',
    'toast_error_servidor': 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en puerto 3000.',
    // Toasts - validación ventas
    'toast_venta_sel_vendedor_cliente': 'Seleccione un vendedor y un cliente',
    'toast_venta_agregar_producto': 'Agregue al menos un producto a la venta',
    'toast_venta_sel_producto_cantidad': 'Seleccione un producto y una cantidad válida',
    'toast_stock_insuficiente': 'Stock insuficiente. Disponible: ',
    'toast_stock_excede': 'La suma excede el stock disponible',
    'toast_usuario_pass_requerida': 'La contraseña es requerida para nuevos usuarios',
    'toast_usuario_pass_no_coincide': 'Las contraseñas no coinciden',
    'toast_usuario_nombre_email': 'Nombre y email son requeridos',
    'toast_cliente_id_nombre': 'La identificación y el nombre son requeridos',
    'toast_producto_sku_nombre': 'El SKU y el Nombre son campos requeridos',
    'toast_factura_ref_subtotal': 'Referencia y Subtotal son requeridos',
    // Inventario - KPIs
    'inv_total_productos': 'Total Productos',
    'inv_con_seguimiento': 'con seguimiento de stock',
    'inv_stock_normal': 'Stock Normal',
    'inv_por_encima_minimo': 'por encima del mínimo',
    'inv_stock_bajo': 'Stock Bajo',
    'inv_requieren_reposicion': 'requieren reposición',
    'inv_sin_stock': 'Sin Stock',
    'inv_agotados': 'agotados',
    // Inventario - modal movimiento
    'inv_cantidad_label': 'Cantidad *',
    'inv_nuevo_stock_label': 'Nuevo stock total *',
    'inv_stock_actual': 'Stock actual',
    'inv_minimo': 'Mínimo',
    'inv_unidades': 'uds.',
    'inv_historial_titulo': 'Historial',
    'inv_sin_movimientos': 'Este producto aún no tiene movimientos registrados',
    'inv_mov_entrada': 'Entrada',
    'inv_mov_salida': 'Salida',
    'inv_mov_ajuste': 'Ajuste',
    // Inventario - stock badges
    'inv_sin_stock_badge': 'Sin stock',
    'inv_stock_bajo_badge': 'Stock bajo',
    'inv_normal_badge': 'Normal',
    // Inventario - export
    'inv_export_producto': 'Producto',
    'inv_export_stock_actual': 'Stock Actual',
    'inv_export_stock_minimo': 'Stock Mínimo',
    'inv_export_estado': 'Estado',
    'inv_export_ultimo_mov': 'Último Movimiento',
    'inv_export_sin_stock': 'Sin Stock',
    'inv_export_stock_bajo': 'Stock Bajo',
    'inv_export_hoja': 'Inventario Completo',
    // Facturas
    'fact_tipo_venta': 'Venta',
    'fact_tipo_servicio': 'Servicio',
    'fact_total_estimado': 'Total estimado',
    'fact_modificada': 'Modificada desde interfaz web',
    'fact_emitida': 'Emitida desde interfaz web',
    'fact_sin_facturas': 'No hay facturas emitidas',
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
    // Reportes - textos dinámicos
    'rep_sin_datos': 'Sin datos en el período',
    'rep_sin_ventas': 'Sin ventas en el período',
    'rep_sin_ordenes': 'Sin órdenes en el período',
    'rep_sin_productos': 'Sin productos registrados',
    'rep_stock_normal': 'Todo el stock está en niveles normales',
    'rep_sin_ventas_periodo': 'Sin ventas en el período seleccionado',
    'rep_venta': 'venta',
    'rep_ventas': 'ventas',
    'rep_compra': 'compra',
    'rep_compras': 'compras',
    'rep_usuario': 'Usuario',
    'rep_cliente_lbl': 'Cliente',
    'rep_sin_stock_badge': 'Sin stock',
    'rep_stock_bajo_badge': 'Stock bajo',
    // Reportes - export Excel
    'rep_excel_id': 'ID',
    'rep_excel_fecha': 'Fecha',
    'rep_excel_vendedor': 'Vendedor',
    'rep_excel_cliente': 'Cliente',
    'rep_excel_subtotal': 'Subtotal',
    'rep_excel_descuento': 'Descuento',
    'rep_excel_impuestos': 'Impuestos',
    'rep_excel_total': 'Total',
    'rep_excel_metodo': 'Método de Pago',
    'rep_excel_estado': 'Estado',
    'rep_excel_total_row': 'TOTAL',
    'rep_excel_hoja_ventas': 'Ventas',
    'rep_excel_cliente_id': 'Cliente ID',
    'rep_excel_equipo': 'Equipo',
    'rep_excel_tipo_entrega': 'Tipo Entrega',
    'rep_excel_costo': 'Costo Servicio',
    'rep_excel_fecha_promesa': 'Fecha Promesa',
    'rep_excel_creado': 'Creado En',
    'rep_excel_hoja_ordenes': 'Órdenes',
    'rep_excel_nombre': 'Nombre',
    'rep_excel_categoria': 'Categoría',
    'rep_excel_stock_actual': 'Stock Actual',
    'rep_excel_stock_min': 'Stock Mínimo',
    'rep_excel_faltantes': 'Faltantes',
    'rep_excel_precio_venta': 'Precio Venta',
    'rep_excel_valor_riesgo': 'Valor en Riesgo',
    'rep_excel_hoja_stock': 'Stock Crítico',
    'rep_excel_generado': 'Reporte Generado',
    'rep_excel_periodo_desde': 'Período Desde',
    'rep_excel_periodo_hasta': 'Período Hasta',
    'rep_excel_todo': '(todo)',
    'rep_excel_indicador': 'INDICADOR',
    'rep_excel_valor': 'VALOR',
    'rep_excel_ingresos': 'Total Ingresos (Ventas)',
    'rep_excel_num_ventas': 'Número de Ventas',
    'rep_excel_ticket': 'Ticket Promedio',
    'rep_excel_total_ordenes': 'Total Órdenes de Servicio',
    'rep_excel_ordenes_comp': 'Órdenes Completadas',
    'rep_excel_ingresos_serv': 'Ingresos por Servicios',
    'rep_excel_facturas': 'Facturas Emitidas',
    'rep_excel_sin_stock': 'Productos Sin Stock',
    'rep_excel_stock_critico': 'Productos en Stock Crítico',
    'rep_excel_hoja_resumen': 'Resumen',
    'rep_excel_nombre_archivo': 'Reporte',
    // Reportes - métodos pago
    'rep_metodo_efectivo': 'Efectivo',
    'rep_metodo_tarjeta': 'Tarjeta',
    'rep_metodo_transferencia': 'Transferencia',
    'rep_metodo_otro': 'Otro',
    // Reportes - categorías
    'rep_cat_electronicos': 'Electrónicos',
    'rep_cat_repuestos': 'Repuestos',
    'rep_cat_servicios': 'Servicios',
    'rep_cat_otros': 'Otros',
    // Reportes - estados órdenes
    'rep_estado_pendiente': 'Pendiente',
    'rep_estado_en_proceso': 'En Proceso',
    'rep_estado_completado': 'Completado',
    'rep_estado_entregado': 'Entregado',
    'rep_estado_cancelado': 'Cancelado',
    // Ventas - detalle
    'venta_sin_detalle': 'Sin líneas de detalle registradas',
    'venta_emitida_pos': 'Emitido desde terminal POS Web',
    'venta_sin_ventas': 'No hay ventas registradas',
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
    // Usuarios - roles badges
    'badge_admin': 'Admin',
    'badge_vendedor': 'Vendedor',
    'badge_tecnico': 'Técnico',
    // Usuarios - tabla vacía
    'usuarios_sin_registros': 'No hay usuarios registrados',
    'clientes_sin_registros': 'No hay clientes registrados',
    // Confirmación
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
    'btn_guardar_cambios': 'Save Changes',
    'btn_editar_producto': 'Edit Product',
    'btn_editar_cliente': 'Edit Client',
    'btn_editar_usuario': 'Edit User',
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
    'login_campos_requeridos': 'Please fill in all fields.',
    'login_error_conexion': 'Could not connect to the server. Make sure it is running.',
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
    'ph_password_editar': 'Leave blank to keep unchanged',
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
    'opt_seleccionar_vendedor': 'Select a Seller...',
    'opt_seleccionar_cliente': 'Select a Client...',
    'opt_asignar_tecnico': 'Unassigned',
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
    'modal_editar_producto': 'Edit Product',
    'modal_nuevo_cliente': 'New Client',
    'modal_editar_cliente': 'Edit Client',
    'modal_nuevo_usuario': 'New User',
    'modal_editar_usuario': 'Edit User',
    'modal_nueva_venta': 'New Sale',
    'modal_nueva_orden': 'New Service Order',
    'modal_editar_orden': 'Edit Order',
    'modal_emitir_factura': 'Issue Invoice',
    'modal_editar_factura': 'Edit Invoice',
    'modal_registrar_mov': 'Register Inventory Movement',
    'modal_historial': 'Movement History',
    'modal_confirmar': 'Confirm Action',
    // Estados - badges
    'estado_activo': 'Active',
    'estado_inactivo': 'Inactive',
    'estado_pendiente': 'Pending',
    'estado_en_proceso': 'In Progress',
    'estado_completado': 'Completed',
    'estado_entregado': 'Delivered',
    'estado_cancelado': 'Cancelled',
    // Acciones en tabla
    'accion_editar': 'Edit',
    'accion_eliminar': 'Delete',
    'accion_desactivar': 'Deactivate',
    'accion_activar': 'Activate',
    'accion_ver_detalle': 'View detail',
    'accion_eliminar_venta': 'Delete sale',
    'accion_registrar_mov': 'Register movement',
    'accion_ver_historial': 'View history',
    // Confirmaciones - títulos
    'confirm_desactivar_orden': 'Deactivate service order?',
    'confirm_reactivar_orden': 'Reactivate service order?',
    'confirm_eliminar_orden': 'Delete service order?',
    'confirm_desactivar_producto': 'Deactivate product?',
    'confirm_reactivar_producto': 'Reactivate product?',
    'confirm_eliminar_producto': 'Delete product?',
    'confirm_activar_cliente': 'Activate client account?',
    'confirm_desactivar_cliente': 'Deactivate client account?',
    'confirm_eliminar_cliente': 'Delete client account?',
    'confirm_activar_usuario': 'Activate user account?',
    'confirm_desactivar_usuario': 'Deactivate user account?',
    'confirm_eliminar_usuario': 'Delete user account?',
    'confirm_eliminar_venta': 'Delete this sale?',
    'confirm_eliminar_factura': 'Delete this invoice?',
    // Confirmaciones - mensajes
    'confirm_msg_desactivar_orden': 'The order will be temporarily disabled.',
    'confirm_msg_reactivar_orden': 'The order will be active again.',
    'confirm_msg_eliminar_orden': 'The order will be permanently deleted. This action cannot be undone.',
    'confirm_msg_desactivar_producto': 'The product will no longer be visible in the catalog.',
    'confirm_msg_reactivar_producto': 'The product will be available in the catalog again.',
    'confirm_msg_eliminar_producto': 'Upon confirming, the product will be permanently deleted. This action is irreversible.',
    'confirm_msg_activar_cliente': 'Client will be set to active.',
    'confirm_msg_desactivar_cliente': 'Client will be temporarily inactive.',
    'confirm_msg_eliminar_cliente': 'The record will be permanently deleted.',
    'confirm_msg_activar_usuario': 'User will regain access to the system.',
    'confirm_msg_desactivar_usuario': 'User will be temporarily disabled.',
    'confirm_msg_eliminar_usuario': 'The account will be permanently deleted.',
    'confirm_msg_eliminar_venta': 'The sale will be permanently deleted and stock will be restored.',
    'confirm_msg_eliminar_factura': 'Are you sure you want to delete this invoice?',
    // Toasts - éxito
    'toast_orden_eliminada': 'Order deleted',
    'toast_orden_desactivada': 'Order deactivated successfully',
    'toast_orden_activada': 'Order activated successfully',
    'toast_orden_actualizada': 'Order updated successfully',
    'toast_orden_creada': 'Order created successfully',
    'toast_producto_creado': 'Product created successfully',
    'toast_producto_actualizado': 'Product updated successfully',
    'toast_producto_eliminado': 'Product deleted successfully',
    'toast_producto_activado': 'Product activated successfully',
    'toast_producto_desactivado': 'Product deactivated successfully',
    'toast_cliente_creado': 'Client created successfully',
    'toast_cliente_actualizado': 'Client updated successfully',
    'toast_cliente_eliminado': 'Client permanently deleted',
    'toast_estado_actualizado': 'Status updated successfully',
    'toast_usuario_creado': 'User created successfully',
    'toast_usuario_actualizado': 'User updated',
    'toast_usuario_eliminado': 'User permanently deleted',
    'toast_venta_creada': 'Sale registered successfully',
    'toast_venta_eliminada': 'Sale deleted and stock restored',
    'toast_mov_registrado': 'Movement registered successfully',
    'toast_excel_generando': 'Generating Excel file...',
    'toast_excel_descargado': 'Excel downloaded successfully',
    // Toasts - error
    'toast_error_operacion': 'Could not complete the operation',
    'toast_error_orden_datos': 'Could not load order data',
    'toast_error_orden_guardar': 'Error saving order to server',
    'toast_error_campos_obligatorios': 'Please fill in the required fields (*)',
    'toast_error_venta_eliminar': 'Could not delete sale',
    'toast_error_mov_campos': 'Fill in required fields: product, type and quantity',
    'toast_error_mov_registrar': 'Error registering movement',
    'toast_error_formulario': 'Could not prepare form',
    'toast_error_inventario': 'Error loading inventory: ',
    'toast_error_historial': 'Error loading history: ',
    'toast_error_excel_cargando': 'Excel library is still loading',
    'toast_error_excel_sin_datos': 'No data to export',
    'toast_error_excel_exportar': 'Error exporting Excel: ',
    'toast_error_selectores': 'Error initializing selectors',
    'toast_error_ventas': 'Error fetching sales',
    'toast_error_venta_detalle': 'Could not load sale details',
    'toast_error_reporte': 'Could not generate the report.',
    'toast_error_servidor': 'Could not connect to server. Make sure the backend is running on port 3000.',
    // Toasts - validación ventas
    'toast_venta_sel_vendedor_cliente': 'Select a seller and a client',
    'toast_venta_agregar_producto': 'Add at least one product to the sale',
    'toast_venta_sel_producto_cantidad': 'Select a product and a valid quantity',
    'toast_stock_insuficiente': 'Insufficient stock. Available: ',
    'toast_stock_excede': 'Sum exceeds available stock',
    'toast_usuario_pass_requerida': 'Password is required for new users',
    'toast_usuario_pass_no_coincide': 'Passwords do not match',
    'toast_usuario_nombre_email': 'Name and email are required',
    'toast_cliente_id_nombre': 'ID and name are required',
    'toast_producto_sku_nombre': 'SKU and Name are required fields',
    'toast_factura_ref_subtotal': 'Reference and Subtotal are required',
    // Inventario - KPIs
    'inv_total_productos': 'Total Products',
    'inv_con_seguimiento': 'with stock tracking',
    'inv_stock_normal': 'Normal Stock',
    'inv_por_encima_minimo': 'above minimum',
    'inv_stock_bajo': 'Low Stock',
    'inv_requieren_reposicion': 'need restocking',
    'inv_sin_stock': 'Out of Stock',
    'inv_agotados': 'depleted',
    // Inventario - modal movimiento
    'inv_cantidad_label': 'Quantity *',
    'inv_nuevo_stock_label': 'New total stock *',
    'inv_stock_actual': 'Current stock',
    'inv_minimo': 'Minimum',
    'inv_unidades': 'units',
    'inv_historial_titulo': 'History',
    'inv_sin_movimientos': 'This product has no registered movements yet',
    'inv_mov_entrada': 'Entry',
    'inv_mov_salida': 'Exit',
    'inv_mov_ajuste': 'Adjustment',
    // Inventario - stock badges
    'inv_sin_stock_badge': 'Out of stock',
    'inv_stock_bajo_badge': 'Low stock',
    'inv_normal_badge': 'Normal',
    // Inventario - export
    'inv_export_producto': 'Product',
    'inv_export_stock_actual': 'Current Stock',
    'inv_export_stock_minimo': 'Minimum Stock',
    'inv_export_estado': 'Status',
    'inv_export_ultimo_mov': 'Last Movement',
    'inv_export_sin_stock': 'Out of Stock',
    'inv_export_stock_bajo': 'Low Stock',
    'inv_export_hoja': 'Full Inventory',
    // Facturas
    'fact_tipo_venta': 'Sale',
    'fact_tipo_servicio': 'Service',
    'fact_total_estimado': 'Estimated total',
    'fact_modificada': 'Modified from web interface',
    'fact_emitida': 'Issued from web interface',
    'fact_sin_facturas': 'No issued invoices',
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
    // Reportes - textos dinámicos
    'rep_sin_datos': 'No data for this period',
    'rep_sin_ventas': 'No sales in this period',
    'rep_sin_ordenes': 'No orders in this period',
    'rep_sin_productos': 'No products registered',
    'rep_stock_normal': 'All stock is at normal levels',
    'rep_sin_ventas_periodo': 'No sales in the selected period',
    'rep_venta': 'sale',
    'rep_ventas': 'sales',
    'rep_compra': 'purchase',
    'rep_compras': 'purchases',
    'rep_usuario': 'User',
    'rep_cliente_lbl': 'Client',
    'rep_sin_stock_badge': 'Out of stock',
    'rep_stock_bajo_badge': 'Low stock',
    // Reportes - export Excel
    'rep_excel_id': 'ID',
    'rep_excel_fecha': 'Date',
    'rep_excel_vendedor': 'Seller',
    'rep_excel_cliente': 'Client',
    'rep_excel_subtotal': 'Subtotal',
    'rep_excel_descuento': 'Discount',
    'rep_excel_impuestos': 'Taxes',
    'rep_excel_total': 'Total',
    'rep_excel_metodo': 'Payment Method',
    'rep_excel_estado': 'Status',
    'rep_excel_total_row': 'TOTAL',
    'rep_excel_hoja_ventas': 'Sales',
    'rep_excel_cliente_id': 'Client ID',
    'rep_excel_equipo': 'Device',
    'rep_excel_tipo_entrega': 'Delivery Type',
    'rep_excel_costo': 'Service Cost',
    'rep_excel_fecha_promesa': 'Promise Date',
    'rep_excel_creado': 'Created On',
    'rep_excel_hoja_ordenes': 'Orders',
    'rep_excel_nombre': 'Name',
    'rep_excel_categoria': 'Category',
    'rep_excel_stock_actual': 'Current Stock',
    'rep_excel_stock_min': 'Min Stock',
    'rep_excel_faltantes': 'Missing',
    'rep_excel_precio_venta': 'Sale Price',
    'rep_excel_valor_riesgo': 'At-Risk Value',
    'rep_excel_hoja_stock': 'Critical Stock',
    'rep_excel_generado': 'Report Generated',
    'rep_excel_periodo_desde': 'Period From',
    'rep_excel_periodo_hasta': 'Period To',
    'rep_excel_todo': '(all)',
    'rep_excel_indicador': 'INDICATOR',
    'rep_excel_valor': 'VALUE',
    'rep_excel_ingresos': 'Total Revenue (Sales)',
    'rep_excel_num_ventas': 'Number of Sales',
    'rep_excel_ticket': 'Average Ticket',
    'rep_excel_total_ordenes': 'Total Service Orders',
    'rep_excel_ordenes_comp': 'Completed Orders',
    'rep_excel_ingresos_serv': 'Revenue from Services',
    'rep_excel_facturas': 'Issued Invoices',
    'rep_excel_sin_stock': 'Out of Stock Products',
    'rep_excel_stock_critico': 'Critical Stock Products',
    'rep_excel_hoja_resumen': 'Summary',
    'rep_excel_nombre_archivo': 'Report',
    // Reportes - métodos pago
    'rep_metodo_efectivo': 'Cash',
    'rep_metodo_tarjeta': 'Card',
    'rep_metodo_transferencia': 'Transfer',
    'rep_metodo_otro': 'Other',
    // Reportes - categorías
    'rep_cat_electronicos': 'Electronics',
    'rep_cat_repuestos': 'Spare Parts',
    'rep_cat_servicios': 'Services',
    'rep_cat_otros': 'Others',
    // Reportes - estados órdenes
    'rep_estado_pendiente': 'Pending',
    'rep_estado_en_proceso': 'In Progress',
    'rep_estado_completado': 'Completed',
    'rep_estado_entregado': 'Delivered',
    'rep_estado_cancelado': 'Cancelled',
    // Ventas - detalle
    'venta_sin_detalle': 'No detail lines registered',
    'venta_emitida_pos': 'Issued from Web POS terminal',
    'venta_sin_ventas': 'No registered sales',
    // Inventario mov tipos (en tabla)
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
    // Usuarios - roles badges
    'badge_admin': 'Admin',
    'badge_vendedor': 'Seller',
    'badge_tecnico': 'Technician',
    // Usuarios - tabla vacía
    'usuarios_sin_registros': 'No registered users',
    'clientes_sin_registros': 'No registered clients',
    // Confirmación
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
  return VA_TRADUCCIONES[VA_CONFIG.idioma]?.[clave] || VA_TRADUCCIONES['es']?.[clave] || clave;
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

  aplicarTema(VA_CONFIG.tema);
  const btnIdioma = document.getElementById('cfg-btn-idioma');
  if (btnIdioma) {
    const idioma = VA_CONFIG.idioma;
    btnIdioma.innerHTML = `<i class="ti ti-language"></i><span>${t('cfg_idioma')}: ${idioma === 'es' ? 'ES' : 'EN'}</span>`;
  }
}

// ==================== MENÚ DE CONFIGURACIÓN ====================
function crearMenuConfig() {
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
  const btns = document.querySelectorAll('.icon-btn');
  let btnConfig = null;
  btns.forEach(btn => {
    if (btn.querySelector('.ti-settings')) btnConfig = btn;
  });
  if (!btnConfig) return;
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
  const btnsLogout = document.querySelectorAll('.sidebar-footer button[onclick*="logout"]');
  btnsLogout.forEach(btn => btn.remove());
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
  aplicarTema(VA_CONFIG.tema);
  crearMenuConfig();
  crearModalLogout();
  inyectarBotonConfig();
  quitarLogoutSidebar();
  aplicarIdioma(VA_CONFIG.idioma);
});