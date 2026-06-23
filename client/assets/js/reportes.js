const API = "https://vacontrol-production.up.railway.app/api";
let repFiltroDesde = '';
let repFiltroHasta = '';

function _en()      { return localStorage.getItem('va_idioma') === 'en'; }
function _t(es, en) { return _en() ? en : es; }
function _locale()  { return _en() ? 'en-US' : 'es-CO'; }

function formatCOP(val) {
    const n = parseFloat(val) || 0;
    return '$' + n.toLocaleString(_locale(), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Meses cortos según idioma
function mesCorto(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(_locale(), { month: 'short' });
}

function hoy() { return new Date().toISOString().slice(0, 7); }

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const ahora    = new Date();
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().slice(0,10);
    const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth()+1, 0).toISOString().slice(0,10);
    const elDesde  = document.getElementById('rep-desde');
    const elHasta  = document.getElementById('rep-hasta');
    if (elDesde) elDesde.value = primerDia;
    if (elHasta) elHasta.value = ultimoDia;
    repFiltroDesde = primerDia;
    repFiltroHasta = ultimoDia;
    cargarReportes();
});

// ── CARGA PRINCIPAL ───────────────────────────────────────────────────────────
// El proyecto ya no tiene módulos de Ventas ni Facturas: los reportes se calculan
// a partir de Órdenes de Servicio (que incluyen costo_servicio), Productos/Inventario,
// Usuarios (técnicos) y Clientes.
async function cargarReportes() {
    mostrarSkeletons();
    try {
        const [ordenes, productos, usuarios, clientes] = await Promise.all([
            fetch(`${API}/ordenes`).then(r => r.ok ? r.json() : []),
            fetch(`${API}/productos`).then(r => r.ok ? r.json() : []),
            fetch(`${API}/usuarios`).then(r => r.ok ? r.json() : []),
            fetch(`${API}/clientes`).then(r => r.ok ? r.json() : []),
        ]);

        const ordenesFiltradas = filtrarPorFecha(ordenes, 'creado_en');

        renderKPIs(ordenesFiltradas, productos);
        renderGraficaIngresosMes(ordenes);
        renderOrdenesPorEntrega(ordenesFiltradas);
        renderCategorias(productos);
        renderTopTecnicos(ordenesFiltradas, usuarios);
        renderTopClientes(ordenesFiltradas, clientes);
        renderStockCritico(productos);
        renderTablaOrdenes(ordenesFiltradas, usuarios, clientes);
        renderOrdenesResumen(ordenesFiltradas);
    } catch (err) {
        console.error('Error cargando reportes:', err);
        mostrarError(_t(
            'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en puerto 3000.',
            'Could not connect to server. Make sure the backend is running on port 3000.'
        ));
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

// Ingreso de una orden: se cuenta el costo del servicio salvo que esté cancelada.
function ingresoOrden(o) {
    return o.estado === 'cancelado' ? 0 : parseFloat(o.costo_servicio || 0);
}

// ── KPIs ──────────────────────────────────────────────────────────────────────
function renderKPIs(ordenes, productos) {
    const ingresos   = ordenes.reduce((s, o) => s + ingresoOrden(o), 0);
    const ordenesComp = ordenes.filter(o => o.estado === 'completado' || o.estado === 'entregado').length;
    const sinStock   = productos.filter(p => p.activo && p.stock === 0 && p.categoria !== 'servicios').length;
    const clientesAtendidos = new Set(ordenes.map(o => o.cliente_id).filter(Boolean)).size;
    set('rep-ingresos',           formatCOP(ingresos));
    set('rep-ordenes-comp',       ordenesComp);
    set('rep-sin-stock',          sinStock);
    set('rep-clientes-atendidos', clientesAtendidos);
}

// ── GRÁFICA 6 MESES (ingresos por órdenes) ────────────────────────────────────
function renderGraficaIngresosMes(todasOrdenes) {
    const meses = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        meses.push({ key: d.toISOString().slice(0,7), label: mesCorto(d.toISOString()), total: 0 });
    }
    todasOrdenes.forEach(o => {
        const m      = o.creado_en ? o.creado_en.slice(0,7) : '';
        const bucket = meses.find(x => x.key === m);
        if (bucket) bucket.total += ingresoOrden(o);
    });

    const maxV = Math.max(...meses.map(m => m.total), 1);
    const el   = document.getElementById('rep-grafica-meses');
    if (!el) return;

    el.innerHTML = `
        <div style="display:flex;align-items:flex-end;justify-content:space-between;width:100%;height:140px;padding:0 4px;box-sizing:border-box;margin-top:24px;">
            ${meses.map(m => {
                const esActual = m.key === hoy();
                const altura   = m.total > 0 ? Math.max((m.total / maxV) * 95, 15) : 4;
                const color    = m.total > 0 ? (esActual ? 'var(--blue)' : 'var(--amber)') : 'var(--border)';
                return `
                    <div style="flex:1;max-width:52px;display:flex;flex-direction:column;align-items:center;gap:6px;" title="${m.label}: ${formatCOP(m.total)}">
                        <span style="font-size:10px;font-weight:600;color:${m.total>0?'var(--text1)':'transparent'};height:14px;white-space:nowrap;">
                            ${m.total > 0 ? formatCOP(m.total) : ''}
                        </span>
                        <div style="width:100%;height:${altura}px;background:${color};border-radius:4px;transition:all 0.3s ease;"></div>
                        <span style="font-size:11px;color:${esActual?'var(--blue)':'var(--text3)'};font-weight:${esActual?'600':'200'};text-transform:capitalize;">
                            ${m.label.replace('.', '')}
                        </span>
                    </div>`;
            }).join('')}
        </div>`;
}

// ── ÓRDENES POR TIPO DE ENTREGA ───────────────────────────────────────────────
function renderOrdenesPorEntrega(ordenes) {
    const conteo = {};
    ordenes.forEach(o => {
        const tipo = o.tipo_entrega || 'otro';
        conteo[tipo] = (conteo[tipo] || 0) + 1;
    });
    const total = ordenes.length || 1;

    const colores   = { tienda:'var(--blue)', domicilio:'var(--accent)', otro:'var(--text3)' };
    const etiquetas = {
        tienda:    _t('Retiro en tienda','Store pickup'),
        domicilio: _t('Entrega a domicilio','Home delivery'),
        otro:      _t('Sin especificar','Unspecified')
    };

    const el = document.getElementById('rep-entrega');
    if (!el) return;
    if (Object.keys(conteo).length === 0) {
        el.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:8px 0">${_t('Sin datos en el período','No data for this period')}</div>`;
        return;
    }
    el.innerHTML = Object.entries(conteo).sort((a,b) => b[1]-a[1]).map(([tipo, cnt]) => {
        const pct   = Math.round((cnt / total) * 100);
        const color = colores[tipo] || 'var(--accent)';
        return `
            <div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                    <span style="color:var(--text)">${etiquetas[tipo] || tipo}</span>
                    <span style="color:var(--text2)">${cnt} (${pct}%)</span>
                </div>
                <div style="background:var(--bg3);border-radius:4px;height:8px">
                    <div style="height:100%;border-radius:4px;background:${color};width:${pct}%;transition:width .6s"></div>
                </div>
            </div>`;
    }).join('');
}

// ── CATEGORÍAS (valor de inventario) ──────────────────────────────────────────
function renderCategorias(productos) {
    const stockCat = {};
    productos.filter(p => p.activo).forEach(p => {
        const c = p.categoria || 'otros';
        stockCat[c] = (stockCat[c] || 0) + (p.stock * parseFloat(p.precio_venta || 0));
    });
    const totalStock = Object.values(stockCat).reduce((s,v) => s+v, 1);
    const colores    = { electronicos:'var(--blue)', repuestos:'var(--amber)', servicios:'var(--green)', otros:'var(--text3)' };
    const etiquetas  = {
        electronicos: _t('Electrónicos','Electronics'),
        repuestos:    _t('Repuestos','Spare Parts'),
        servicios:    _t('Servicios','Services'),
        otros:        _t('Otros','Others')
    };
    const el = document.getElementById('rep-categorias');
    if (!el) return;
    if (Object.keys(stockCat).length === 0) {
        el.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:8px 0">${_t('Sin productos registrados','No products registered')}</div>`;
        return;
    }
    el.innerHTML = Object.entries(stockCat).sort((a,b) => b[1]-a[1]).map(([cat, val]) => {
        const pct   = Math.round((val / totalStock) * 100);
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

// ── TOP TÉCNICOS ──────────────────────────────────────────────────────────────
function renderTopTecnicos(ordenes, usuarios) {
    const mapa = {};
    ordenes.forEach(o => {
        if (!o.tecnico_id || o.estado === 'cancelado') return;
        if (!mapa[o.tecnico_id]) mapa[o.tecnico_id] = { total:0, cantidad:0 };
        mapa[o.tecnico_id].total    += parseFloat(o.costo_servicio || 0);
        mapa[o.tecnico_id].cantidad++;
    });
    const ranking = Object.entries(mapa).map(([id, data]) => {
        const u = usuarios.find(u => u.id == id);
        return { nombre: u ? u.nombre : `${_t('Técnico','Technician')} #${id}`, ...data };
    }).sort((a,b) => b.total - a.total).slice(0,5);

    const el = document.getElementById('rep-tecnicos');
    if (!el) return;
    if (ranking.length === 0) {
        el.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:8px 0">${_t('Sin órdenes asignadas en el período','No assigned orders in this period')}</div>`;
        return;
    }
    const lblOrden  = _t('orden','order');
    const lblOrdenes = _t('órdenes','orders');
    el.innerHTML = ranking.map((v,i) => `
        <div class="activity-item" style="align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
            <div style="font-size:11px;font-weight:700;color:var(--text3);min-width:22px">#${i+1}</div>
            <div style="flex:1">
                <div style="font-size:13px;font-weight:500;color:var(--text)">${v.nombre}</div>
                <div style="font-size:11px;color:var(--text3)">${v.cantidad} ${v.cantidad !== 1 ? lblOrdenes : lblOrden}</div>
            </div>
            <div style="font-size:13px;font-weight:600;color:var(--green)">${formatCOP(v.total)}</div>
        </div>`).join('');
}

// ── TOP CLIENTES ──────────────────────────────────────────────────────────────
function renderTopClientes(ordenes, clientes) {
    const mapa = {};
    ordenes.forEach(o => {
        if (!o.cliente_id || o.estado === 'cancelado') return;
        if (!mapa[o.cliente_id]) mapa[o.cliente_id] = { total:0, cantidad:0 };
        mapa[o.cliente_id].total    += parseFloat(o.costo_servicio || 0);
        mapa[o.cliente_id].cantidad++;
    });
    const ranking = Object.entries(mapa).map(([id, data]) => {
        const c = clientes.find(c => c.id == id);
        return { nombre: c ? c.nombre : `${_t('Cliente','Client')} #${id}`, ...data };
    }).sort((a,b) => b.total - a.total).slice(0,5);

    const el = document.getElementById('rep-top-clientes');
    if (!el) return;
    if (ranking.length === 0) {
        el.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:8px 0">${_t('Sin datos en el período','No data for this period')}</div>`;
        return;
    }
    const lblOrden  = _t('orden','order');
    const lblOrdenes = _t('órdenes','orders');
    el.innerHTML = ranking.map((c,i) => `
        <div class="activity-item" style="align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
            <div style="font-size:11px;font-weight:700;color:var(--text3);min-width:22px">#${i+1}</div>
            <div style="flex:1">
                <div style="font-size:13px;font-weight:500;color:var(--text)">${c.nombre}</div>
                <div style="font-size:11px;color:var(--text3)">${c.cantidad} ${c.cantidad !== 1 ? lblOrdenes : lblOrden}</div>
            </div>
            <div style="font-size:13px;font-weight:600;color:var(--blue)">${formatCOP(c.total)}</div>
        </div>`).join('');
}

// ── STOCK CRÍTICO ─────────────────────────────────────────────────────────────
function renderStockCritico(productos) {
    const criticos = productos.filter(p => p.activo && p.categoria !== 'servicios' && p.stock <= p.stock_minimo)
        .sort((a,b) => a.stock - b.stock).slice(0,10);
    const el = document.getElementById('rep-stock-critico');
    if (!el) return;
    if (criticos.length === 0) {
        const msg = _t('Todo el stock está en niveles normales','All stock is at normal levels');
        el.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--green);padding:20px"><i class="ti ti-circle-check"></i> ${msg}</td></tr>`;
        return;
    }
    const lblSinStock  = _t('Sin stock','Out of stock');
    const lblStockBajo = _t('Stock bajo','Low stock');
    el.innerHTML = criticos.map(p => {
        const badge    = p.stock === 0
            ? `<span class="badge badge-red">${lblSinStock}</span>`
            : `<span class="badge badge-amber">${lblStockBajo}</span>`;
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

// ── TABLA ÓRDENES DEL PERÍODO ─────────────────────────────────────────────────
function renderTablaOrdenes(ordenes, usuarios, clientes) {
    const el = document.getElementById('rep-tabla-ordenes');
    if (!el) return;
    const recientes = [...ordenes].sort((a,b) => new Date(b.creado_en) - new Date(a.creado_en)).slice(0,15);
    if (recientes.length === 0) {
        el.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:20px">${_t('Sin órdenes en el período seleccionado','No orders in the selected period')}</td></tr>`;
        return;
    }
    const estadoBadge = e => ({
        pendiente:  `<span class="badge badge-amber">${_t('Pendiente','Pending')}</span>`,
        en_proceso: `<span class="badge badge-blue">${_t('En Proceso','In Progress')}</span>`,
        completado: `<span class="badge badge-green">${_t('Completado','Completed')}</span>`,
        entregado:  `<span class="badge badge-green">${_t('Entregado','Delivered')}</span>`,
        cancelado:  `<span class="badge badge-red">${_t('Cancelado','Cancelled')}</span>`,
    }[e] || `<span class="badge badge-gray">${e || '—'}</span>`);

    el.innerHTML = recientes.map(o => {
        const cliente = clientes.find(c => c.id == o.cliente_id)?.nombre || '—';
        const tecnico = o.tecnico_id ? (usuarios.find(u => u.id == o.tecnico_id)?.nombre || '—') : '—';
        const equipo  = `${o.equipo||''}${o.marca?' '+o.marca:''}${o.modelo?' '+o.modelo:''}`.trim() || '—';
        const fecha   = o.creado_en ? o.creado_en.slice(0,10) : '—';
        return `
            <tr>
                <td style="font-weight:600;color:var(--accent)">#${String(o.id).padStart(4,'0')}</td>
                <td>${cliente}</td>
                <td>${equipo}</td>
                <td>${tecnico}</td>
                <td style="font-weight:600">${formatCOP(o.costo_servicio)}</td>
                <td>${estadoBadge(o.estado)}</td>
                <td class="td-muted">${fecha}</td>
            </tr>`;
    }).join('');
}

// ── RESUMEN ÓRDENES POR ESTADO ────────────────────────────────────────────────
function renderOrdenesResumen(ordenes) {
    const estados  = { pendiente:0, en_proceso:0, completado:0, entregado:0, cancelado:0 };
    ordenes.forEach(o => { if (estados[o.estado] !== undefined) estados[o.estado]++; });
    const total    = ordenes.length || 1;
    const colores  = { pendiente:'var(--amber)', en_proceso:'var(--blue)', completado:'var(--green)', entregado:'var(--accent)', cancelado:'var(--red)' };
    const etiquetas = {
        pendiente:  _t('Pendiente','Pending'),
        en_proceso: _t('En Proceso','In Progress'),
        completado: _t('Completado','Completed'),
        entregado:  _t('Entregado','Delivered'),
        cancelado:  _t('Cancelado','Cancelled')
    };
    const el = document.getElementById('rep-ordenes-estado');
    if (!el) return;
    el.innerHTML = Object.entries(estados).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]).map(([est, cnt]) => {
        const pct   = Math.round((cnt / total) * 100);
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
    }).join('') || `<div style="color:var(--text3);font-size:13px;padding:8px 0">${_t('Sin órdenes en el período','No orders in this period')}</div>`;
}

// ── FILTROS FECHA ─────────────────────────────────────────────────────────────
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

// ── EXPORTAR EXCEL ────────────────────────────────────────────────────────────
async function exportarCSV() {
    if (typeof XLSX === 'undefined') {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    try {
        const [ordenes, productos, usuarios, clientes] = await Promise.all([
            fetch(`${API}/ordenes`).then(r => r.json()),
            fetch(`${API}/productos`).then(r => r.json()),
            fetch(`${API}/usuarios`).then(r => r.json()),
            fetch(`${API}/clientes`).then(r => r.json()),
        ]);
        const ordenesFiltradas = filtrarPorFecha(ordenes, 'creado_en');

        const wb   = XLSX.utils.book_new();
        const nFmt = '#,##0.00';

        // Hoja 1 — Órdenes
        const hdrOrdenes = [
            _t('ID','ID'), _t('Fecha','Date'), _t('Cliente','Client'), _t('Técnico','Technician'),
            _t('Equipo','Device'), _t('Tipo Entrega','Delivery Type'),
            _t('Costo Servicio','Service Cost'), _t('Estado','Status')
        ];
        const filasOrdenes = ordenesFiltradas.sort((a,b) => new Date(b.creado_en)-new Date(a.creado_en)).map(o => {
            const cliente = clientes.find(c => c.id == o.cliente_id)?.nombre || '—';
            const tecnico = o.tecnico_id ? (usuarios.find(u => u.id == o.tecnico_id)?.nombre || '—') : '—';
            const equipo  = `${o.equipo||''}${o.marca?' '+o.marca:''}${o.modelo?' '+o.modelo:''}`.trim() || '—';
            return [`#${String(o.id).padStart(4,'0')}`, o.creado_en?o.creado_en.slice(0,10):'—',
                cliente, tecnico, equipo, o.tipo_entrega||'—', parseFloat(o.costo_servicio||0), o.estado||'—'];
        });
        const sumarCosto = filasOrdenes.reduce((s,r) => s+(r[6]||0), 0);
        const filaTotal  = ['','','','','', _t('TOTAL','TOTAL'), sumarCosto, ''];
        const wsOrdenes  = XLSX.utils.aoa_to_sheet([hdrOrdenes, ...filasOrdenes, filaTotal]);
        wsOrdenes['!cols'] = [{wch:8},{wch:12},{wch:22},{wch:20},{wch:22},{wch:16},{wch:14},{wch:14}];
        for (let r=1; r<=filasOrdenes.length+1; r++) {
            const addr = XLSX.utils.encode_cell({r,c:6}); if (wsOrdenes[addr]) wsOrdenes[addr].z = nFmt;
        }
        XLSX.utils.book_append_sheet(wb, wsOrdenes, _t('Órdenes','Orders'));

        // Hoja 2 — Stock crítico
        const criticos   = productos.filter(p => p.activo && p.categoria !== 'servicios' && p.stock <= p.stock_minimo).sort((a,b)=>a.stock-b.stock);
        const hdrStock   = ['SKU', _t('Nombre','Name'), _t('Categoría','Category'),
            _t('Stock Actual','Current Stock'), _t('Stock Mínimo','Min Stock'),
            _t('Faltantes','Missing'), _t('Precio Venta','Sale Price'), _t('Valor en Riesgo','At-Risk Value')];
        const filasStock = criticos.map(p => {
            const faltantes   = Math.max(0, p.stock_minimo - p.stock);
            const precioVenta = parseFloat(p.precio_venta||0);
            return [p.sku||'—', p.nombre, p.categoria, p.stock, p.stock_minimo, faltantes, precioVenta, faltantes*precioVenta];
        });
        const wsStock = XLSX.utils.aoa_to_sheet([hdrStock, ...filasStock]);
        wsStock['!cols'] = [{wch:14},{wch:28},{wch:14},{wch:14},{wch:14},{wch:12},{wch:14},{wch:16}];
        XLSX.utils.book_append_sheet(wb, wsStock, _t('Stock Crítico','Critical Stock'));

        // Hoja 3 — Resumen
        const desde        = repFiltroDesde || _t('(todo)','(all)');
        const hasta         = repFiltroHasta || _t('(todo)','(all)');
        const totalIngresos = ordenesFiltradas.reduce((s,o)=>s+ingresoOrden(o),0);
        const ordenesComp   = ordenesFiltradas.filter(o=>o.estado==='completado'||o.estado==='entregado').length;
        const sinStock2     = productos.filter(p=>p.activo&&p.stock===0&&p.categoria!=='servicios').length;
        const clientesAt    = new Set(ordenesFiltradas.map(o=>o.cliente_id).filter(Boolean)).size;
        const resumenData  = [
            [_t('Reporte Generado','Report Generated'), new Date().toLocaleString(_locale())],
            [_t('Período Desde','Period From'), desde],
            [_t('Período Hasta','Period To'), hasta],
            [],
            [_t('INDICADOR','INDICATOR'), _t('VALOR','VALUE')],
            [_t('Total Ingresos (Órdenes)','Total Revenue (Orders)'),      totalIngresos],
            [_t('Número de Órdenes','Number of Orders'),                   ordenesFiltradas.length],
            [_t('Costo Promedio por Orden','Average Cost per Order'),       ordenesFiltradas.length ? totalIngresos/ordenesFiltradas.length : 0],
            [_t('Órdenes Completadas','Completed Orders'),                 ordenesComp],
            [_t('Clientes Atendidos','Clients Served'),                    clientesAt],
            [_t('Productos Sin Stock','Out of Stock Products'),            sinStock2],
            [_t('Productos en Stock Crítico','Critical Stock Products'),   criticos.length],
        ];
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
        wsResumen['!cols'] = [{wch:30},{wch:20}];
        XLSX.utils.book_append_sheet(wb, wsResumen, _t('Resumen','Summary'));

        const fecha = new Date().toISOString().slice(0,10);
        XLSX.writeFile(wb, `VA_Control_${_t('Reporte','Report')}_${fecha}.xlsx`);
    } catch (err) {
        console.error('Error exportando Excel:', err);
        alert(_t('No se pudo generar el reporte.','Could not generate the report.'));
    }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function mostrarSkeletons() {
    ['rep-ingresos','rep-ordenes-comp','rep-sin-stock','rep-clientes-atendidos'].forEach(id => set(id,'...'));
}
function mostrarError(msg) {
    ['rep-grafica-meses','rep-entrega','rep-categorias','rep-tecnicos','rep-top-clientes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<div style="color:var(--red);font-size:12px;padding:8px 0"><i class="ti ti-alert-circle"></i> ${msg}</div>`;
    });
}
