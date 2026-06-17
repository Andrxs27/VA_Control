const API = 'http://localhost:3000/api';

// ── Helper de traducción (usa config.js si está disponible) ──────────────────
function _t(clave) {
    if (typeof t === 'function') return t(clave);
    return clave;
}

function _idioma() {
    return localStorage.getItem('va_idioma') || 'es';
}

function _en() {
    return _idioma() === 'en';
}

// Locale para fechas según idioma
function _locale() {
    return _en() ? 'en-US' : 'es-CO';
}

// ── DICCIONARIOS EN MINÚSCULAS PARA EVITAR FALLAS DE COINCIDENCIA ────────────
const traduccionesDB = {
    // Equipos / Fallas
    "celular": "Cell phone",
    "computador": "Computer",
    "portátil": "Laptop",
    "televisor": "Television",
    "consola": "Console",
    "pantalla rota": "Broken screen",
    "no enciende": "Does not turn on",
    "cambio de batería": "Battery replacement",
    "limpieza mantenimiento": "Cleaning & maintenance",
    "error de software": "Software error",
    
    // Variantes de productos / descripciones específicas
    "pantalla iphone negra": "Black iPhone Screen",
    "pantalla iphone blanca": "White iPhone Screen",
    "batería genérica": "Generic Battery",
    "iphone negro": "Black iPhone",
    "iphone \"negro\"": "Black iPhone", // Por si trae comillas desde la BD
    "iphone": "iPhone"
};

