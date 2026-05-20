// ==================== DATA STORE ====================
const DB = {
  productos: [
    {id:1,sku:'ELEC-001',nombre:'Pantalla Samsung S22',categoria:'electronica',stock:12,stock_minimo:5,precio_venta:180000,active:true},
    {id:2,sku:'ELEC-002',nombre:'Batería iPhone 13',categoria:'repuestos',stock:3,stock_minimo:8,precio_venta:45000,active:true},
    {id:3,sku:'REP-001',nombre:'Conector de Carga USB-C',categoria:'repuestos',stock:0,stock_minimo:10,precio_venta:15000,active:true},
    {id:4,sku:'SVC-001',nombre:'Diagnóstico General',categoria:'servicios',stock:99,stock_minimo:0,precio_venta:25000,active:true},
    {id:5,sku:'ELEC-003',nombre:'Altavoz Bluetooth',categoria:'electronica',stock:7,stock_minimo:5,precio_venta:95000,active:true},
    {id:6,sku:'REP-002',nombre:'Vidrio Templado Universal',categoria:'repuestos',stock:2,stock_minimo:15,precio_venta:8000,active:true},
  ],
  usuarios: [
    {id:1,nombre:'Carlos Mendoza',rol:'admin',email:'admin@tienda.com',active:true},
    {id:2,nombre:'Laura Gómez',rol:'vendedor',email:'lgomez@tienda.com',active:true},
    {id:3,nombre:'Diego Ríos',rol:'tecnico',email:'drios@tienda.com',active:true},
    {id:4,nombre:'María Torres',rol:'cliente',email:'mtorres@gmail.com',active:true},
    {id:5,nombre:'Juan Pérez',rol:'cliente',email:'jperez@gmail.com',active:true},
  ],
  ventas: [
    {id:1,vendedor_id:2,cliente_id:4,total:225000,metodo_pago:'tarjeta',creado_en:'2025-05-14 10:30'},
    {id:2,vendedor_id:2,cliente_id:5,total:45000,metodo_pago:'efectivo',creado_en:'2025-05-14 11:15'},
    {id:3,vendedor_id:1,cliente_id:4,total:103000,metodo_pago:'transferencia',creado_en:'2025-05-15 09:00'},
  ],
  ordenes: [
    {id:1,cliente_id:4,tecnico_id:3,equipo:'Samsung Galaxy S21',falla:'Pantalla rota, no enciende',estado:'en_proceso',tipo_entrega:'tienda',fecha_promesa:'2025-05-20'},
    {id:2,cliente_id:5,tecnico_id:3,equipo:'MacBook Pro 2019',falla:'No carga la batería',estado:'pendiente',tipo_entrega:'domicilio',fecha_promesa:'2025-05-22'},
    {id:3,cliente_id:4,tecnico_id:null,equipo:'iPhone 12',falla:'Micrófono sin sonido',estado:'pendiente',tipo_entrega:'tienda',fecha_promesa:'2025-05-18'},
    {id:4,cliente_id:5,tecnico_id:3,equipo:'Laptop HP ProBook',falla:'Teclado con teclas pegadas',estado:'completado',tipo_entrega:'tienda',fecha_promesa:'2025-05-16'},
  ],
  facturas: [
    {id:1,venta_id:1,orden_servicio_id:null,impuestos:35910,subtotal:189090,fecha_emision:'2025-05-14 10:35'},
    {id:2,venta_id:2,orden_servicio_id:null,impuestos:7186,subtotal:37814,fecha_emision:'2025-05-14 11:20'},
  ],
  movimientos: [],
  nextId: {productos:7,usuarios:6,ventas:4,ordenes:5,facturas:3}
};

// ==================== NAVEGACIÓN ====================
const pageNames = {dashboard:'Dashboard',productos:'Productos',inventario:'Inventario',ventas:'Ventas',ordenes:'Órdenes de Servicio',facturas:'Facturas',usuarios:'Usuarios',reportes:'Reportes'};

function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  el.classList.add('active');
  document.getElementById('page-title').textContent = pageNames[page];
  renderPage(page);
}

function renderPage(page) {
  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'productos': renderProductos(); break;
    case 'inventario': renderInventario(); break;
    case 'ventas': renderVentas(); break;
    case 'ordenes': renderOrdenes(); break;
    case 'facturas': renderFacturas(); break;
    case 'usuarios': renderUsuarios(); break;
    case 'reportes': renderReportes(); break;
  }
}

