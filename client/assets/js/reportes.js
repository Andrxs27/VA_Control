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

// ── Gráfica ventas últimos 6 meses ───────────────────────────────────────────
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

  el.className = 'chart-bars';
  el.innerHTML = meses.map(m => {
    const pct = Math.round((m.total / maxV) * 100);
    const esActual = m.key === hoy();
    const color = esActual ? 'var(--accent)' : 'var(--border2)';
    return `
      <div class="bar-item" title="${m.label}: ${formatCOP(m.total)}">
        <div class="bar" style="height:${Math.max(pct,2)}%;background:${color};min-height:3px;border-radius:3px 3px 0 0;transition:height .5s"></div>
        <span class="bar-label">${m.label}</span>
      </div>`;
  }).join('');
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
  // Construir mapa producto → categoría
  const catMap = {};
  productos.forEach(p => { catMap[p.id] = p.categoria || 'sin_categoría'; });

  const totalesCat = {};
  // Sin detalle de venta en el fetch básico, simular con proporciones reales de productos
  // Si hay detalles disponibles, usarlos; sino agrupar por vendedor
  ventas.forEach(v => {
    // Usamos el total de la venta y lo asignamos a "general" si no hay detalle
    totalesCat['ventas'] = (totalesCat['ventas'] || 0) + parseFloat(v.total || 0);
  });

  // Calcular stock por categoría como indicador
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

function limpiarFiltros() {
  const elDesde = document.getElementById('rep-desde');
  const elHasta = document.getElementById('rep-hasta');
  if (elDesde) elDesde.value = '';
  if (elHasta) elHasta.value = '';
  repFiltroDesde = '';
  repFiltroHasta = '';
  cargarReportes();
}

// ── Exportar CSV ──────────────────────────────────────────────────────────────
async function exportarCSV() {
  try {
    const [ventas, usuarios, clientes] = await Promise.all([
      fetch(`${API}/ventas`).then(r => r.json()),
      fetch(`${API}/usuarios`).then(r => r.json()),
      fetch(`${API}/clientes`).then(r => r.json()),
    ]);

    const ventasFiltradas = filtrarPorFecha(ventas, 'creado_en');

    const cabeceras = ['ID', 'Fecha', 'Vendedor', 'Cliente', 'Subtotal', 'Descuento', 'Impuestos', 'Total', 'Método de Pago', 'Estado'];
    const filas = ventasFiltradas.map(v => {
      const vendedor = v.vendedor_nombre || usuarios.find(u => u.id == v.vendedor_id)?.nombre || '';
      const cliente = v.cliente_nombre || clientes.find(c => c.id == v.cliente_id)?.nombre || '';
      return [
        `#${String(v.id).padStart(4, '0')}`,
        v.creado_en ? v.creado_en.slice(0, 10) : '',
        vendedor,
        cliente,
        v.subtotal || 0,
        v.descuento || 0,
        v.impuestos || 0,
        v.total || 0,
        v.metodo_pago || '',
        v.estado || ''
      ].map(c => `"${c}"`).join(',');
    });

    const csv = [cabeceras.join(','), ...filas].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_ventas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exportando CSV:', err);
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
