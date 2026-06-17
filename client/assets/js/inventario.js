const API = 'http://localhost:3000/api';
let inventarioListado = [];
let productoDetalle   = null;
let filtroInvTexto    = '';
let filtroInvEstado   = '';

function _en()        { return localStorage.getItem('va_idioma') === 'en'; }
function _t(es, en)   { return _en() ? en : es; }
function _locale()    { return _en() ? 'en-US' : 'es-CO'; }

// ── DICCIONARIOS PARA DATOS DE LA BASE DE DATOS ──────────────────────────────
// Mapeamos los nombres, motivos o detalles que ingresan en español a la BD
const traduccionesNombres = {
    "Cambio de pantalla": "Screen replacement",
    "Pantalla iPhone 13": "iPhone 13 Screen",
    "Samsung Galaxy S24": "Samsung Galaxy S24",
    "iPhone 15 Pro": "iPhone 15 Pro",
    "MacBook Air M2": "MacBook Air M2"
};

const traduccionesMotivos = {
    "Ingreso inicial": "Initial inventory",
    "Ajuste manual": "Manual adjustment",
    "Venta de producto": "Product sale",
    "Garantía": "Warranty",
    "pantalla rota": "Broken screen",
    "No enciende": "Does not turn on"
};

// ── TOAST ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success:'ti-circle-check', error:'ti-circle-x', info:'ti-info-circle', warning:'ti-alert-triangle' };
    el.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}"></i> ${msg}`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

function obtenerHeaders() {
    return typeof authHeaders === 'function' ? authHeaders() : { 'Content-Type': 'application/json' };
}

// ── 1. RENDER PRINCIPAL ──────────────────────────────────────────────────────
async function renderInventario() {
    try {
        const res = await fetch(`${API}/inventario`, { headers: obtenerHeaders() });
        if (!res.ok) throw new Error(_t('No se pudo cargar el inventario','Could not load inventory'));
        inventarioListado = await res.json();
        _renderKPIs(inventarioListado);
        _renderTablaInventario(inventarioListado);
    } catch (err) {
        toast(_t('Error al cargar inventario: ','Error loading inventory: ') + err.message, 'error');
    }
}

function _renderKPIs(data) {
    const total    = data.length;
    const sinStock = data.filter(p => p.estado_stock === 'sin_stock').length;
    const bajo     = data.filter(p => p.estado_stock === 'stock_bajo').length;
    const normal   = data.filter(p => p.estado_stock === 'normal').length;
    const kpiEl    = document.getElementById('inv-kpis');
    if (!kpiEl) return;

    kpiEl.innerHTML = `
        <div class="kpi-card kpi-blue" style="cursor:default">
            <div class="kpi-label">${_t('Total Productos','Total Products')}</div>
            <div class="kpi-value">${total}</div>
            <div class="kpi-sub"><i class="ti ti-package"></i> ${_t('con seguimiento de stock','with stock tracking')}</div>
            <i class="ti ti-package kpi-icon"></i>
        </div>
        <div class="kpi-card kpi-green" style="cursor:default">
            <div class="kpi-label">${_t('Stock Normal','Normal Stock')}</div>
            <div class="kpi-value">${normal}</div>
            <div class="kpi-sub"><i class="ti ti-circle-check"></i> ${_t('por encima del mínimo','above minimum')}</div>
            <i class="ti ti-circle-check kpi-icon"></i>
        </div>
        <div class="kpi-card kpi-amber" style="cursor:default">
            <div class="kpi-label">${_t('Stock Bajo','Low Stock')}</div>
            <div class="kpi-value">${bajo}</div>
            <div class="kpi-sub"><i class="ti ti-alert-triangle"></i> ${_t('requieren reposición','need restocking')}</div>
            <i class="ti ti-alert-triangle kpi-icon"></i>
        </div>
        <div class="kpi-card kpi-red" style="cursor:default">
            <div class="kpi-label">${_t('Sin Stock','Out of Stock')}</div>
            <div class="kpi-value">${sinStock}</div>
            <div class="kpi-sub"><i class="ti ti-circle-x"></i> ${_t('agotados','depleted')}</div>
            <i class="ti ti-circle-x kpi-icon"></i>
        </div>`;
}