// ==================== DASHBOARD ====================
function renderDashboard() {
  const ventasHoy = DB.ventas.filter(v => v.creado_en.startsWith('2025-05-15'));
  const totalHoy = ventasHoy.reduce((s,v) => s + v.total, 0);
  const stockBajo = DB.productos.filter(p => p.active && p.stock <= p.stock_minimo && p.categoria !== 'servicios').length;
  const ordenesPendientes = DB.ordenes.filter(o => o.estado === 'pendiente' || o.estado === 'en_proceso').length;

  document.getElementById('kpi-ventas').textContent = formatCOP(totalHoy);
  document.getElementById('kpi-productos').textContent = DB.productos.filter(p=>p.active).length;
  document.getElementById('kpi-stockbajo').textContent = stockBajo;
  document.getElementById('kpi-ordenes').textContent = ordenesPendientes;
  document.getElementById('badge-ordenes').textContent = ordenesPendientes;

  // Chart barras simulado
  const dias = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];
  const vals = [320000,185000,410000,275000,530000,380000,totalHoy];
  const maxV = Math.max(...vals);
  document.getElementById('chart-ventas').innerHTML = dias.map((d,i) => {
    const pct = Math.round((vals[i]/maxV)*100);
    const color = i===6 ? 'var(--accent)' : 'var(--border2)';
    return `<div class="bar-item"><div class="bar" style="height:${pct}%;background:${color}"></div><span class="bar-label">${d}</span></div>`;
  }).join('');

  // Activity
  const acts = [
    {tipo:'sale',text:'Venta #003 registrada — $103.000',time:'Hace 2 horas'},
    {tipo:'service',text:'Orden #004 completada por Diego Ríos',time:'Hace 4 horas'},
    {tipo:'stock',text:'Stock bajo: Conector USB-C (0 uds.)',time:'Hace 5 horas'},
    {tipo:'sale',text:'Venta #002 — María Torres',time:'Ayer'},
    {tipo:'stock',text:'Stock bajo: Vidrio Templado (2 uds.)',time:'Ayer'},
  ];
  document.getElementById('activity-list').innerHTML = acts.map(a =>
    `<div class="activity-item"><div class="activity-dot ${a.tipo}"></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></div>`
  ).join('');

  // Alertas stock
  const criticos = DB.productos.filter(p => p.active && p.stock <= p.stock_minimo && p.categoria !== 'servicios');
  if(criticos.length > 0) {
    document.getElementById('alertas-stock-section').innerHTML = `
      <div class="section-header" style="margin-top:8px"><div class="section-title" style="color:var(--amber)"><i class="ti ti-alert-triangle" style="margin-right:6px"></i>Alertas de Stock</div></div>
      <div class="table-wrap">
        <table><thead><tr><th>Producto</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Estado</th></tr></thead>
        <tbody>${criticos.map(p => `<tr>
          <td>${p.nombre}</td>
          <td>${p.stock}</td>
          <td>${p.stock_minimo}</td>
          <td><span class="badge ${p.stock===0?'badge-red':'badge-amber'}">${p.stock===0?'Sin stock':'Stock bajo'}</span></td>
        </tr>`).join('')}</tbody></table>
      </div>`;
  }
}

