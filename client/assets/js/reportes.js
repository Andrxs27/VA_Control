// ==========================================
// REPORTES — VA Control
// Consume la API real en http://localhost:3000/api
// ==========================================

const API = 'http://localhost:3000/api';

// ── utilidades ──────────────────────────────────────────────────────────────
function formatCOP(val) {
  const n = parseFloat(val) || 0;
  return '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function mesCorto(dateStr) {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const d = new Date(dateStr);
  return meses[d.getUTCMonth()];
}

function hoy() {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

// ── estado del filtro ────────────────────────────────────────────────────────
let repFiltroDesde = '';
let repFiltroHasta = '';

// ── punto de entrada ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar filtros con el mes actual
  const ahora = new Date();
  const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().slice(0,10);
  const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).toISOString().slice(0,10);

  const elDesde = document.getElementById('rep-desde');
  const elHasta = document.getElementById('rep-hasta');
  if (elDesde) elDesde.value = primerDia;
  if (elHasta) elHasta.value = ultimoDia;

  repFiltroDesde = primerDia;
  repFiltroHasta = ultimoDia;

  cargarReportes();
});

// ── carga principal ──────────────────────────────────────────────────────────
async function cargarReportes() {
  mostrarSkeletons();
  try {
    const [ventas, ordenes, facturas, productos, usuarios, clientes] = await Promise.all([
      fetch(`${API}/ventas`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/ordenes`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/facturas`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/productos`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/usuarios`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/clientes`).then(r => r.ok ? r.json() : []),
    ]);

    // Filtrar ventas por rango de fechas si hay filtro activo
    const ventasFiltradas = filtrarPorFecha(ventas, 'creado_en');
    const ordenesFiltradas = filtrarPorFecha(ordenes, 'creado_en');
    const facturasFiltradas = filtrarPorFecha(facturas, 'fecha_emision');

    renderKPIs(ventasFiltradas, ordenesFiltradas, facturasFiltradas, productos);
    renderGraficaVentasMes(ventas);            // siempre últimos 6 meses
    renderVentasPorMetodo(ventasFiltradas);
    renderCategorias(ventasFiltradas, productos);
    renderTopVendedores(ventasFiltradas, usuarios);
    renderTopClientes(ventasFiltradas, clientes);
    renderStockCritico(productos);
    renderTablaVentas(ventasFiltradas, usuarios, clientes);
    renderOrdenesResumen(ordenesFiltradas);

  } catch (err) {
    console.error('Error cargando reportes:', err);
    mostrarError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en puerto 3000.');
  }
}

function filtrarPorFecha(items, campo) {
  if (!repFiltroDesde && !repFiltroHasta) return items;
  return items.filter(item => {
    const f = item[campo] ? item[campo].slice(0,10) : '';
    if (repFiltroDesde && f < repFiltroDesde) return false;
    if (repFiltroHasta && f > repFiltroHasta) return false;
    return true;
  });
}

// ── KPIs ─────────────────────────────────────────────────────────────────────
function renderKPIs(ventas, ordenes, facturas, productos) {
  const ingresos = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0);
  const ordenesComp = ordenes.filter(o => o.estado === 'completado' || o.estado === 'entregado').length;
  const sinStock = productos.filter(p => p.activo && p.stock === 0 && p.categoria !== 'servicios').length;

  set('rep-ingresos', formatCOP(ingresos));
  set('rep-ordenes-comp', ordenesComp);
  set('rep-sin-stock', sinStock);
  set('rep-facturas', facturas.length);
}

// ── Gráfica ventas últimos 6 meses (CON DISEÑO DE DASHBOARD) ─────────────────
function renderGraficaVentasMes(todasVentas) {
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    meses.push({
      key: d.toISOString().slice(0, 7),
      label: mesCorto(d.toISOString()),
      total: 0
    });
  }

  todasVentas.forEach(v => {
    const m = v.creado_en ? v.creado_en.slice(0, 7) : '';
    const bucket = meses.find(x => x.key === m);
    if (bucket) bucket.total += parseFloat(v.total || 0);
  });

  const maxV = Math.max(...meses.map(m => m.total), 1);
  const el = document.getElementById('rep-grafica-meses');
  if (!el) return;

  el.innerHTML = `
    <div style="display:flex; align-items:flex-end; justify-content:space-between; width:100%; height:140px; padding:0 4px; box-sizing:border-box; margin-top:24px;">
        ${meses.map((m, i) => {
            const esActual = m.key === hoy();
            const altura = m.total > 0 ? Math.max((m.total / maxV) * 95, 15) : 4;
            
            const color = m.total > 0 ? (esActual ? 'var(--blue)' : 'var(--amber)') : 'var(--border)';
            
            return `
                <div style="flex:1; max-width:52px; display:flex; flex-direction:column; align-items:center; gap:6px;" title="${m.label}: ${formatCOP(m.total)}">
                    
                    <span style="font-size:10px; font-weight:600; color:${m.total > 0 ? 'var(--text1)' : 'transparent'}; height:14px; white-space:nowrap;">
                        ${m.total > 0 ? formatCOP(m.total) : ''}
                    </span>
                    
                    <div style="width:100%; height:${altura}px; background:${color}; border-radius:4px; transition: all 0.3s ease;"></div>
                    
                    <span style="font-size:11px; color:${esActual ? 'var(--blue)' : 'var(--text3)'}; font-weight:${esActual ? '600' : '200'}; text-transform:capitalize;">
                        ${m.label.replace('.', '')}
                    </span>
                </div>
            `;
        }).join('')}
    </div>
  `;
}

// ── Ventas por método de pago ─────────────────────────────────────────────────
function renderVentasPorMetodo(ventas) {
  const totales = {};
  ventas.forEach(v => {
    const m = v.metodo_pago || 'otro';
    totales[m] = (totales[m] || 0) + parseFloat(v.total || 0);
  });
  const totalGeneral = Object.values(totales).reduce((s, v) => s + v, 0) || 1;

  const colores = { efectivo: 'var(--green)', tarjeta: 'var(--blue)', transferencia: 'var(--accent)', otro: 'var(--text3)' };
  const etiquetas = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', otro: 'Otro' };

  const el = document.getElementById('rep-metodos');
  if (!el) return;

  if (Object.keys(totales).length === 0) {
    el.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:8px 0">Sin datos en el período</div>';
    return;
  }

  el.innerHTML = Object.entries(totales)
    .sort((a, b) => b[1] - a[1])
    .map(([metodo, total]) => {
      const pct = Math.round((total / totalGeneral) * 100);
      const color = colores[metodo] || 'var(--accent)';
      return `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span style="color:var(--text)">${etiquetas[metodo] || metodo}</span>
            <span style="color:var(--text2)">${pct}% — ${formatCOP(total)}</span>
          </div>
          <div style="background:var(--bg3);border-radius:4px;height:8px">
            <div style="height:100%;border-radius:4px;background:${color};width:${pct}%;transition:width .6s"></div>
          </div>
        </div>`;
    }).join('');
}

// ── Ventas por categoría ──────────────────────────────────────────────────────
function renderCategorias(ventas, productos) {
  const catMap = {};
  productos.forEach(p => { catMap[p.id] = p.categoria || 'sin_categoría'; });

  const totalesCat = {};
  ventas.forEach(v => {
    totalesCat['ventas'] = (totalesCat['ventas'] || 0) + parseFloat(v.total || 0);
  });

  const stockCat = {};
  productos.filter(p => p.activo).forEach(p => {
    const c = p.categoria || 'otros';
    stockCat[c] = (stockCat[c] || 0) + (p.stock * parseFloat(p.precio_venta || 0));
  });

  const totalStock = Object.values(stockCat).reduce((s, v) => s + v, 1);
  const colores = { electronicos: 'var(--blue)', repuestos: 'var(--amber)', servicios: 'var(--green)', otros: 'var(--text3)' };
  const etiquetas = { electronicos: 'Electrónicos', repuestos: 'Repuestos', servicios: 'Servicios', otros: 'Otros' };

  const el = document.getElementById('rep-categorias');
  if (!el) return;

  if (Object.keys(stockCat).length === 0) {
    el.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:8px 0">Sin productos registrados</div>';
    return;
  }

  el.innerHTML = Object.entries(stockCat)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => {
      const pct = Math.round((val / totalStock) * 100);
      const color = colores[cat] || 'var(--accent)';
      return `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span style="color:var(--text)">${etiquetas[cat] || cat}</span>
            <span style="color:var(--text2)">${pct}% — ${formatCOP(val)}</span>
          </div>
          <div style="background:var(--bg3);border-radius:4px;height:8px">
            <div style="height:100%;border-radius:4px;background:${color};width:${pct}%;transition:width .6s"></div>
          </div>
        </div>`;
    }).join('');
}

// ── Top vendedores ────────────────────────────────────────────────────────────
function renderTopVendedores(ventas, usuarios) {
  const mapa = {};
  ventas.forEach(v => {
    if (!v.vendedor_id) return;
    if (!mapa[v.vendedor_id]) mapa[v.vendedor_id] = { total: 0, cantidad: 0 };
    mapa[v.vendedor_id].total += parseFloat(v.total || 0);
    mapa[v.vendedor_id].cantidad++;
  });

  const ranking = Object.entries(mapa)
    .map(([id, data]) => {
      const u = usuarios.find(u => u.id == id);
      return { nombre: u ? u.nombre : `Usuario #${id}`, ...data };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const el = document.getElementById('rep-vendedores');
  if (!el) return;

  if (ranking.length === 0) {
    el.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:8px 0">Sin ventas en el período</div>';
    return;
  }

  el.innerHTML = ranking.map((v, i) => `
    <div class="activity-item" style="align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:11px;font-weight:700;color:var(--text3);min-width:22px">#${i + 1}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;color:var(--text)">${v.nombre}</div>
        <div style="font-size:11px;color:var(--text3)">${v.cantidad} venta${v.cantidad !== 1 ? 's' : ''}</div>
      </div>
      <div style="font-size:13px;font-weight:600;color:var(--green)">${formatCOP(v.total)}</div>
    </div>`).join('');
}

// ── Top clientes ──────────────────────────────────────────────────────────────
function renderTopClientes(ventas, clientes) {
  const mapa = {};
  ventas.forEach(v => {
    if (!v.cliente_id) return;
    if (!mapa[v.cliente_id]) mapa[v.cliente_id] = { total: 0, cantidad: 0 };
    mapa[v.cliente_id].total += parseFloat(v.total || 0);
    mapa[v.cliente_id].cantidad++;
  });

  const ranking = Object.entries(mapa)
    .map(([id, data]) => {
      const c = clientes.find(c => c.id == id);
      return { nombre: c ? c.nombre : `Cliente #${id}`, ...data };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const el = document.getElementById('rep-top-clientes');
  if (!el) return;

  if (ranking.length === 0) {
    el.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:8px 0">Sin datos en el período</div>';
    return;
  }

  el.innerHTML = ranking.map((c, i) => `
    <div class="activity-item" style="align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:11px;font-weight:700;color:var(--text3);min-width:22px">#${i + 1}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;color:var(--text)">${c.nombre}</div>
        <div style="font-size:11px;color:var(--text3)">${c.cantidad} compra${c.cantidad !== 1 ? 's' : ''}</div>
      </div>
      <div style="font-size:13px;font-weight:600;color:var(--blue)">${formatCOP(c.total)}</div>
    </div>`).join('');
}

// ── Stock crítico ─────────────────────────────────────────────────────────────
function renderStockCritico(productos) {
  const criticos = productos
    .filter(p => p.activo && p.categoria !== 'servicios' && p.stock <= p.stock_minimo)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  const el = document.getElementById('rep-stock-critico');
  if (!el) return;

  if (criticos.length === 0) {
    el.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--green);padding:20px"><i class="ti ti-circle-check"></i> Todo el stock está en niveles normales</td></tr>';
    return;
  }

  el.innerHTML = criticos.map(p => {
    const badge = p.stock === 0
      ? '<span class="badge badge-red">Sin stock</span>'
      : '<span class="badge badge-amber">Stock bajo</span>';
    const faltantes = Math.max(0, p.stock_minimo - p.stock);
    return `
      <tr>
        <td style="font-weight:500">${p.nombre}</td>
        <td><code style="font-size:12px">${p.sku || '—'}</code></td>
        <td>${badge}</td>
        <td style="font-weight:600">${p.stock} / ${p.stock_minimo}</td>
        <td style="color:var(--red)">${faltantes > 0 ? `−${faltantes}` : '—'}</td>
      </tr>`;
  }).join('');
}

// ── Tabla de ventas recientes ─────────────────────────────────────────────────
function renderTablaVentas(ventas, usuarios, clientes) {
  const el = document.getElementById('rep-tabla-ventas');
  if (!el) return;

  const recientes = [...ventas]
    .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
    .slice(0, 15);

  if (recientes.length === 0) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:20px">Sin ventas en el período seleccionado</td></tr>';
    return;
  }

  const metodoBadge = m => ({
    efectivo: '<span class="badge badge-green">Efectivo</span>',
    tarjeta: '<span class="badge badge-blue">Tarjeta</span>',
    transferencia: '<span class="badge badge-amber">Transferencia</span>',
  }[m] || `<span class="badge badge-gray">${m || '—'}</span>`);

  el.innerHTML = recientes.map(v => {
    const vendedor = v.vendedor_nombre || usuarios.find(u => u.id == v.vendedor_id)?.nombre || '—';
    const cliente = v.cliente_nombre || clientes.find(c => c.id == v.cliente_id)?.nombre || '—';
    const fecha = v.creado_en ? v.creado_en.slice(0, 10) : '—';
    return `
      <tr>
        <td style="font-weight:600;color:var(--accent)">#${String(v.id).padStart(4,'0')}</td>
        <td>${vendedor}</td>
        <td>${cliente}</td>
        <td style="font-weight:600">${formatCOP(v.total)}</td>
        <td>${metodoBadge(v.metodo_pago)}</td>
        <td class="td-muted">${fecha}</td>
      </tr>`;
  }).join('');
}

// ── Resumen órdenes ───────────────────────────────────────────────────────────
function renderOrdenesResumen(ordenes) {
  const estados = {
    pendiente: 0,
    en_proceso: 0,
    completado: 0,
    entregado: 0,
    cancelado: 0
  };
  ordenes.forEach(o => {
    if (estados[o.estado] !== undefined) estados[o.estado]++;
    else estados[o.estado] = (estados[o.estado] || 0) + 1;
  });

  const total = ordenes.length || 1;
  const colores = {
    pendiente: 'var(--amber)',
    en_proceso: 'var(--blue)',
    completado: 'var(--green)',
    entregado: 'var(--accent)',
    cancelado: 'var(--red)'
  };
  const etiquetas = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    completado: 'Completado',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };

  const el = document.getElementById('rep-ordenes-estado');
  if (!el) return;

  el.innerHTML = Object.entries(estados)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([est, cnt]) => {
      const pct = Math.round((cnt / total) * 100);
      const color = colores[est] || 'var(--text3)';
      return `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span style="color:var(--text)">${etiquetas[est] || est}</span>
            <span style="color:var(--text2)">${cnt} (${pct}%)</span>
          </div>
          <div style="background:var(--bg3);border-radius:4px;height:8px">
            <div style="height:100%;border-radius:4px;background:${color};width:${pct}%;transition:width .6s"></div>
          </div>
        </div>`;
    }).join('') || '<div style="color:var(--text3);font-size:13px;padding:8px 0">Sin órdenes en el período</div>';
}

// ── Filtros de fecha ──────────────────────────────────────────────────────────
function aplicarFiltroFechas() {
  const desde = document.getElementById('rep-desde');
  const hasta = document.getElementById('rep-hasta');
  repFiltroDesde = desde ? desde.value : '';
  repFiltroHasta = hasta ? hasta.value : '';
  cargarReportes();
}

// ── Limpiar Filtros ───────────────────────────────────────────────────────────
function limpiarFiltros() {
  const elDesde = document.getElementById('rep-desde');
  const elHasta = document.getElementById('rep-hasta');
  if (elDesde) elDesde.value = '';
  if (elHasta) elHasta.value = '';
  repFiltroDesde = '';
  repFiltroHasta = '';
  cargarReportes();
}

// ── Exportar Excel (.xlsx) con formato ───────────────────────────────────────
async function exportarCSV() {
  if (typeof XLSX === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  try {
    const [ventas, ordenes, facturas, productos, usuarios, clientes] = await Promise.all([
      fetch(`${API}/ventas`).then(r => r.json()),
      fetch(`${API}/ordenes`).then(r => r.json()),
      fetch(`${API}/facturas`).then(r => r.json()),
      fetch(`${API}/productos`).then(r => r.json()),
      fetch(`${API}/usuarios`).then(r => r.json()),
      fetch(`${API}/clientes`).then(r => r.json()),
    ]);

    const ventasFiltradas = filtrarPorFecha(ventas, 'creado_en');
    const ordenesFiltradas = filtrarPorFecha(ordenes, 'creado_en');
    const facturasFiltradas = filtrarPorFecha(facturas, 'fecha_emision');

    const wb = XLSX.utils.book_new();

    // ── HOJA 1: Ventas ────────────────────────────────────────────────────────
    const hdrVentas = ['ID', 'Fecha', 'Vendedor', 'Cliente', 'Subtotal', 'Descuento', 'Impuestos', 'Total', 'Método de Pago', 'Estado'];
    const filasVentas = ventasFiltradas
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
      .map(v => {
        const vendedor = v.vendedor_nombre || usuarios.find(u => u.id == v.vendedor_id)?.nombre || '—';
        const cliente  = v.cliente_nombre  || clientes.find(c => c.id == v.cliente_id)?.nombre  || '—';
        return [
          `#${String(v.id).padStart(4, '0')}`,
          v.creado_en ? v.creado_en.slice(0, 10) : '—',
          vendedor,
          cliente,
          parseFloat(v.subtotal  || 0),
          parseFloat(v.descuento || 0),
          parseFloat(v.impuestos || 0),
          parseFloat(v.total     || 0),
          v.metodo_pago || '—',
          v.estado      || '—',
        ];
      });

    const sumar = col => filasVentas.reduce((s, r) => s + (r[col] || 0), 0);
    const filaTotal = ['', '', '', 'TOTAL', sumar(4), sumar(5), sumar(6), sumar(7), '', ''];

    const wsVentas = XLSX.utils.aoa_to_sheet([hdrVentas, ...filasVentas, filaTotal]);
    wsVentas['!cols'] = [
      { wch: 8 }, { wch: 12 }, { wch: 22 }, { wch: 22 }, { wch: 14 },
      { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 14 }
    ];

    const nFmt = '#,##0.00';
    const numCols = [4, 5, 6, 7];
    for (let r = 1; r <= filasVentas.length + 1; r++) {
      numCols.forEach(c => {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (wsVentas[addr]) wsVentas[addr].z = nFmt;
      });
    }
    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');

    // ── HOJA 2: Órdenes de Servicio ───────────────────────────────────────────
    const hdrOrdenes = ['ID', 'Cliente ID', 'Equipo', 'Estado', 'Tipo Entrega', 'Costo Servicio', 'Fecha Promesa', 'Creado En'];
    const filasOrdenes = ordenesFiltradas
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
      .map(o => [
        `#${String(o.id).padStart(4, '0')}`,
        o.cliente_id || '—',
        `${o.equipo || ''}${o.marca ? ' ' + o.marca : ''}${o.modelo ? ' ' + o.modelo : ''}`.trim() || '—',
        o.estado || '—',
        o.tipo_entrega || '—',
        parseFloat(o.costo_servicio || 0),
        o.fecha_promesa ? o.fecha_promesa.slice(0, 10) : '—',
        o.creado_en ? o.creado_en.slice(0, 10) : '—',
      ]);

    const wsOrdenes = XLSX.utils.aoa_to_sheet([hdrOrdenes, ...filasOrdenes]);
    wsOrdenes['!cols'] = [
      { wch: 8 }, { wch: 12 }, { wch: 26 }, { wch: 14 },
      { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    ];
    for (let r = 1; r <= filasOrdenes.length; r++) {
      const addr = XLSX.utils.encode_cell({ r, c: 5 });
      if (wsOrdenes[addr]) wsOrdenes[addr].z = nFmt;
    }
    XLSX.utils.book_append_sheet(wb, wsOrdenes, 'Órdenes');

    // ── HOJA 3: Stock Crítico ─────────────────────────────────────────────────
    const criticos = productos
      .filter(p => p.activo && p.categoria !== 'servicios' && p.stock <= p.stock_minimo)
      .sort((a, b) => a.stock - b.stock);

    const hdrStock = ['SKU', 'Nombre', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Faltantes', 'Precio Venta', 'Valor en Riesgo'];
    const filasStock = criticos.map(p => {
      const faltantes = Math.max(0, p.stock_minimo - p.stock);
      const precioVenta = parseFloat(p.precio_venta || 0);
      return [p.sku || '—', p.nombre, p.categoria, p.stock, p.stock_minimo, faltantes, precioVenta, faltantes * precioVenta];
    });

    const wsStock = XLSX.utils.aoa_to_sheet([hdrStock, ...filasStock]);
    wsStock['!cols'] = [
      { wch: 14 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
      { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 },
    ];
    for (let r = 1; r <= filasStock.length; r++) {
      [6, 7].forEach(c => {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (wsStock[addr]) wsStock[addr].z = nFmt;
      });
    }
    XLSX.utils.book_append_sheet(wb, wsStock, 'Stock Crítico');

    // ── HOJA 4: Resumen General ───────────────────────────────────────────────
    const desde = repFiltroDesde || '(todo)';
    const hasta  = repFiltroHasta || '(todo)';
    const totalVentas   = ventasFiltradas.reduce((s, v) => s + parseFloat(v.total || 0), 0);
    const totalOrdenes  = ordenesFiltradas.reduce((s, o) => s + parseFloat(o.costo_servicio || 0), 0);
    const ordenesComp   = ordenesFiltradas.filter(o => o.estado === 'completado' || o.estado === 'entregado').length;
    const productosSinStock = productos.filter(p => p.activo && p.stock === 0 && p.categoria !== 'servicios').length;

    const resumenData = [
      ['Reporte Generado', new Date().toLocaleString('es-CO')],
      ['Período Desde',    desde],
      ['Período Hasta',    hasta],
      [],
      ['INDICADOR', 'VALOR'],
      ['Total Ingresos (Ventas)',       totalVentas],
      ['Número de Ventas',              ventasFiltradas.length],
      ['Ticket Promedio',               ventasFiltradas.length ? totalVentas / ventasFiltradas.length : 0],
      ['Total Órdenes de Servicio',     ordenesFiltradas.length],
      ['Órdenes Completadas',           ordenesComp],
      ['Ingresos por Servicios',        totalOrdenes],
      ['Facturas Emitidas',             facturasFiltradas.length],
      ['Productos Sin Stock',           productosSinStock],
      ['Productos en Stock Crítico',    criticos.length],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 28 }, { wch: 20 }];
    [5, 7, 11].forEach(r => {
      const addr = XLSX.utils.encode_cell({ r, c: 1 });
      if (wsResumen[addr]) wsResumen[addr].z = nFmt;
    });
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // ── Descargar ─────────────────────────────────────────────────────────────
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `VA_Control_Reporte_${fecha}.xlsx`);

  } catch (err) {
    console.error('Error exportando Excel:', err);
    alert('No se pudo generar el reporte. Verifica que el servidor esté activo.');
  }
}

// ── Helpers UI ────────────────────────────────────────────────────────────────
function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function mostrarSkeletons() {
  ['rep-ingresos', 'rep-ordenes-comp', 'rep-sin-stock', 'rep-facturas'].forEach(id => {
    set(id, '...');
  });
}

function mostrarError(msg) {
  const zonas = ['rep-grafica-meses', 'rep-metodos', 'rep-categorias', 'rep-vendedores', 'rep-top-clientes'];
  zonas.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="color:var(--red);font-size:12px;padding:8px 0"><i class="ti ti-alert-circle"></i> ${msg}</div>`;
  });
}