function _renderTablaInventario(data) {
    const tbody = document.getElementById('tb-inventario');
    if (!tbody) return;

    let filtrados = data;
    if (filtroInvTexto) {
        const q = filtroInvTexto.toLowerCase();
        filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (filtroInvEstado) {
        filtrados = filtrados.filter(p => p.estado_stock === filtroInvEstado);
    }

    const noData = _t('No se encontraron productos con los criterios de búsqueda','No products found matching the search criteria');
    if (!filtrados.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">${noData}</td></tr>`;
        return;
    }

    const badgeTexts = {
        sin_stock: _t('Sin stock','Out of stock'),
        stock_bajo: _t('Stock bajo','Low stock'),
        normal: _t('Normal','Normal')
    };

    tbody.innerHTML = filtrados.map(p => {
        const pct = p.stock_minimo > 0 ? Math.min(Math.round((p.stock / (p.stock_minimo * 3)) * 100), 100) : 100;
        const barColor = p.estado_stock === 'sin_stock' ? 'var(--red)' : p.estado_stock === 'stock_bajo' ? 'var(--amber)' : 'var(--green)';
        const badge    = p.estado_stock === 'sin_stock'
            ? `<span class="badge badge-red">${badgeTexts.sin_stock}</span>`
            : p.estado_stock === 'stock_bajo'
                ? `<span class="badge badge-amber">${badgeTexts.stock_bajo}</span>`
                : `<span class="badge badge-green">${badgeTexts.normal}</span>`;
        const ultimoMov = p.ultimo_movimiento ? _formatFecha(p.ultimo_movimiento) : '<span style="color:var(--text3)">—</span>';

        // Traducimos el nombre del producto de forma dinámica
        const nombreMostrar = _en() ? (traduccionesNombres[p.nombre] || p.nombre) : p.nombre;

        return `
            <tr>
                <td><code>${p.sku}</code></td>
                <td>${nombreMostrar}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <span style="min-width:32px;font-weight:600;${p.stock===0?'color:var(--red)':p.estado_stock==='stock_bajo'?'color:var(--amber)':''}">${p.stock}</span>
                        <div style="flex:1;background:var(--bg4);border-radius:4px;height:6px;min-width:80px">
                            <div style="width:${pct}%;background:${barColor};height:6px;border-radius:4px;transition:width .3s"></div>
                        </div>
                    </div>
                </td>
                <td style="color:var(--text2)">${p.stock_minimo}</td>
                <td>${badge}</td>
                <td style="color:var(--text2);font-size:12px">${ultimoMov}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="abrirModalMovimiento(${p.id})" title="${_t('Registrar movimiento','Register movement')}"><i class="ti ti-arrows-exchange"></i></button>
                    <button class="btn btn-secondary btn-sm" onclick="verHistorial(${p.id})" title="${_t('Ver historial','View history')}"><i class="ti ti-history"></i></button>
                </td>
            </tr>`;
    }).join('');
}

// ── 2. FILTROS ───────────────────────────────────────────────────────────────
function filtrarInventario(valor) { filtroInvTexto = valor.toLowerCase().trim(); _renderTablaInventario(inventarioListado); }
function filtrarPorEstadoStock(estado) { filtroInvEstado = estado; _renderTablaInventario(inventarioListado); }

// ── 3. MODAL MOVIMIENTO ──────────────────────────────────────────────────────
async function _cargarSelectProductos() {
    const sel = document.getElementById('mov-producto');
    if (!sel) return;
    let opciones = inventarioListado.length
        ? inventarioListado
        : await fetch(`${API}/inventario`, { headers: obtenerHeaders() }).then(r => r.json());
    const seleccionar = _t('— Seleccionar producto —','— Select product —');
    const stock_txt   = _t('Stock','Stock');
    
    sel.innerHTML = `<option value="">${seleccionar}</option>` +
        opciones.map(p => {
            const nombreM = _en() ? (traduccionesNombres[p.nombre] || p.nombre) : p.nombre;
            return `<option value="${p.id}">${p.sku} — ${nombreM} (${stock_txt}: ${p.stock})</option>`;
        }).join('');
}

function abrirModalMovimiento(productoId = null) {
    _cargarSelectProductos().then(() => {
        const sel        = document.getElementById('mov-producto');
        const cantidad   = document.getElementById('mov-cantidad');
        const motivo     = document.getElementById('mov-motivo');
        const tipo       = document.getElementById('mov-tipo');
        const labelCant  = document.getElementById('label-mov-cantidad');
        if (cantidad)  cantidad.value  = '';
        if (motivo)    motivo.value    = '';
        if (tipo)      tipo.value      = 'entrada';
        if (labelCant) labelCant.textContent = _t('Cantidad *','Quantity *');
        if (productoId && sel) { sel.value = productoId; _actualizarInfoStock(productoId); }
        else { if (sel) sel.value = ''; _limpiarInfoStock(); }
        openModal('modal-movimiento');
    }).catch(err => { console.error(err); toast(_t('No se pudo preparar el formulario','Could not prepare form'), 'error'); });
}

function onCambioTipoMovimiento() {
    const tipo     = document.getElementById('mov-tipo').value;
    const labelCant = document.getElementById('label-mov-cantidad');
    if (labelCant) labelCant.textContent = tipo === 'ajuste'
        ? _t('Nuevo stock total *','New total stock *')
        : _t('Cantidad *','Quantity *');
    const productoId = document.getElementById('mov-producto')?.value;
    if (productoId) _actualizarInfoStock(productoId);
}

function onCambioProductoMovimiento() {
    const productoId = document.getElementById('mov-producto')?.value;
    if (productoId) _actualizarInfoStock(productoId);
    else _limpiarInfoStock();
}

function _actualizarInfoStock(productoId) {
    const prod   = inventarioListado.find(p => p.id === parseInt(productoId));
    const infoEl = document.getElementById('mov-info-stock');
    if (!infoEl || !prod) return;
    const colorStock = prod.estado_stock === 'sin_stock' ? 'var(--red)' : prod.estado_stock === 'stock_bajo' ? 'var(--amber)' : 'var(--green)';
    const lblActual  = _t('Stock actual','Current stock');
    const lblMinimo  = _t('Mínimo','Minimum');
    const unidad     = _t('uds.','units');
    infoEl.innerHTML = `
        <div style="display:flex;gap:16px;font-size:12px;padding:10px 12px;background:var(--bg4);border-radius:8px;margin-top:4px">
            <span>${lblActual}: <strong style="color:${colorStock}">${prod.stock} ${unidad}</strong></span>
            <span>${lblMinimo}: <strong style="color:var(--text2)">${prod.stock_minimo} ${unidad}</strong></span>
        </div>`;
}

function _limpiarInfoStock() { const infoEl = document.getElementById('mov-info-stock'); if (infoEl) infoEl.innerHTML = ''; }

async function guardarMovimiento() {
    const productoId = document.getElementById('mov-producto')?.value;
    const tipo       = document.getElementById('mov-tipo')?.value;
    const cantidad   = document.getElementById('mov-cantidad')?.value;
    const motivo     = document.getElementById('mov-motivo')?.value.trim();
    if (!productoId || !tipo || !cantidad) {
        toast(_t('Completa los campos obligatorios: producto, tipo y cantidad','Fill in required fields: product, type and quantity'), 'error');
        return;
    }
    try {
        const res  = await fetch(`${API}/inventario/movimientos`, {
            method: 'POST', headers: obtenerHeaders(),
            body: JSON.stringify({ producto_id: parseInt(productoId), tipo, cantidad: parseInt(cantidad), motivo: motivo || null })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || _t('Error al registrar el movimiento','Error registering movement'));
        toast(data.mensaje || _t('Movimiento registrado correctamente','Movement registered successfully'), 'success');
        closeModal('modal-movimiento');
        renderInventario();
    } catch (err) { toast(err.message, 'error'); }
}

// ── EXPORTAR EXCEL ───────────────────────────────────────────────────────────
async function exportarExcel() {
    if (typeof XLSX === 'undefined') { toast(_t('La librería de Excel aún se está cargando','Excel library is still loading'), 'warning'); return; }
    if (!inventarioListado || inventarioListado.length === 0) { toast(_t('No hay datos para exportar','No data to export'), 'warning'); return; }
    try {
        toast(_t('Generando archivo Excel...','Generating Excel file...'), 'info');
        const headers = {
            sku:     'SKU',
            nombre:  _t('Producto','Product'),
            stock:   _t('Stock Actual','Current Stock'),
            minimo:  _t('Stock Mínimo','Minimum Stock'),
            estado:  _t('Estado','Status'),
            ultimo:  _t('Último Movimiento','Last Movement')
        };
        const estadoTextos = {
            sin_stock: _t('Sin Stock','Out of Stock'),
            stock_bajo: _t('Stock Bajo','Low Stock'),
            normal: _t('Normal','Normal')
        };
        const datosExportar = inventarioListado.map(p => {
            const nombreM = _en() ? (traduccionesNombres[p.nombre] || p.nombre) : p.nombre;
            return {
                [headers.sku]:    p.sku,
                [headers.nombre]: nombreM,
                [headers.stock]:   p.stock,
                [headers.minimo]: p.stock_minimo,
                [headers.estado]: estadoTextos[p.estado_stock] || p.estado_stock,
                [headers.ultimo]: p.ultimo_movimiento ? _formatFecha(p.ultimo_movimiento) : '—'
            };
        });
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosExportar);
        const maxAncho = datosExportar.reduce((acc, row) => {
            Object.keys(row).forEach((key, i) => {
                const valStr = row[key] ? row[key].toString() : '';
                acc[i] = Math.max(acc[i] || 10, valStr.length, key.length);
            });
            return acc;
        }, []);
        ws['!cols'] = maxAncho.map(w => ({ wch: w + 4 }));
        XLSX.utils.book_append_sheet(wb, ws, _t('Inventario Completo','Full Inventory'));
        const fechaHoy = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `Inventario_VA_Control_${fechaHoy}.xlsx`);
        toast(_t('Excel descargado correctamente','Excel downloaded successfully'), 'success');
    } catch (err) {
        toast(_t('Error al exportar Excel: ','Error exporting Excel: ') + err.message, 'error');
    }
}

