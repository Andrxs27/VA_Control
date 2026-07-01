const API = "https://vacontrol-production.up.railway.app/api";
let usuariosDB = [];
let clientesDB = [];
let ordenEditandoId = null;
let idOrdenAccion   = null;
let tipoAccion      = '';
let ordenesListados = [];
let filtroTexto     = '';
let filtroEstado    = 'all';

function _en()     { return localStorage.getItem('va_idioma') === 'en'; }
function _locale() { return _en() ? 'en-US' : 'es-CO'; }

// ── DICCIONARIO TOLERANTE PARA DATOS DE LA BASE DE DATOS ─────────────────────
const diccionarioGlobal = {
    "celular": "Cell phone",
    "computador": "Computer",
    "portatil": "Laptop",
    "portátil": "Laptop",
    "televisor": "Television",
    "consola": "Console",
    "pantalla rota": "Broken screen",
    "no enciende": "Does not turn on",
    "cambio de bateria": "Battery replacement",
    "cambio de batería": "Battery replacement",
    "limpieza mantenimiento": "Cleaning & maintenance",
    "error de software": "Software error",
    "iphone negro": "Black iPhone",
    "pantalla iphone negra": "Black iPhone Screen"
};

// Función para limpiar comillas, tildes y mayúsculas antes de traducir
function normalizarYTraducir(cadena) {
    if (!cadena) return '';
    if (!_en()) return cadena; // Si no está en inglés, pasa el texto original

    const limpia = cadena.toLowerCase()
                         .replace(/["']/g, '') // Elimina comillas simples y dobles
                         .replace(/[áéíóú]/g, m => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u'}[m])) // Quita tildes
                        .trim();

    if (diccionarioGlobal[limpia]) return diccionarioGlobal[limpia];

    // Búsqueda por subcadena / palabra contenida por si viene combinado
    for (const [espanol, ingles] of Object.entries(diccionarioGlobal)) {
        if (limpia.includes(espanol)) return ingles;
    }
    return cadena;
}

// ── DATOS INICIALES ──────────────────────────────────────────────────────────
async function cargarDatos() {
    try {
        const resUsuarios = await fetch(`${API}/usuarios`);
        usuariosDB = await resUsuarios.json();
        const resClientes = await fetch(`${API}/clientes`);
        clientesDB = await resClientes.json();

        document.getElementById('o-cliente').innerHTML =
            `<option value="">${t('opt_seleccionar')}</option>` +
            clientesDB.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

        document.getElementById('o-tecnico').innerHTML =
            `<option value="">${t('opt_asignar_tecnico')}</option>` +
            usuariosDB.filter(u => u.rol === 'tecnico').map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
    }
}

function getNombreCliente(id) { const c = clientesDB.find(c => c.id === id); return c ? c.nombre : 'N/A'; }
function getNombreUsuario(id) { const u = usuariosDB.find(u => u.id === id); return u ? u.nombre : t('opt_asignar_tecnico'); }
function formatFecha(fecha)   { if (!fecha) return '—'; return fecha.split('T')[0]; }

function estadoBadge(e) {
    const map = {
        pendiente:  ['badge-amber',  t('estado_pendiente')],
        en_proceso: ['badge-blue',   t('estado_en_proceso')],
        completado: ['badge-green',  t('estado_completado')],
        entregado:  ['badge-gray',   t('estado_entregado')],
        cancelado:  ['badge-red',    t('estado_cancelado')]
    };
    const [cls, label] = map[e] || ['badge-gray', e];
    return `<span class="badge ${cls}">${label}</span>`;
}

// ── RENDER TABLA ─────────────────────────────────────────────────────────────
async function renderOrdenes(filtro = 'all') {
    try {
        if (filtro === 'all' || filtro === true || ordenesListados.length === 0) {
            //fetch get
            const res   = await fetch(`${API}/ordenes`);
            ordenesListados = await res.json();
        }
        if (['all','pendiente','en_proceso','completado','entregado','cancelado'].includes(filtro)) {
            filtroEstado = filtro;
        }

        const ordenesActivas = ordenesListados.filter(
            o => o.estado === 'pendiente' || o.estado === 'en_proceso' || o.estado === 'completado'
        ).length;
        const badgeOrdenes = document.getElementById('badge-ordenes');
        if (badgeOrdenes) {
            badgeOrdenes.innerText     = ordenesActivas;
            badgeOrdenes.style.display = ordenesActivas === 0 ? 'none' : 'inline-flex';
        }

        const data = ordenesListados.filter(o => {
            const coincideEstado = filtroEstado === 'all' || o.estado === filtroEstado;
            const nombreCliente  = getNombreCliente(o.cliente_id).toLowerCase();
            const nombreTecnico  = o.tecnico_id ? getNombreUsuario(o.tecnico_id).toLowerCase() : '';
            
            // Filtrado compatible con términos normalizados en inglés
            const equipoTraducido = normalizarYTraducir(o.equipo);
            const fallaTraducida  = normalizarYTraducir(o.falla);

            const idStr          = String(o.id);
            const coincideTexto  = nombreCliente.includes(filtroTexto) ||
                                nombreTecnico.includes(filtroTexto) ||
                                equipoTraducido.toLowerCase().includes(filtroTexto) ||
                                fallaTraducida.toLowerCase().includes(filtroTexto)  ||
                                idStr.includes(filtroTexto);
            return coincideEstado && coincideTexto;
        });

        let html = '';
        for (const o of data) {
            // Aplicamos la traducción para las celdas
            const equipoMostrar = normalizarYTraducir(o.equipo);
            const fallaMostrar  = normalizarYTraducir(o.falla);

            html += `<tr>
                <td style="font-weight:600">#${String(o.id).padStart(4,'0')}</td>
                <td>${getNombreCliente(o.cliente_id)}</td>
                <td>${o.tecnico_id ? getNombreUsuario(o.tecnico_id) : `<span style="color:var(--text3)">${t('opt_asignar_tecnico')}</span>`}</td>
                <td>${equipoMostrar} — ${fallaMostrar}</td>
                <td>${estadoBadge(o.estado)}</td>
                <td>${o.tipo_entrega === 'domicilio'
                    ? `<span class="badge badge-blue">${t('opt_domicilio')}</span>`
                    : `<span class="badge badge-gray">${t('opt_tienda')}</span>`}</td>
                <td>${formatFecha(o.fecha_promesa)}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${o.id})" title="${t('accion_editar')}"><i class="ti ti-edit"></i></button>
                    ${o.estado === 'cancelado'
                        ? `<button class="btn btn-sm" style="background:#10b981;color:white" onclick="solicitarCambioEstado(${o.id},'pendiente')" title="${t('accion_activar')}"><i class="ti ti-refresh"></i></button>`
                        : `<button class="btn btn-sm" style="background:#6b7280;color:white" onclick="solicitarCambioEstado(${o.id},'cancelado')" title="${t('accion_desactivar')}"><i class="ti ti-ban"></i></button>`
                    }
                    <button class="btn btn-danger btn-sm" onclick="solicitarEliminacion(${o.id})" title="${t('accion_eliminar')}"><i class="ti ti-trash"></i></button>
                </td>
            </tr>`;
        }

        document.getElementById('tb-ordenes').innerHTML =
            html || `<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">${t('toast_error_operacion')}</td></tr>`;

    } catch (error) {
        console.error('Error al renderizar órdenes:', error);
    }
}

// ── CONFIRMACIONES ───────────────────────────────────────────────────────────
function solicitarCambioEstado(id, nuevoEstado) {
    idOrdenAccion = id;
    tipoAccion    = nuevoEstado;
    const esDesactivar = nuevoEstado === 'cancelado';
    const btnProceder  = document.getElementById('confirm-btn-proceder');

    document.getElementById('confirm-titulo').innerText  = esDesactivar
        ? t('confirm_desactivar_orden') : t('confirm_reactivar_orden');
    document.getElementById('confirm-mensaje').innerText = esDesactivar
        ? t('confirm_msg_desactivar_orden') : t('confirm_msg_reactivar_orden');

    document.getElementById('confirm-icon').className = esDesactivar ? 'ti ti-ban' : 'ti ti-refresh';
    const iconWrapper = document.getElementById('confirm-icon-wrapper');
    iconWrapper.style.backgroundColor = esDesactivar ? 'rgba(239,68,68,0.1)'  : 'rgba(16,185,129,0.1)';
    iconWrapper.style.color           = esDesactivar ? '#ef4444'               : '#10b981';
    btnProceder.className             = esDesactivar ? 'btn btn-secondary'     : 'btn btn-success';
    btnProceder.onclick               = ejecutarAccionConfirmada;
    openModal('modal-confirmacion');
}

function solicitarEliminacion(id) {
    idOrdenAccion = id;
    tipoAccion    = 'eliminar';
    document.getElementById('confirm-titulo').innerText  = t('confirm_eliminar_orden');
    document.getElementById('confirm-mensaje').innerText = t('confirm_msg_eliminar_orden');
    document.getElementById('confirm-icon').className    = 'ti ti-alert-triangle';
    const iconWrapper = document.getElementById('confirm-icon-wrapper');
    iconWrapper.style.backgroundColor = 'rgba(220,38,38,0.15)';
    iconWrapper.style.color           = 'var(--red)';
    document.getElementById('confirm-btn-proceder').className = 'btn btn-danger';
    document.getElementById('confirm-btn-proceder').onclick   = ejecutarAccionConfirmada;
    openModal('modal-confirmacion');
}

async function ejecutarAccionConfirmada() {
    //fetch delete 
    try {
        if (tipoAccion === 'eliminar') {
            await fetch(`${API}/ordenes/${idOrdenAccion}`, { method: 'DELETE' });
            toast(t('toast_orden_eliminada'), 'success');
        } else {
            const res   = await fetch(`${API}/ordenes/${idOrdenAccion}`);
            const orden = await res.json();
            orden.estado = tipoAccion;
            await fetch(`${API}/ordenes/${idOrdenAccion}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orden)
            });
            toast(tipoAccion === 'cancelado'
                ? t('toast_orden_desactivada')
                : t('toast_orden_activada'), 'success');
        }
    } catch (error) {
        console.error('Error al ejecutar acción confirmada:', error);
        toast(t('toast_error_operacion'), 'error');
    } finally {
        closeModal('modal-confirmacion');
        renderOrdenes('all');
    }
}

// ── MODAL NUEVA / EDITAR ORDEN ───────────────────────────────────────────────
function desbloquearTodosCampos() {
    ['o-cliente','o-serial','o-marca','o-modelo','o-tecnico','o-equipo',
    'o-fecha','o-costo','o-falla','o-diagnostico','o-notas','o-entrega','o-estado'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.disabled = false;
        el.style.background = el.style.color = el.style.cursor = el.style.opacity = '';
    });
}

function nuevaOrden() {
    ordenEditandoId = null;
    ['o-cliente','o-tecnico','o-equipo','o-fecha','o-marca','o-modelo',
    'o-serial','o-costo','o-falla','o-diagnostico','o-notas'
    ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('o-entrega').value = 'tienda';
    document.getElementById('o-estado').value  = 'pendiente';

    const modalTitle = document.querySelector('#modal-orden .modal-head h2');
    if (modalTitle) modalTitle.innerText = t('modal_nueva_orden');
    desbloquearTodosCampos();
    openModal('modal-orden');
}

async function guardarOrden() {
    try {
        const cliente_id     = document.getElementById('o-cliente').value;
        const tecnico_id     = document.getElementById('o-tecnico').value || null;
        const equipo         = document.getElementById('o-equipo').value;
        const falla          = document.getElementById('o-falla').value;
        const estado         = document.getElementById('o-estado').value;
        const tipo_entrega   = document.getElementById('o-entrega').value;
        const fecha_promesa  = document.getElementById('o-fecha').value || null;
        const marca          = document.getElementById('o-marca').value;
        const modelo         = document.getElementById('o-modelo').value;
        const notas          = document.getElementById('o-notas').value;
        const diagnostico    = document.getElementById('o-diagnostico').value;
        const serial_equipo  = document.getElementById('o-serial').value;
        const costo_servicio = parseFloat(document.getElementById('o-costo').value) || 0;

        if (!cliente_id || !equipo || !falla) {
            toast(t('toast_error_campos_obligatorios'), 'warning');
            return;
        }

        const datosOrden = { cliente_id, tecnico_id, equipo, falla, estado, tipo_entrega, fecha_promesa, marca, modelo, serial_equipo, costo_servicio, notas, diagnostico };
        
        //fetch post/put
        if (ordenEditandoId) {
            await fetch(`${API}/ordenes/${ordenEditandoId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosOrden)
            });
            toast(t('toast_orden_actualizada'), 'success');
        } else {
            await fetch(`${API}/ordenes`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosOrden)
            });
            toast(t('toast_orden_creada'), 'success');
        }
        closeModal('modal-orden');
    } catch (error) {
        console.error('Error al guardar la orden:', error);
        toast(t('toast_error_orden_guardar'), 'error');
    } finally {
        ordenEditandoId = null;
        renderOrdenes('all');
    }
}