// ==================== PRODUCTOS ====================
function renderProductos(filtro='', cat='') {
  const data = DB.productos.filter(p => {
    const m = filtro.toLowerCase();
    const match = !filtro || p.nombre.toLowerCase().includes(m) || p.sku.toLowerCase().includes(m);
    const catMatch = !cat || p.categoria === cat;
    return match && catMatch;
  });
  document.getElementById('tb-productos').innerHTML = data.map(p => {
    const pct = p.categoria==='servicios' ? 100 : Math.min(100, Math.round((p.stock/Math.max(p.stock_minimo*2,1))*100));
    const cls = p.stock===0?'critical':p.stock<=p.stock_minimo?'low':'ok';
    return `<tr>
      <td><code style="font-size:11px;background:var(--bg3);padding:2px 6px;border-radius:4px;color:var(--accent)">${p.sku}</code></td>
      <td><div style="font-weight:500">${p.nombre}</div></td>
      <td>${catBadge(p.categoria)}</td>
      <td>
        <div class="stock-bar">
          <div style="font-size:12px;font-weight:500">${p.categoria==='servicios'?'∞':p.stock} uds.</div>
          ${p.categoria!=='servicios'?`<div class="stock-track"><div class="stock-fill ${cls}" style="width:${pct}%"></div></div>`:''}
        </div>
      </td>
      <td style="font-weight:500">${formatCOP(p.precio_venta)}</td>
      <td><span class="badge ${p.active?'badge-green':'badge-gray'}">${p.active?'Activo':'Inactivo'}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editarProducto(${p.id})"><i class="ti ti-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="toggleProducto(${p.id})"><i class="ti ti-${p.active?'trash':'restore'}"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">No hay productos</td></tr>';
}

function filtrarPorCategoria(cat) { renderProductos('', cat); }

// ==================== INVENTARIO ====================
function renderInventario(filtro='') {
  const data = DB.productos.filter(p => p.active && p.categoria !== 'servicios' &&
    (!filtro || p.nombre.toLowerCase().includes(filtro.toLowerCase()) || p.sku.toLowerCase().includes(filtro.toLowerCase())));
  document.getElementById('tb-inventario').innerHTML = data.map(p => {
    const pct = Math.min(100,Math.round((p.stock/Math.max(p.stock_minimo*2,1))*100));
    const cls = p.stock===0?'critical':p.stock<=p.stock_minimo?'low':'ok';
    const est = p.stock===0?['badge-red','Sin Stock']:p.stock<=p.stock_minimo?['badge-amber','Stock Bajo']:['badge-green','Normal'];
    return `<tr>
      <td><code style="font-size:11px;background:var(--bg3);padding:2px 6px;border-radius:4px;color:var(--accent)">${p.sku}</code></td>
      <td>${p.nombre}</td>
      <td>
        <div class="stock-bar">
          <div style="font-size:14px;font-weight:600">${p.stock}</div>
          <div class="stock-track" style="width:120px"><div class="stock-fill ${cls}" style="width:${pct}%"></div></div>
        </div>
      </td>
      <td>${p.stock_minimo}</td>
      <td><span class="badge ${est[0]}">${est[1]}</span></td>
      <td class="td-muted">—</td>
      <td><button class="btn btn-ghost btn-sm" onclick="ajustarStock(${p.id})"><i class="ti ti-arrows-up-down"></i> Ajustar</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">No hay datos</td></tr>';
  // Rellenar select de productos en modal movimiento
  const sel = document.getElementById('mov-producto');
  sel.innerHTML = '<option value="">Seleccionar producto</option>' +
    DB.productos.filter(p=>p.active&&p.categoria!=='servicios').map(p=>`<option value="${p.id}">${p.nombre} (Stock: ${p.stock})</option>`).join('');
}

function ajustarStock(id) {
  document.getElementById('mov-producto').value = id;
  openModal('modal-movimiento');
}

// ==================== VENTAS ====================
function renderVentas(filtro='', metodo='') {
  const data = DB.ventas.filter(v => {
    const m = filtro.toLowerCase();
    const vend = getUser(v.vendedor_id);
    const cli = getUser(v.cliente_id);
    const match = !filtro || String(v.id).includes(m) || vend.toLowerCase().includes(m) || cli.toLowerCase().includes(m);
    const mMatch = !metodo || v.metodo_pago === metodo;
    return match && mMatch;
  });
  document.getElementById('tb-ventas').innerHTML = data.map(v => `<tr>
    <td style="font-weight:600">#${String(v.id).padStart(4,'0')}</td>
    <td>${getUser(v.vendedor_id)}</td>
    <td>${getUser(v.cliente_id)}</td>
    <td style="font-weight:600">${formatCOP(v.total)}</td>
    <td>${metodoBadge(v.metodo_pago)}</td>
    <td class="td-muted">${v.creado_en}</td>
    <td><button class="btn btn-ghost btn-sm" onclick="verFactura(${v.id})"><i class="ti ti-file-invoice"></i> Factura</button></td>
  </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">No hay ventas</td></tr>';
  // Llenar selects
  const sels = ['v-vendedor','v-cliente'];
  sels.forEach(sid => {
    const s = document.getElementById(sid);
    const roles = sid === 'v-vendedor' ? ['admin','vendedor'] : ['cliente'];
    s.innerHTML = '<option value="">Seleccionar...</option>' + DB.usuarios.filter(u=>roles.includes(u.rol)).map(u=>`<option value="${u.id}">${u.nombre}</option>`).join('');
  });
}

function filtrarVentasPago(m) { renderVentas('', m); }

// ==================== ORDENES ====================
let filtroOrdenActivo = 'all';
function renderOrdenes(filtro) {
  if(filtro !== undefined) filtroOrdenActivo = filtro;
  const data = DB.ordenes.filter(o => filtroOrdenActivo === 'all' || o.estado === filtroOrdenActivo);
  const steps = ['pendiente','en_proceso','completado','entregado'];
  document.getElementById('tb-ordenes').innerHTML = data.map(o => {
    const si = steps.indexOf(o.estado);
    return `<tr>
      <td style="font-weight:600">#${String(o.id).padStart(4,'0')}</td>
      <td>${getUser(o.cliente_id)}</td>
      <td>${o.tecnico_id ? getUser(o.tecnico_id) : '<span class="td-muted">Sin asignar</span>'}</td>
      <td><div style="font-weight:500;font-size:13px">${o.equipo}</div><div class="td-muted" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.falla}</div></td>
      <td>${estadoBadge(o.estado)}</td>
      <td>${o.tipo_entrega === 'domicilio' ? '<span class="badge badge-blue">Domicilio</span>' : '<span class="badge badge-gray">Tienda</span>'}</td>
      <td class="td-muted">${o.fecha_promesa}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="avanzarOrden(${o.id})" ${o.estado==='entregado'?'disabled':''} title="Avanzar estado"><i class="ti ti-arrow-right"></i></button>
          <button class="btn btn-danger btn-sm" onclick="eliminarOrden(${o.id})"><i class="ti ti-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">No hay órdenes</td></tr>';
  // Fill selects
  ['o-cliente'].forEach(sid => {
    const s = document.getElementById(sid);
    s.innerHTML = '<option value="">Seleccionar...</option>' + DB.usuarios.filter(u=>u.rol==='cliente').map(u=>`<option value="${u.id}">${u.nombre}</option>`).join('');
  });
  document.getElementById('o-tecnico').innerHTML = '<option value="">Asignar técnico...</option>' + DB.usuarios.filter(u=>u.rol==='tecnico').map(u=>`<option value="${u.id}">${u.nombre}</option>`).join('');
}

function filtrarOrdenes(estado, el) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderOrdenes(estado);
}

function avanzarOrden(id) {
  const o = DB.ordenes.find(x=>x.id===id);
  const steps = ['pendiente','en_proceso','completado','entregado'];
  const idx = steps.indexOf(o.estado);
  if(idx < steps.length-1) { o.estado = steps[idx+1]; renderOrdenes(); toast(`Orden #${id} avanzada a: ${o.estado}`,'success'); }
}

function eliminarOrden(id) {
  DB.ordenes = DB.ordenes.filter(o=>o.id!==id);
  renderOrdenes(); toast('Orden eliminada','info');
}

// ==================== FACTURAS ====================
function renderFacturas(filtro='') {
  document.getElementById('tb-facturas').innerHTML = DB.facturas.map(f => {
    const tipo = f.venta_id ? 'Venta' : 'Servicio';
    const ref = f.venta_id ? `#V${f.venta_id}` : `#OS${f.orden_servicio_id}`;
    const total = f.subtotal + f.impuestos;
    return `<tr>
      <td style="font-weight:600">#F${String(f.id).padStart(4,'0')}</td>
      <td><span class="badge ${f.venta_id?'badge-green':'badge-blue'}">${tipo}</span></td>
      <td>${ref}</td>
      <td>${formatCOP(f.subtotal)}</td>
      <td style="color:var(--amber)">${formatCOP(f.impuestos)}</td>
      <td style="font-weight:600">${formatCOP(total)}</td>
      <td class="td-muted">${f.fecha_emision.split(' ')[0]}</td>
      <td><button class="btn btn-ghost btn-sm"><i class="ti ti-printer"></i></button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">No hay facturas</td></tr>';
}

function verFactura(ventaId) {
  const f = DB.facturas.find(x=>x.venta_id===ventaId);
  if(f) { navigate('facturas', document.querySelector('.nav-item:nth-child(8)')); }
  else toast('Esta venta aún no tiene factura','info');
}

// ==================== USUARIOS ====================
function renderUsuarios() {
  const rolColors = {admin:'badge-red',vendedor:'badge-blue',tecnico:'badge-amber',cliente:'badge-green'};
  document.getElementById('tb-usuarios').innerHTML = DB.usuarios.map(u => `<tr>
    <td class="td-muted">${u.id}</td>
    <td>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:30px;height:30px;border-radius:50%;background:var(--accent-glow);border:1.5px solid var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-size:11px;font-weight:700;color:var(--accent);flex-shrink:0">${u.nombre.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
        <span style="font-weight:500">${u.nombre}</span>
      </div>
    </td>
    <td class="td-muted">${u.email}</td>
    <td><span class="badge ${rolColors[u.rol]}">${u.rol}</span></td>
    <td><span class="badge ${u.active?'badge-green':'badge-gray'}">${u.active?'Activo':'Inactivo'}</span></td>
    <td>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm"><i class="ti ti-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="toggleUsuario(${u.id})"><i class="ti ti-${u.active?'user-off':'user-check'}"></i></button>
      </div>
    </td>
  </tr>`).join('');
}

function toggleUsuario(id) {
  const u = DB.usuarios.find(x=>x.id===id);
  u.active = !u.active;
  renderUsuarios();
  toast(`Usuario ${u.active?'activado':'desactivado'}`,'info');
}

// ==================== REPORTES ====================
function renderReportes() {
  const totalVentas = DB.ventas.reduce((s,v)=>s+v.total,0);
  const ordenesComp = DB.ordenes.filter(o=>o.estado==='completado'||o.estado==='entregado').length;
  const sinStock = DB.productos.filter(p=>p.active&&p.stock===0&&p.categoria!=='servicios').length;
  document.getElementById('rep-ingresos').textContent = formatCOP(totalVentas);
  document.getElementById('rep-ordenes-comp').textContent = ordenesComp;
  document.getElementById('rep-sin-stock').textContent = sinStock;
  document.getElementById('rep-facturas').textContent = DB.facturas.length;

  const cats = {electronica:0,repuestos:0,servicios:0};
  DB.ventas.forEach(v => {
    // simulate
    cats.electronica += v.total * 0.5;
    cats.repuestos += v.total * 0.3;
    cats.servicios += v.total * 0.2;
  });
  document.getElementById('rep-categorias').innerHTML = Object.entries(cats).map(([k,v])=>{
    const pct = Math.round((v/totalVentas)*100)||0;
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--text)">${k}</span><span style="color:var(--text2)">${pct}%</span></div>
      <div style="background:var(--bg3);border-radius:4px;height:8px"><div style="height:100%;border-radius:4px;background:var(--accent);width:${pct}%;transition:width .5s"></div></div>
    </div>`;
  }).join('');

  const vendedores = DB.usuarios.filter(u=>u.rol==='vendedor'||u.rol==='admin').map(u=>{
    const total = DB.ventas.filter(v=>v.vendedor_id===u.id).reduce((s,v)=>s+v.total,0);
    return {nombre:u.nombre,total};
  }).sort((a,b)=>b.total-a.total);
  document.getElementById('rep-vendedores').innerHTML = vendedores.map((v,i)=>`
    <div class="activity-item" style="align-items:center">
      <div style="font-size:11px;font-weight:700;color:var(--text3);min-width:18px">#${i+1}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:500">${v.nombre}</div></div>
      <div style="font-size:13px;font-weight:600;color:var(--green)">${formatCOP(v.total)}</div>
    </div>`).join('') || '<div style="color:var(--text3);font-size:13px">Sin datos</div>';

  document.getElementById('sql-output').textContent = `-- Reporte de ventas por período
SELECT 
  DATE(v.creado_en) as fecha,
  COUNT(*) as total_ventas,
  SUM(v.total) as ingresos,
  v.metodo_pago
FROM ventas v
WHERE v.creado_en >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(v.creado_en), v.metodo_pago
ORDER BY fecha DESC;

-- Stock crítico
SELECT p.sku, p.nombre, p.stock, p.stock_minimo,
  (p.stock_minimo - p.stock) as unidades_faltantes
FROM productos p
WHERE p.stock <= p.stock_minimo 
  AND p.active = true
  AND p.categoria != 'servicios'
ORDER BY unidades_faltantes DESC;

-- Órdenes por técnico
SELECT u.nombre as tecnico,
  COUNT(*) as total_ordenes,
  COUNT(CASE WHEN o.estado IN ('completado','entregado') THEN 1 END) as completadas
FROM ordenes_servicio o
JOIN usuarios u ON u.id = o.tecnico_id
GROUP BY u.id, u.nombre;`;
}

// ==================== MODALES ====================
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if(e.target===m) m.classList.remove('open'); });
});

