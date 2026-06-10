// ============================================================
// inventario.js — Módulo de Control de Inventario
// VA Control — Andres (Corregido y Optimizado)
// ============================================================

const API = 'http://localhost:3000/api';

let inventarioListado = [];       // Cache del listado actual
let productoDetalle = null;       // Producto abierto en el panel de historial
let filtroInvTexto = '';
let filtroInvEstado = '';

// ==================== TOAST NOTIFICATION ====================
function toast(msg, type='info') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = {success:'ti-circle-check', error:'ti-circle-x', info:'ti-info-circle', warning:'ti-alert-triangle'};
  t.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(()=>t.remove(), 3500);
}

// Interfaz helper para evitar errores si authHeaders no viene de auth.js
function obtenerHeaders () {
  return typeof authHeaders === 'function' ? authHeaders() : { 'Content-Type': 'application/json' };
}

// ==================== 1. RENDER PRINCIPAL ====================

async function renderInventario() {
  try {
    const res = await fetch(`${API}/inventario`, { headers: obtenerHeaders() });
    if (!res.ok) throw new Error('No se pudo cargar el inventario');
    inventarioListado = await res.json();

    _renderKPIs(inventarioListado);
    _renderTablaInventario(inventarioListado);
  } catch (err) {
    toast('Error al cargar inventario: ' + err.message, 'error');
  }
}

function _renderKPIs(data) {
  const total    = data.length;
  const sinStock = data.filter(p => p.estado_stock === 'sin_stock').length;
  const bajo     = data.filter(p => p.estado_stock === 'stock_bajo').length;
  const normal   = data.filter(p => p.estado_stock === 'normal').length;

  const kpiEl = document.getElementById('inv-kpis');
  if (!kpiEl) return;

  kpiEl.innerHTML = `
    <div class="kpi-card kpi-blue" style="cursor:default">
      <div class="kpi-label">Total Productos</div>
      <div class="kpi-value">${total}</div>
      <div class="kpi-sub"><i class="ti ti-package"></i> con seguimiento de stock</div>
      <i class="ti ti-package kpi-icon"></i>
    </div>
    <div class="kpi-card kpi-green" style="cursor:default">
      <div class="kpi-label">Stock Normal</div>
      <div class="kpi-value">${normal}</div>
      <div class="kpi-sub"><i class="ti ti-circle-check"></i> por encima del mínimo</div>
      <i class="ti ti-circle-check kpi-icon"></i>
    </div>
    <div class="kpi-card kpi-amber" style="cursor:default">
      <div class="kpi-label">Stock Bajo</div>
      <div class="kpi-value">${bajo}</div>
      <div class="kpi-sub"><i class="ti ti-alert-triangle"></i> requieren reposición</div>
      <i class="ti ti-alert-triangle kpi-icon"></i>
    </div>
    <div class="kpi-card kpi-red" style="cursor:default">
      <div class="kpi-label">Sin Stock</div>
      <div class="kpi-value">${sinStock}</div>
      <div class="kpi-sub"><i class="ti ti-circle-x"></i> agotados</div>
      <i class="ti ti-circle-x kpi-icon"></i>
    </div>
  `;
}

