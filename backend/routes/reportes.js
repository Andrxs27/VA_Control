/* ═══════════════════════════════════════════════════
   VA Control — reportes.js
   Manejo de peticiones asíncronas y renderizado de gráficos nativos.
═══════════════════════════════════════════════════ */

// Configuración de la URL del Backend (Cámbiala según tu entorno de despliegue)
const API = 'http://localhost:3000/api';

/* ── Mapeo estricto de Categorías (alineado con los CHECKs de la Base de Datos) ── */
const MAPA_CATEGORIAS = {
  'electronicos': 'Electrónicos',
  'repuestos': 'Repuestos',
  'servicios': 'Servicios de Taller'
};

/* ── Helpers de fecha ── */
function primerDiaMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}
function hoy() { return new Date().toISOString().split('T')[0]; }

/* ── Auth header ── */
function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

/* ── Toast de notificaciones ── */
function toast(msg, type = 'info') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ── Formatear moneda nacional (es-CO) ── */
function fmt(n) {
  if (n === null || n === undefined) return '—';
  return '$' + Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0 });
}

/* ── Inicializar filtros por defecto ── */
document.getElementById('filtro-desde').value = primerDiaMes();
document.getElementById('filtro-hasta').value = hoy();

/* ── Sidebar usuario (Decodificación del JWT) ── */
(function cargarUsuario() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const nombre = payload.nombre || payload.email || 'Usuario';
    const rol    = payload.rol    || '';
    
    document.getElementById('sidebar-user-name').textContent = nombre;
    document.getElementById('sidebar-user-rol').textContent  = rol.charAt(0).toUpperCase() + rol.slice(1);
    
    const initials = nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('user-avatar-initials').textContent = initials;
  } catch (_) {}
})();

/* ═══════════════ FETCH HELPERS ═══════════════ */

async function fetchResumen(desde, hasta) {
  const r = await fetch(`${API}/reportes/resumen?desde=${desde}&hasta=${hasta}`, { headers: authHeader() });
  if (!r.ok) throw new Error('Error al cargar resumen');
  return r.json();
}

async function fetchVentasMes(anio) {
  const r = await fetch(`${API}/reportes/ventas-mes?anio=${anio}`, { headers: authHeader() });
  if (!r.ok) throw new Error('Error al cargar ventas mensuales');
  return r.json();
}

async function fetchCategorias(desde, hasta) {
  const r = await fetch(`${API}/reportes/categorias?desde=${desde}&hasta=${hasta}`, { headers: authHeader() });
  if (!r.ok) throw new Error('Error al cargar categorías');
  return r.json();
}

async function fetchVendedores(desde, hasta) {
  const r = await fetch(`${API}/reportes/vendedores?desde=${desde}&hasta=${hasta}`, { headers: authHeader() });
  if (!r.ok) throw new Error('Error al cargar vendedores');
  return r.json();
}

async function fetchStockCritico() {
  const r = await fetch(`${API}/reportes/stock-critico`, { headers: authHeader() });
  if (!r.ok) throw new Error('Error al cargar stock crítico');
  return r.json();
}

/* ═══════════════ RENDER KPIs ═══════════════ */

function renderKPIs(data) {
  document.getElementById('kpi-ingresos').textContent     = fmt(data.ingresos_total);
  document.getElementById('kpi-ingresos-sub').textContent = `${data.total_ventas ?? 0} ventas`;
  document.getElementById('kpi-ordenes').textContent      = data.ordenes_completadas ?? '0';
  document.getElementById('kpi-ordenes-sub').textContent  = `de ${data.total_ordenes ?? 0} en total`;
  document.getElementById('kpi-sin-stock').textContent    = data.productos_sin_stock ?? '0';
  document.getElementById('kpi-facturas').textContent     = data.facturas_emitidas ?? '0';
  document.getElementById('kpi-facturas-sub').textContent = fmt(data.facturacion_total);
}

/* ═══════════════ RENDER GRÁFICA LINEAL VENTAS/MES ═══════════════ */