// Calcular preview factura
document.getElementById('f-subtotal').addEventListener('input', calcFactura);
document.getElementById('f-iva').addEventListener('input', calcFactura);
function calcFactura() {
  const sub = parseFloat(document.getElementById('f-subtotal').value)||0;
  const iva = parseFloat(document.getElementById('f-iva').value)||0;
  const total = sub + (sub * iva/100);
  document.getElementById('f-total-preview').innerHTML = `Total estimado: <strong style="color:var(--green)">${formatCOP(total)}</strong>`;
}

// ==================== GUARDS ====================
function guardarProducto() {
  const sku = document.getElementById('p-sku').value.trim();
  const nombre = document.getElementById('p-nombre').value.trim();
  if(!sku || !nombre) { toast('SKU y nombre son requeridos','error'); return; }
  if(DB.productos.find(p=>p.sku===sku)) { toast('El SKU ya existe','error'); return; }
  DB.productos.push({
    id: DB.nextId.productos++,
    sku, nombre,
    categoria: document.getElementById('p-categoria').value,
    stock: parseInt(document.getElementById('p-stock').value)||0,
    stock_minimo: parseInt(document.getElementById('p-stockmin').value)||5,
    precio_venta: parseFloat(document.getElementById('p-precio').value)||0,
    active: true
  });
  closeModal('modal-producto');
  renderProductos();
  toast('Producto creado correctamente','success');
  ['p-sku','p-nombre','p-precio','p-stock','p-stockmin'].forEach(id=>document.getElementById(id).value='');
}

