const API = 'http://localhost:3000/api';

async function cargarDashboard() {
    try {
        
        const hora = new Date().getHours();
        const fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('dash-fecha').innerText = fecha.charAt(0).toUpperCase() + fecha.slice(1);

        
        const [resProductos, resOrdenes] = await Promise.all([
            fetch(`${API}/productos`),
            fetch(`${API}/ordenes`)
        ]);

        const productos = await resProductos.json();
        const ordenes = await resOrdenes.json();

        // Productos activos
        const productosActivos = productos.filter(p => p.activo).length;
        document.getElementById('kpi-productos').innerText = productosActivos;

        // Stock bajo
        const stockBajo = productos.filter(p => p.activo && p.stock <= p.stock_minimo).length;
        document.getElementById('kpi-stockbajo').innerText = stockBajo;

        // Ordenes pendientes
        const ordenesPendientes = ordenes.filter(o => o.estado === 'pendiente' || o.estado === 'en_proceso').length;
        document.getElementById('kpi-ordenes').innerText = ordenesPendientes;

        // Ordenes entregadas
        const ordenesEntregadas = ordenes.filter(o => o.estado === 'entregado').length;
        document.getElementById('kpi-entregadas').innerText = ordenesEntregadas;

        
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

    const conteoPorDia = dias.map(dia => {
        return ordenes.filter(o => {
            if (!o.creado_en) return false;
            try {
                const fechaOrden = new Date(o.creado_en).toISOString().split('T')[0];
                return fechaOrden === dia;
            } catch (e) {
                return o.creado_en.includes(dia);
            }
        }).length;
    });

    const maximo = Math.max(...conteoPorDia, 1);

    const nombresDias = dias.map(d => {
        const fecha = new Date(d + 'T12:00:00');
        return fecha.toLocaleDateString('es-CO', { weekday: 'short' });
    });


    contenedor.innerHTML = `
        <div style="display:flex; align-items:flex-end; justify-content:space-between; width:100%; height:140px; padding:0 4px; box-sizing:border-box; margin-top:24px;">
            ${conteoPorDia.map((total, i) => {
                const esHoy = i === 6;
                const altura = total > 0 ? Math.max((total / maximo) * 95, 15) : 4;
                
                
                const color = total > 0 ? (esHoy ? 'var(--blue)' : 'var(--amber)') : 'var(--border)';
                
                return `
                    <div style="flex:1; max-width:52px; display:flex; flex-direction:column; align-items:center; gap:6px;">
                        
                        <span style="font-size:11px; font-weight:600; color:${total > 0 ? 'var(--text1)' : 'transparent'}; height:14px;">
                            ${total}
                        </span>
                        
                        <div style="width:100%; height:${altura}px; background:${color}; border-radius:4px; transition: all 0.3s ease;"></div>
                        
                        <span style="font-size:11px; color:${esHoy ? 'var(--blue)' : 'var(--text3)'}; font-weight:${esHoy ? '600' : '400'}; text-transform:capitalize;">
                            ${nombresDias[i].replace('.', '')}
                        </span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderActividad(ordenes) {
    const contenedor = document.getElementById('activity-list');
    if (!contenedor) return;

    const recientes = [...ordenes]
        .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
        .slice(0, 6);

    if (recientes.length === 0) {
        contenedor.innerHTML = `<p style="color:var(--text3); font-size:13px; padding:16px 0">No hay actividad reciente</p>`;
        return;
    }

    const colores = {
        pendiente: 'var(--amber)',
        en_proceso: 'var(--blue)',
        completado: 'var(--green)',
        entregado: 'var(--green)',
        cancelado: 'var(--red)'
    };

    const etiquetas = {
        pendiente: 'Pendiente',
        en_proceso: 'En Proceso',
        completado: 'Completado',
        entregado: 'Entregado',
        cancelado: 'Cancelado'
    };

    contenedor.innerHTML = recientes.map(o => `
        <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border)">
            <div style="width:34px; height:34px; border-radius:50%; background:${colores[o.estado]}22; color:${colores[o.estado]}; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0;">
                <i class="ti ti-tool"></i>
            </div>
            <div style="flex:1; min-width:0">
                <div style="font-size:13px; color:var(--text1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">
                    Orden #${String(o.id).padStart(4, '0')} — ${o.equipo}
                </div>
                <div style="font-size:11px; color:${colores[o.estado]}; margin-top:2px">${etiquetas[o.estado]}</div>
            </div>
            <div style="font-size:11px; color:var(--text3); flex-shrink:0">
                ${o.creado_en ? new Date(o.creado_en).toLocaleDateString('es-CO', {day:'2-digit', month:'short'}) : ''}
            </div>
        </div>
    `).join('');
}

function renderAlertasStock(productos) {
    const seccion = document.getElementById('alertas-stock-section');
    if (!seccion) return;

    const criticos = productos.filter(p => p.activo && p.stock <= p.stock_minimo);

    if (criticos.length === 0) {
        seccion.innerHTML = '';
        return;
    }

    seccion.innerHTML = `
        <div class="panel" style="margin-top:0">
            <div class="panel-title" style="color:var(--amber)">
                <i class="ti ti-alert-triangle"></i> Productos con stock bajo (${criticos.length})
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <thead>
                    <tr style="color:var(--text3); text-align:left">
                        <th style="padding:8px 0; font-weight:500">Producto</th>
                        <th style="padding:8px 0; font-weight:500">SKU</th>
                        <th style="padding:8px 0; font-weight:500">Stock actual</th>
                        <th style="padding:8px 0; font-weight:500">Mínimo</th>
                    </tr>
                </thead>
                <tbody>
                    ${criticos.map(p => `
                        <tr style="border-top:1px solid var(--border)">
                            <td style="padding:10px 0; color:var(--text1)">${p.nombre}</td>
                            <td style="padding:10px 0; color:var(--text3)"><code>${p.sku}</code></td>
                            <td style="padding:10px 0; color:${p.stock === 0 ? 'var(--red)' : 'var(--amber)'}; font-weight:600">${p.stock} uds.</td>
                            <td style="padding:10px 0; color:var(--text3)">${p.stock_minimo} uds.</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

cargarDashboard();