function renderLineChart(datos) {
  const canvas = document.getElementById('canvas-ventas-mes');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.offsetWidth  || canvas.parentElement.offsetWidth || 800;
  const H   = 180;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const PAD = { top: 20, right: 20, bottom: 36, left: 56 };
  const cW   = W - PAD.left - PAD.right;
  const cH   = H - PAD.top  - PAD.bottom;

  const totales = Array(12).fill(0);
  (datos || []).forEach(d => { totales[(d.mes || d.month) - 1] = Number(d.total) || 0; });

  const maxVal = Math.max(...totales, 1);
  const accent = '#6c8cff';
  const border = '#2a2d3e';
  const text3  = '#8b8fa8';

  // Líneas de guía horizontales
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  [0, .25, .5, .75, 1].forEach(pct => {
    const y = PAD.top + cH * (1 - pct);
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cW, y); ctx.stroke();
    ctx.fillStyle = text3;
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmt(maxVal * pct), PAD.left - 6, y + 4);
  });

  // Relleno degradado inferior de la curva
  const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
  grad.addColorStop(0, 'rgba(108,140,255,.22)');
  grad.addColorStop(1, 'rgba(108,140,255,0)');
  ctx.beginPath();
  totales.forEach((v, i) => {
    const x = PAD.left + (i / 11) * cW;
    const y = PAD.top  + cH * (1 - v / maxVal);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(PAD.left + cW, PAD.top + cH);
  ctx.lineTo(PAD.left,       PAD.top + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Trazo de la línea principal
  ctx.beginPath();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  totales.forEach((v, i) => {
    const x = PAD.left + (i / 11) * cW;
    const y = PAD.top  + cH * (1 - v / maxVal);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dibujar puntos en los nodos de los meses
  totales.forEach((v, i) => {
    const x = PAD.left + (i / 11) * cW;
    const y = PAD.top  + cH * (1 - v / maxVal);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = '#13151f';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Eje X - Nombres de los meses
  ctx.fillStyle = text3;
  ctx.font = '11px DM Sans, sans-serif';
  ctx.textAlign = 'center';
  meses.forEach((m, i) => {
    const x = PAD.left + (i / 11) * cW;
    ctx.fillText(m, x, H - 8);
  });
}

/* ═══════════════ RENDER CATEGORÍAS ═══════════════ */

const COLORES_BAR = ['', 'green', 'amber', 'purple', 'teal', 'red'];

function renderCategorias(datos) {
  const el = document.getElementById('rep-categorias');
  if (!el) return;
  if (!datos || datos.length === 0) {
    el.innerHTML = '<div class="empty-state"><i class="ti ti-chart-pie-off"></i>Sin datos en este período</div>';
    return;
  }
  
  const max = Math.max(...datos.map(d => Number(d.total)));
  el.innerHTML = datos.map((d, i) => {
    const pct = max > 0 ? (Number(d.total) / max * 100).toFixed(1) : 0;
    const color = COLORES_BAR[i % COLORES_BAR.length] || '';
    
    // Convertir el token crudo de la BD a texto formateado legible para el usuario
    const nombreCategoria = MAPA_CATEGORIAS[d.categoria] || d.categoria || 'Otro';
    
    return `
      <div class="bar-row">
        <div class="bar-label">${nombreCategoria}</div>
        <div class="bar-track">
          <div class="bar-fill ${color}" style="width:${pct}%">
            <span class="bar-val">${fmt(d.total)}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ═══════════════ RENDER VENDEDORES ═══════════════ */

const RANK_CLASS = ['gold', 'silver', 'bronze'];

function renderVendedores(datos) {
  const el = document.getElementById('rep-vendedores');
  if (!el) return;
  if (!datos || datos.length === 0) {
    el.innerHTML = '<div class="empty-state"><i class="ti ti-users-off"></i>Sin datos en este período</div>';
    return;
  }
  el.innerHTML = datos.slice(0, 8).map((v, i) => `
    <div class="vendedor-row">
      <div class="vend-rank ${RANK_CLASS[i] || ''}">${i + 1}</div>
      <div class="vend-info">
        <div class="vend-name">${v.nombre || 'Vendedor'}</div>
        <div class="vend-email">${v.email || ''}</div>
      </div>
      <div class="vend-amount">${fmt(v.total)}</div>
    </div>`).join('');
}

/* ═══════════════ RENDER STOCK CRÍTICO ═══════════════ */

function renderStockCritico(datos) {
  const tbody = document.getElementById('tabla-stock-critico');
  if (!tbody) return;
  if (!datos || datos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="ti ti-mood-happy"></i>¡Todo en orden! No hay productos con stock crítico.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = datos.map(p => {
    const sinStock = Number(p.stock) <= 0;
    const badge = sinStock
      ? '<span class="badge-stock sin-stock">Sin stock</span>'
      : '<span class="badge-stock bajo">Stock bajo</span>';
      
    const nombreCategoria = MAPA_CATEGORIAS[p.categoria] || p.categoria || '—';

    return `
      <tr>
        <td>${p.sku || '—'}</td>
        <td style="color:var(--text1);font-weight:500">${p.nombre || '—'}</td>
        <td>${nombreCategoria}</td>
        <td style="color:${sinStock ? '#ef4444' : '#f59e0b'};font-weight:700">${p.stock ?? 0}</td>
        <td>${p.stock_minimo ?? 5}</td>
        <td>${badge}</td>
      </tr>`;
  }).join('');
}

/* ═══════════════ CARGA PRINCIPAL DE DATOS ═══════════════ */

async function cargarTodo() {
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  const anio  = new Date().getFullYear();

  // Animación o estado de carga visual en los KPIs
  ['kpi-ingresos','kpi-ordenes','kpi-sin-stock','kpi-facturas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '…';
  });

  try {
    const [resumen, ventasMes, categorias, vendedores, stock] = await Promise.allSettled([
      fetchResumen(desde, hasta),
      fetchVentasMes(anio),
      fetchCategorias(desde, hasta),
      fetchVendedores(desde, hasta),
      fetchStockCritico(),
    ]);

    if (resumen.status === 'fulfilled')    renderKPIs(resumen.value);
    else { console.error(resumen.reason); toast('Error al cargar resumen', 'error'); }

    if (ventasMes.status === 'fulfilled')  renderLineChart(ventasMes.value);
    else { console.error(ventasMes.reason); }

    if (categorias.status === 'fulfilled') renderCategorias(categorias.value);
    else { document.getElementById('rep-categorias').innerHTML = '<div class="empty-state"><i class="ti ti-wifi-off"></i>Error al cargar</div>'; }

    if (vendedores.status === 'fulfilled') renderVendedores(vendedores.value);
    else { document.getElementById('rep-vendedores').innerHTML = '<div class="empty-state"><i class="ti ti-wifi-off"></i>Error al cargar</div>'; }

    if (stock.status === 'fulfilled')      renderStockCritico(stock.value);
    else { document.getElementById('tabla-stock-critico').innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3)">Error al cargar</td></tr>'; }

  } catch (err) {
    console.error(err);
    toast('Error inesperado al cargar reportes', 'error');
  }
}

function aplicarFiltros() { cargarTodo(); }

/* ═══════════════ EXPORTAR HISTÓRICO CSV ═══════════════ */

async function exportarCSV() {
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  try {
    const r = await fetch(`${API}/reportes/export-csv?desde=${desde}&hasta=${hasta}`, { headers: authHeader() });
    if (!r.ok) throw new Error('No se pudo generar el CSV');
    
    const blob = await r.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `reporte_${desde}_${hasta}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    toast('CSV descargado correctamente', 'success');
  } catch (err) {
    console.error(err);
    toast('Error al exportar: ' + err.message, 'error');
  }
}

/* ── Redibujar gráfica al cambiar el tamaño de la ventana (Responsivo) ── */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const desde = document.getElementById('filtro-desde').value;
    const anio  = new Date().getFullYear();
    // Redibujamos solo la gráfica para evitar peticiones masivas e innecesarias a la BD
    fetchVentasMes(anio).then(data => renderLineChart(data)).catch(e => console.error(e));
  }, 300);
});

/* ── Inicialización automática al arrancar la vista ── */
cargarTodo();