function guardarMovimiento() {
  const pid = parseInt(document.getElementById('mov-producto').value);
  const tipo = document.getElementById('mov-tipo').value;
  const cant = parseInt(document.getElementById('mov-cantidad').value)||0;
  if(!pid || cant<=0) { toast('Completa todos los campos','error'); return; }
  const prod = DB.productos.find(p=>p.id===pid);
  if(tipo==='entrada') prod.stock += cant;
  else if(tipo==='salida') {
    if(prod.stock < cant) { toast('Stock insuficiente para salida','error'); return; }
    prod.stock -= cant;
  } else {
    prod.stock = cant;
  }
  DB.movimientos.push({producto_id:pid,tipo,cantidad:cant,motivo:document.getElementById('mov-motivo').value,fecha:new Date().toISOString()});
  closeModal('modal-movimiento');
  renderInventario();
  toast(`Movimiento registrado: ${tipo} de ${cant} uds. en ${prod.nombre}`,'success');
}

function guardarVenta() {
  const vid = parseInt(document.getElementById('v-vendedor').value);
  const cid = parseInt(document.getElementById('v-cliente').value);
  const total = parseFloat(document.getElementById('v-total').value)||0;
  if(!vid || !cid || !total) { toast('Completa todos los campos','error'); return; }
  const id = DB.nextId.ventas++;
  DB.ventas.push({id,vendedor_id:vid,cliente_id:cid,total,metodo_pago:document.getElementById('v-metodo').value,creado_en:'2025-05-15 '+new Date().toTimeString().slice(0,5)});
  closeModal('modal-venta');
  renderVentas();
  toast(`Venta #${id} registrada por ${formatCOP(total)}`,'success');
}