function _renderTablaInventario(data) {
  const tbody = document.getElementById('tb-inventario');
  if (!tbody) return;

  let filtrados = data;
  if (filtroInvTexto) {
    const q = filtroInvTexto.toLowerCase();
    filtrados = filtrados.filter(p =>
      p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }
  if (filtroInvEstado) {
    filtrados = filtrados.filter(p => p.estado_stock === filtroInvEstado);
  }

  if (!filtrados.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">
      No se encontraron productos con los criterios de búsqueda
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtrados.map(p => {
    const pct = p.stock_minimo > 0
      ? Math.min(Math.round((p.stock / (p.stock_minimo * 3)) * 100), 100)
      : 100;

    const barColor = p.estado_stock === 'sin_stock'
      ? 'var(--red)'
      : p.estado_stock === 'stock_bajo'
        ? 'var(--amber)'
        : 'var(--green)';

    const badge = p.estado_stock === 'sin_stock'
      ? `<span class="badge badge-red">Sin stock</span>`
      : p.estado_stock === 'stock_bajo'
        ? `<span class="badge badge-amber">Stock bajo</span>`
        : `<span class="badge badge-green">Normal</span>`;

    const ultimoMov = p.ultimo_movimiento
      ? _formatFecha(p.ultimo_movimiento)
      : '<span style="color:var(--text3)">—</span>';

    return `
      <tr>
        <td><code>${p.sku}</code></td>
        <td>${p.nombre}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="min-width:32px;font-weight:600;${p.stock === 0 ? 'color:var(--red)' : p.estado_stock === 'stock_bajo' ? 'color:var(--amber)' : ''}">${p.stock}</span>
            <div style="flex:1;background:var(--bg4);border-radius:4px;height:6px;min-width:80px">
              <div style="width:${pct}%;background:${barColor};height:6px;border-radius:4px;transition:width .3s"></div>
            </div>
          </div>
        </td>
        <td style="color:var(--text2)">${p.stock_minimo}</td>
        <td>${badge}</td>
        <td style="color:var(--text2);font-size:12px">${ultimoMov}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="abrirModalMovimiento(${p.id})" title="Registrar movimiento">
            <i class="ti ti-arrows-exchange"></i>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="verHistorial(${p.id})" title="Ver historial">
            <i class="ti ti-history"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==================== 2. FILTROS ====================

function filtrarInventario(valor) {
  filtroInvTexto = valor.toLowerCase().trim();
  _renderTablaInventario(inventarioListado);
}

function filtrarPorEstadoStock(estado) {
  filtroInvEstado = estado;
  _renderTablaInventario(inventarioListado);
}

// ==================== 3. MODAL MOVIMIENTO ====================

async function _cargarSelectProductos() {
  const sel = document.getElementById('mov-producto');
  if (!sel) return;

  let opciones = [];
  try {
    opciones = inventarioListado.length
      ? inventarioListado
      : await fetch(`${API}/inventario`, { headers: obtenerHeaders() }).then(r => r.json());
  } catch (e) {
    console.error("Error cargando productos al select", e);
    opciones = [];
  }

  sel.innerHTML = '<option value="">— Seleccionar producto —</option>' +
    opciones.map(p => `<option value="${p.id}">${p.sku} — ${p.nombre} (Stock: ${p.stock})</option>`).join('');
}

function abrirModalMovimiento(productoId = null) {
  _cargarSelectProductos()
    .then(() => {
      const sel = document.getElementById('mov-producto');
      const cantidad = document.getElementById('mov-cantidad');
      const motivo = document.getElementById('mov-motivo');
      const tipo = document.getElementById('mov-tipo');
      const labelCantidad = document.getElementById('label-mov-cantidad');

      if (cantidad) cantidad.value = '';
      if (motivo) motivo.value = '';
      if (tipo) tipo.value = 'entrada';
      if (labelCantidad) labelCantidad.textContent = 'Cantidad *';

      if (productoId && sel) {
        sel.value = productoId;
        _actualizarInfoStock(productoId);
      } else {
        if (sel) sel.value = '';
        _limpiarInfoStock();
      }

      openModal('modal-movimiento');
    })
    .catch(err => {
      console.error("Error al abrir modal movimiento:", err);
      toast("No se pudo preparar el formulario de movimientos", "error");
    });
}

function onCambioTipoMovimiento() {
  const tipo = document.getElementById('mov-tipo').value;
  const labelCantidad = document.getElementById('label-mov-cantidad');
  if (labelCantidad) {
    labelCantidad.textContent = tipo === 'ajuste' ? 'Nuevo stock total *' : 'Cantidad *';
  }
  const productoId = document.getElementById('mov-producto')?.value;
  if (productoId) _actualizarInfoStock(productoId);
}

function onCambioProductoMovimiento() {
  const productoId = document.getElementById('mov-producto')?.value;
  if (productoId) {
    _actualizarInfoStock(productoId);
  } else {
    _limpiarInfoStock();
  }
}

function _actualizarInfoStock(productoId) {
  const prod = inventarioListado.find(p => p.id === parseInt(productoId));
  const infoEl = document.getElementById('mov-info-stock');
  if (!infoEl || !prod) return;

  const colorStock = prod.estado_stock === 'sin_stock'
    ? 'var(--red)'
    : prod.estado_stock === 'stock_bajo'
      ? 'var(--amber)'
      : 'var(--green)';

  infoEl.innerHTML = `
    <div style="display:flex;gap:16px;font-size:12px;padding:10px 12px;background:var(--bg4);border-radius:8px;margin-top:4px">
      <span>Stock actual: <strong style="color:${colorStock}">${prod.stock} uds.</strong></span>
      <span>Mínimo: <strong style="color:var(--text2)">${prod.stock_minimo} uds.</strong></span>
    </div>
  `;
}

function _limpiarInfoStock() {
  const infoEl = document.getElementById('mov-info-stock');
  if (infoEl) infoEl.innerHTML = '';
}

async function guardarMovimiento() {
  const productoId = document.getElementById('mov-producto')?.value;
  const tipo       = document.getElementById('mov-tipo')?.value;
  const cantidad   = document.getElementById('mov-cantidad')?.value;
  const motivo     = document.getElementById('mov-motivo')?.value.trim();

  if (!productoId || !tipo || !cantidad) {
    toast('Completa los campos obligatorios: producto, tipo y cantidad', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/inventario/movimientos`, {
      method: 'POST',
      headers: obtenerHeaders(),
      body: JSON.stringify({
        producto_id: parseInt(productoId),
        tipo,
        cantidad: parseInt(cantidad),
        motivo: motivo || null
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrar el movimiento');

    toast(data.mensaje || 'Movimiento registrado correctamente', 'success');
    closeModal('modal-movimiento');
    renderInventario(); 
  } catch (err) {
    toast(err.message, 'error');
  }
}

// ==================== 4. PANEL HISTORIAL ====================

async function verHistorial(productoId) {
  try {
    const res = await fetch(`${API}/inventario/movimientos/${productoId}`, {
      headers: obtenerHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cargar historial');

    productoDetalle = data.producto;
    _renderPanelHistorial(data.producto, data.movimientos);
    openModal('modal-historial');
  } catch (err) {
    console.error(err);
    toast('Error al cargar el historial: ' + err.message, 'error');
  }
}

function _renderPanelHistorial(producto, movimientos) {
  const tituloEl = document.getElementById('historial-titulo');
  if (tituloEl) tituloEl.textContent = `Historial — ${producto.sku} · ${producto.nombre}`;

  const tbody = document.getElementById('tb-historial');
  if (!tbody) return;

  if (!movimientos || !movimientos.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:20px">
      Este producto aún no tiene movimientos registrados
    </td></tr>`;
    return;
  }

  tbody.innerHTML = movimientos.map(m => {
    const iconTipo = m.tipo === 'entrada'
      ? `<span style="color:var(--green)"><i class="ti ti-arrow-up-right"></i> Entrada</span>`
      : m.tipo === 'salida'
        ? `<span style="color:var(--red)"><i class="ti ti-arrow-down-left"></i> Salida</span>`
        : `<span style="color:var(--blue)"><i class="ti ti-adjustments"></i> Ajuste</span>`;

    const delta = m.stock_despues - m.stock_antes;
    const signo = delta >= 0 ? '+' : '';
    const colorDelta = delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--text2)';

    return `
      <tr>
        <td style="font-size:12px;color:var(--text2)">${_formatFecha(m.creado_en)}</td>
        <td>${iconTipo}</td>
        <td style="font-weight:600;color:${colorDelta}">${signo}${delta} uds.</td>
        <td>${m.stock_antes} → ${m.stock_despues}</td>
        <td style="color:var(--text2);font-size:12px">${m.motivo || '—'}</td>
      </tr>
    `;
  }).join('');
}

// ==================== 5. UTILS Y MANEJO DE MODALES ====================

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function _formatFecha(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Forzar mapeo al objeto global Window para que funcionen con los onclick inline del HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.abrirModalMovimiento = abrirModalMovimiento;
window.guardarMovimiento = guardarMovimiento;
window.verHistorial = verHistorial;
window.onCambioTipoMovimiento = onCambioTipoMovimiento;
window.onCambioProductoMovimiento = onCambioProductoMovimiento;
window.filtrarInventario = filtrarInventario;
window.filtrarPorEstadoStock = filtrarPorEstadoStock;

// Inicialización de eventos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const rutaActual = window.location.pathname.toLowerCase();
  
  // Condicional más permisivo para asegurar la carga en local o producción
  if (rutaActual.includes('inventario') || rutaActual.endsWith('/') || rutaActual === '') {
    renderInventario();
  }

  // Cierre delegativo del modal al cliquear el fondo difuminado (.modal-overlay)
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
});