async function prepararEdicion(id) {
    try {
        ordenEditandoId = id;
        const res   = await fetch(`${API}/ordenes/${id}`);
        const orden = await res.json();

        const modalTitle = document.querySelector('#modal-orden .modal-head h2');
        if (modalTitle) modalTitle.innerText = `${t('modal_editar_orden')} #${String(id).padStart(4,'0')}`;

        document.getElementById('o-cliente').value     = orden.cliente_id;
        document.getElementById('o-tecnico').value     = orden.tecnico_id || '';
        document.getElementById('o-equipo').value      = orden.equipo;
        document.getElementById('o-falla').value       = orden.falla;
        document.getElementById('o-estado').value      = orden.estado;
        document.getElementById('o-entrega').value     = orden.tipo_entrega;
        document.getElementById('o-fecha').value       = orden.fecha_promesa ? orden.fecha_promesa.split('T')[0] : '';
        document.getElementById('o-marca').value       = orden.marca          || '';
        document.getElementById('o-modelo').value      = orden.modelo         || '';
        document.getElementById('o-notas').value       = orden.notes          || orden.notas || '';
        document.getElementById('o-diagnostico').value = orden.diagnostico    || '';
        document.getElementById('o-serial').value      = orden.serial_equipo  || '';
        document.getElementById('o-costo').value       = orden.costo_servicio || '';

        ['o-cliente','o-serial','o-marca','o-modelo'].forEach(fid => {
            const el = document.getElementById(fid);
            el.disabled = true;
            el.style.background = 'var(--bg1)'; el.style.color = 'var(--text3)';
            el.style.cursor = 'not-allowed';     el.style.opacity = '0.6';
        });
        ['o-tecnico','o-equipo','o-fecha','o-costo','o-falla','o-diagnostico','o-notas','o-entrega','o-estado'].forEach(fid => {
            const el = document.getElementById(fid);
            el.disabled = false;
            el.style.background = el.style.color = el.style.cursor = el.style.opacity = '';
        });

        openModal('modal-orden');
    } catch (error) {
        console.error('Error al obtener la orden para edición:', error);
        toast(t('toast_error_orden_datos'), 'error');
    }
}

function filtrarOrdenes(estado, el) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    el.classList.add('active');
    renderOrdenes(estado);
}

function filtrarTablaOrdenes(valor) {
    filtroTexto = valor.toLowerCase().trim();
    renderOrdenes(false);
}

// ── TOAST ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success:'ti-circle-check', error:'ti-circle-x', info:'ti-info-circle', warning:'ti-alert-triangle' };
    el.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}"></i>${msg}`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

cargarDatos().then(() => renderOrdenes('all'));