function guardarOrden() {
  const cid = parseInt(document.getElementById('o-cliente').value);
  const equipo = document.getElementById('o-equipo').value.trim();
  const falla = document.getElementById('o-falla').value.trim();
  if(!cid || !equipo || !falla) { toast('Cliente, equipo y falla son requeridos','error'); return; }
  const id = DB.nextId.ordenes++;
  DB.ordenes.push({
    id, cliente_id:cid,
    tecnico_id: parseInt(document.getElementById('o-tecnico').value)||null,
    equipo, falla,
    estado: document.getElementById('o-estado').value,
    tipo_entrega: document.getElementById('o-entrega').value,
    fecha_promesa: document.getElementById('o-fecha').value
  });
  closeModal('modal-orden');
  renderOrdenes();
  document.getElementById('badge-ordenes').textContent = DB.ordenes.filter(o=>['pendiente','en_proceso'].includes(o.estado)).length;
  toast(`Orden #${id} creada para ${equipo}`,'success');
}

function guardarFactura() {
  const sub = parseFloat(document.getElementById('f-subtotal').value)||0;
  const iva = parseFloat(document.getElementById('f-iva').value)||0;
  const ref = parseInt(document.getElementById('f-ref').value)||0;
  const tipo = document.getElementById('f-tipo').value;
  if(!sub || !ref) { toast('Completa subtotal y referencia','error'); return; }
  const imp = Math.round((sub*iva/100)*100)/100;
  const id = DB.nextId.facturas++;
  DB.facturas.push({
    id,
    venta_id: tipo==='venta' ? ref : null,
    orden_servicio_id: tipo==='servicio' ? ref : null,
    subtotal: sub, impuestos: imp,
    fecha_emision:'2025-05-15 '+new Date().toTimeString().slice(0,5)
  });
  closeModal('modal-factura');
  renderFacturas();
  toast(`Factura #F${id} emitida por ${formatCOP(sub+imp)}`,'success');
}