// ── 4. HISTORIAL ─────────────────────────────────────────────────────────────
async function verHistorial(productoId) {
    try {
        const res  = await fetch(`${API}/inventario/movimientos/${productoId}`, { headers: obtenerHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || _t('Error al cargar historial','Error loading history'));
        productoDetalle = data.producto;
        _renderPanelHistorial(data.producto, data.movimientos);
        openModal('modal-historial');
    } catch (err) {
        toast(_t('Error al cargar el historial: ','Error loading history: ') + err.message, 'error');
    }
}

function _renderPanelHistorial(producto, movimientos) {
    const tituloEl = document.getElementById('historial-titulo');
    const lblHist  = _t('Historial','History');
    
    // Traducimos el nombre del producto en la cabecera del historial
    const nombreProdM = _en() ? (traduccionesNombres[producto.nombre] || producto.nombre) : producto.nombre;
    if (tituloEl) tituloEl.textContent = `${lblHist} — ${producto.sku} · ${nombreProdM}`;

    const tbody = document.getElementById('tb-historial');
    if (!tbody) return;

    const noMov = _t('Este producto aún no tiene movimientos registrados','This product has no registered movements yet');
    if (!movimientos || !movimientos.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:20px">${noMov}</td></tr>`;
        return;
    }

    const lblEntrada = _t('Entrada','Entry');
    const lblSalida  = _t('Salida','Exit');
    const lblAjuste  = _t('Ajuste','Adjustment');

    tbody.innerHTML = movimientos.map(m => {
        const iconTipo = m.tipo === 'entrada'
            ? `<span style="color:var(--green)"><i class="ti ti-arrow-up-right"></i> ${lblEntrada}</span>`
            : m.tipo === 'salida'
                ? `<span style="color:var(--red)"><i class="ti ti-arrow-down-left"></i> ${lblSalida}</span>`
                : `<span style="color:var(--blue)"><i class="ti ti-adjustments"></i> ${lblAjuste}</span>`;
        const delta      = m.stock_despues - m.stock_antes;
        const signo      = delta >= 0 ? '+' : '';
        const colorDelta = delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--text2)';
        const unidad     = _t('uds.','units');
        
        // Traducimos dinámicamente los motivos de la base de datos
        const motivoMostrar = _en() ? (traduccionesMotivos[m.motivo] || m.motivo) : m.motivo;

        return `
            <tr>
                <td style="font-size:12px;color:var(--text2)">${_formatFecha(m.creado_en)}</td>
                <td>${iconTipo}</td>
                <td style="font-weight:600;color:${colorDelta}">${signo}${delta} ${unidad}</td>
                <td>${m.stock_antes} → ${m.stock_despues}</td>
                <td style="color:var(--text2);font-size:12px">${motivoMostrar || '—'}</td>
            </tr>`;
    }).join('');
}

// ── UTILS ────────────────────────────────────────────────────────────────────
function openModal(id)  { const el = document.getElementById(id); if (el) el.classList.add('active'); }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('active'); }

function _formatFecha(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString(_locale(), { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

window.openModal              = openModal;
window.closeModal             = closeModal;
window.abrirModalMovimiento   = abrirModalMovimiento;
window.guardarMovimiento      = guardarMovimiento;
window.verHistorial           = verHistorial;
window.onCambioTipoMovimiento = onCambioTipoMovimiento;
window.onCambioProductoMovimiento = onCambioProductoMovimiento;
window.filtrarInventario      = filtrarInventario;
window.filtrarPorEstadoStock  = filtrarPorEstadoStock;
window.exportarExcel          = exportarExcel;

document.addEventListener('DOMContentLoaded', () => {
    const ruta = window.location.pathname.toLowerCase();
    if (ruta.includes('inventario') || ruta.endsWith('/') || ruta === '') renderInventario();
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
    });
});