// Función auxiliar para buscar traducciones de forma segura
function traducirDatoBD(cadena) {
    if (!cadena) return '';
    if (!_en()) return cadena; // Si está en español, se devuelve tal cual

    // Limpiamos la cadena de comillas extras y espacios para buscar el match
    const limpia = cadena.toLowerCase().trim().replace(/["']/g, '');
    
    // 1. Buscamos coincidencia exacta en el diccionario limpio
    if (traduccionesDB[limpia]) return traduccionesDB[limpia];

    // 2. Si no es exacta, buscamos si alguna de nuestras palabras clave está contenida
    for (const [espanol, ingles] of Object.entries(traduccionesDB)) {
        if (limpia.includes(espanol)) {
            return ingles;
        }
    }

    return cadena; // Retorno por defecto si no se encuentra
}

// ── DATOS INICIALES ──────────────────────────────────────────────────────────
async function cargarDashboard() {
    try {
        const fecha = new Date().toLocaleDateString(_locale(), {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('dash-fecha').innerText =
            fecha.charAt(0).toUpperCase() + fecha.slice(1);

        const [resProductos, resOrdenes] = await Promise.all([
            fetch(`${API}/productos`),
            fetch(`${API}/ordenes`)
        ]);

        const productos = await resProductos.json();
        const ordenes   = await resOrdenes.json();

        document.getElementById('kpi-productos').innerText =
            productos.filter(p => p.activo).length;
        document.getElementById('kpi-stockbajo').innerText =
            productos.filter(p => p.activo && p.stock <= p.stock_minimo).length;

        const ordenesPendientes = ordenes.filter(
            o => o.estado === 'pendiente' || o.estado === 'en_proceso'
        ).length;
        document.getElementById('kpi-ordenes').innerText   = ordenesPendientes;
        document.getElementById('kpi-entregadas').innerText =
            ordenes.filter(o => o.estado === 'entregado').length;

        renderGrafica(ordenes);
        renderActividad(ordenes);
        renderAlertasStock(productos);

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

function renderGrafica(ordenes) {
    const contenedor = document.getElementById('chart-ventas');
    if (!contenedor) return;

    const dias = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dias.push(d.toISOString().split('T')[0]);
    }

    const conteoPorDia = dias.map(dia =>
        ordenes.filter(o => {
            if (!o.creado_en) return false;
            try {
                return new Date(o.creado_en).toISOString().split('T')[0] === dia;
            } catch (e) {
                return o.creado_en.includes(dia);
            }
        }).length
    );

    const maximo = Math.max(...conteoPorDia, 1);

    const nombresDias = dias.map(d => {
        const fecha = new Date(d + 'T12:00:00');
        return fecha.toLocaleDateString(_locale(), { weekday: 'short' });
    });

    contenedor.innerHTML = `
        <div style="display:flex;align-items:flex-end;justify-content:space-between;width:100%;height:140px;padding:0 4px;box-sizing:border-box;margin-top:24px;">
            ${conteoPorDia.map((total, i) => {
                const esHoy  = i === 6;
                const altura = total > 0 ? Math.max((total / maximo) * 95, 15) : 4;
                const color  = total > 0 ? (esHoy ? 'var(--blue)' : 'var(--amber)') : 'var(--border)';
                return `
                    <div style="flex:1;max-width:52px;display:flex;flex-direction:column;align-items:center;gap:6px;">
                        <span style="font-size:11px;font-weight:600;color:${total > 0 ? 'var(--text1)' : 'transparent'};height:14px;">
                            ${total}
                        </span>
                        <div style="width:100%;height:${altura}px;background:${color};border-radius:4px;transition:all 0.3s ease;"></div>
                        <span style="font-size:11px;color:${esHoy ? 'var(--blue)' : 'var(--text3)'};font-weight:${esHoy ? '600' : '400'};text-transform:capitalize;">
                            ${nombresDias[i].replace('.', '')}
                        </span>
                    </div>`;
            }).join('')}
        </div>`;
}

function renderActividad(ordenes) {
    const contenedor = document.getElementById('activity-list');
    if (!contenedor) return;

    const recientes = [...ordenes]
        .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
        .slice(0, 6);

    if (recientes.length === 0) {
        const msg = _en() ? 'No recent activity' : 'No hay actividad reciente';
        contenedor.innerHTML = `<p style="color:var(--text3);font-size:13px;padding:16px 0">${msg}</p>`;
        return;
    }

    const colores = {
        pendiente:  'var(--amber)',
        en_proceso: 'var(--blue)',
        completado: 'var(--green)',
        entregado:  'var(--green)',
        cancelado:  'var(--red)'
    };

    const etiquetas = _en()
        ? { pendiente:'Pending', en_proceso:'In Progress', completado:'Completed', entregado:'Delivered', cancelado:'Cancelled' }
        : { pendiente:'Pendiente', en_proceso:'En Proceso', completado:'Completado', entregado:'Entregado', cancelado:'Cancelado' };

    const ordenTxt = _en() ? 'Order' : 'Orden';

    contenedor.innerHTML = recientes.map(o => {
        // Traducimos de forma segura tanto el equipo como la falla si se muestran juntos
        const equipoMostrar = traducirDatoBD(o.equipo);
        const fallaMostrar   = o.falla ? ` — ${traducirDatoBD(o.falla)}` : '';

        return `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="width:34px;height:34px;border-radius:50%;background:${colores[o.estado]}22;color:${colores[o.estado]};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">
                <i class="ti ti-tool"></i>
            </div>
            <div style="flex:1;min-width:0">
                <div style="font-size:13px;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${ordenTxt} #${String(o.id).padStart(4, '0')} — ${equipoMostrar}${fallaMostrar}
                </div>
                <div style="font-size:11px;color:${colores[o.estado]};margin-top:2px">${etiquetas[o.estado] || o.estado}</div>
            </div>
            <div style="font-size:11px;color:var(--text3);flex-shrink:0">
                ${o.creado_en ? new Date(o.creado_en).toLocaleDateString(_locale(), {day:'2-digit', month:'short'}) : ''}
            </div>
        </div>`;
    }).join('');
}

function renderAlertasStock(productos) {
    const seccion = document.getElementById('alertas-stock-section');
    if (!seccion) return;

    const criticos = productos.filter(p => p.activo && p.stock <= p.stock_minimo);

    if (criticos.length === 0) {
        seccion.innerHTML = '';
        return;
    }

    const titulo      = _en() ? `Products with low stock (${criticos.length})` : `Productos con stock bajo (${criticos.length})`;
    const thProducto  = _en() ? 'Product'       : 'Producto';
    const thSku       = 'SKU';
    const thActual    = _en() ? 'Current Stock' : 'Stock actual';
    const thMinimo    = _en() ? 'Minimum'       : 'Mínimo';
    const unidad      = _en() ? 'units'         : 'uds.';

    seccion.innerHTML = `
        <div class="panel" style="margin-top:0">
            <div class="panel-title" style="color:var(--amber)">
                <i class="ti ti-alert-triangle"></i> ${titulo}
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                    <tr style="color:var(--text3);text-align:left">
                        <th style="padding:8px 0;font-weight:500">${thProducto}</th>
                        <th style="padding:8px 0;font-weight:500">${thSku}</th>
                        <th style="padding:8px 0;font-weight:500">${thActual}</th>
                        <th style="padding:8px 0;font-weight:500">${thMinimo}</th>
                    </tr>
                </thead>
                <tbody>
                    ${criticos.map(p => {
                        // Traducimos el nombre del producto usando el helper tolerante a minúsculas/comillas
                        const nombreProductoMostrar = traducirDatoBD(p.nombre);

                        return `
                        <tr style="border-top:1px solid var(--border)">
                            <td style="padding:10px 0;color:var(--text1)">${nombreProductoMostrar}</td>
                            <td style="padding:10px 0;color:var(--text3)"><code>${p.sku}</code></td>
                            <td style="padding:10px 0;color:${p.stock === 0 ? 'var(--red)' : 'var(--amber)'};font-weight:600">${p.stock} ${unidad}</td>
                            <td style="padding:10px 0;color:var(--text3)">${p.stock_minimo} ${unidad}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;
}

cargarDashboard();