function guardarUsuario() {
  const nombre = document.getElementById('u-nombre').value.trim();
  const email = document.getElementById('u-email').value.trim();
  if(!nombre || !email) { toast('Nombre y email requeridos','error'); return; }
  if(DB.usuarios.find(u=>u.email===email)) { toast('El email ya está registrado','error'); return; }
  const id = DB.nextId.usuarios++;
  DB.usuarios.push({id,nombre,rol:document.getElementById('u-rol').value,email,active:true});
  closeModal('modal-usuario');
  renderUsuarios();
  toast(`Usuario ${nombre} creado`,'success');
}

function editarProducto(id) {
  const p = DB.productos.find(x=>x.id===id);
  document.getElementById('p-sku').value = p.sku;
  document.getElementById('p-nombre').value = p.nombre;
  document.getElementById('p-categoria').value = p.categoria;
  document.getElementById('p-precio').value = p.precio_venta;
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('p-stockmin').value = p.stock_minimo;
  openModal('modal-producto');
}

function toggleProducto(id) {
  const p = DB.productos.find(x=>x.id===id);
  p.active = !p.active;
  renderProductos();
  toast(`Producto ${p.active?'activado':'desactivado'}`,'info');
}

// ==================== FILTERS ====================
function filtrarTabla(tbId, val) {
  if(tbId==='tb-productos') renderProductos(val);
  else if(tbId==='tb-inventario') renderInventario(val);
  else if(tbId==='tb-ventas') renderVentas(val);
}

// ==================== HELPERS ====================
function getUser(id) { const u = DB.usuarios.find(x=>x.id===id); return u ? u.nombre : 'N/A'; }
function formatCOP(n) { return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n); }

function catBadge(c) {
  const map = {electronica:['badge-blue','Electrónica'],repuestos:['badge-amber','Repuestos'],servicios:['badge-green','Servicios']};
  const [cls,label] = map[c]||['badge-gray',c];
  return `<span class="badge ${cls}">${label}</span>`;
}

function metodoBadge(m) {
  const map = {efectivo:'badge-green',tarjeta:'badge-blue',transferencia:'badge-amber',credito:'badge-red'};
  return `<span class="badge ${map[m]||'badge-gray'}">${m}</span>`;
}

function estadoBadge(e) {
  const map = {pendiente:['badge-amber','Pendiente'],en_proceso:['badge-blue','En Proceso'],completado:['badge-green','Completado'],entregado:['badge-gray','Entregado']};
  const [cls,label] = map[e]||['badge-gray',e];
  return `<span class="badge ${cls}">${label}</span>`;
}

function toast(msg, type='info') {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = {success:'ti-circle-check',error:'ti-circle-x',info:'ti-info-circle'};
  t.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}"></i>${msg}`;
  c.appendChild(t);
  setTimeout(()=>t.remove(),3500);
}

// ==================== INIT ====================
renderDashboard();