const API = 'http://localhost:3000/api';
let usuariosDB = [];
let clientesDB = [];
let ordenEditandoId = null;

// variables para saber qué orden estamos borrando o desactivando
let idOrdenAccion = null;
let tipoAccion = '';

// cargar los datos de los selectores 
async function cargarDatos() {
    // CRUD - GET - aquí se busca la lista de usuarios en el servidor 
    const resUsuarios = await fetch(`${API}/usuarios`);
    usuariosDB = await resUsuarios.json();

    // CRUD - GET - aquí buscamos la lista de clientes en el servidor
    const resClientes = await fetch(`${API}/clientes`);
    clientesDB = await resClientes.json();

    document.getElementById('o-cliente').innerHTML = '<option value="">Seleccionar...</option>' +
        clientesDB.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

    document.getElementById('o-tecnico').innerHTML = '<option value="">Sin asignar</option>' +
        usuariosDB.filter(u => u.rol === 'tecnico').map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
}

function getNombreCliente(id) {
    const c = clientesDB.find(c => c.id === id);
    return c ? c.nombre : 'N/A';
}

function getNombreUsuario(id) {
    const u = usuariosDB.find(u => u.id === id);
    return u ? u.nombre : 'Sin asignar';
}

function formatFecha(fecha) {
    if (!fecha) return '—';
    return fecha.split('T')[0];
}

function estadoBadge(e) {
    const map = {
        pendiente: ['badge-amber', 'Pendiente'],
        en_proceso: ['badge-blue', 'En Proceso'],
        completado: ['badge-green', 'Completado'],
        entregado: ['badge-gray', 'Entregado'],
        cancelado: ['badge-red', 'Cancelado']
    };
    const [cls, label] = map[e] || ['badge-gray', e];
    return `<span class="badge ${cls}">${label}</span>`;
}


async function renderOrdenes(filtro = 'all') {
    // CRUD - GET  aquí pedimos todas las órdenes guardadas en el servidor para armar la tabla
    const res = await fetch(`${API}/ordenes`);
    const ordenes = await res.json();
    
    const data = filtro === 'all' ? ordenes : ordenes.filter(o => o.estado === filtro);

    let html = '';
    for (const o of data) {
        html += `<tr>
        <td style="font-weight:600">#${String(o.id).padStart(4, '0')}</td>
        <td>${getNombreCliente(o.cliente_id)}</td>
        <td>${o.tecnico_id ? getNombreUsuario(o.tecnico_id) : '<span style="color:var(--text3)">Sin asignar</span>'}</td>
        <td>${o.equipo} — ${o.falla}</td>
        <td>${estadoBadge(o.estado)}</td>
        <td>${o.tipo_entrega === 'domicilio' ? '<span class="badge badge-blue">Domicilio</span>' : '<span class="badge badge-gray">Tienda</span>'}</td>
        <td>${formatFecha(o.fecha_promesa)}</td>
        <td>
            <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${o.id})" title="Editar">
                <i class="ti ti-edit"></i>
            </button>

            ${o.estado === 'cancelado'
                ? `<button class="btn btn-sm" style="background:#10b981;color:white" onclick="solicitarCambioEstado(${o.id}, 'pendiente')" title="Activar">
                    <i class="ti ti-refresh"></i>
                    </button>`
                : `<button class="btn btn-sm" style="background:#6b7280;color:white" onclick="solicitarCambioEstado(${o.id}, 'cancelado')" title="Desactivar">
                    <i class="ti ti-ban"></i>
                    </button>`
            }

            <button class="btn btn-danger btn-sm" onclick="solicitarEliminacion(${o.id})" title="Eliminar">
                <i class="ti ti-trash"></i>
            </button>
        </td>
    </tr>`;
    }

    document.getElementById('tb-ordenes').innerHTML = html ||
        '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">No hay órdenes</td></tr>';
}

// Desactivar o reactivar 
function solicitarCambioEstado(id, nuevoEstado) {
    idOrdenAccion = id;
    tipoAccion = nuevoEstado;

    const esDesactivar = nuevoEstado === 'cancelado';

    document.getElementById('confirm-titulo').innerText = esDesactivar ? '¿Desactivar orden de servicio?' : '¿Reactivar orden de servicio?';
    document.getElementById('confirm-mensaje').innerText = esDesactivar 
        ? 'La orden quedará inhabilitada de forma temporal en el sistema.' 
        : 'La orden volverá a estar activa en el sistema.';
    
    document.getElementById('confirm-icon').className = esDesactivar ? 'ti ti-ban' : 'ti ti-refresh';
    document.getElementById('confirm-btn-proceder').onclick = ejecutarAccionConfirmada;
    openModal('modal-confirmacion');
}

function solicitarEliminacion(id) {
    idOrdenAccion = id;
    tipoAction = 'eliminar';

    document.getElementById('confirm-titulo').innerText = '¿Eliminar orden de servicio?';
    document.getElementById('confirm-mensaje').innerText = 'Al confirmar, la orden se eliminará de forma permanente del sistema. Esta acción no se puede revertir.';
    document.getElementById('confirm-icon').className = 'ti ti-alert-triangle';

    document.getElementById('confirm-btn-proceder').onclick = ejecutarAccionConfirmada;
    openModal('modal-confirmacion');
}


async function ejecutarAccionConfirmada() {
    if (tipoAccion === 'eliminar') {
        // CRUD -DELETE 
        await fetch(`${API}/ordenes/${idOrdenAccion}`, { method: 'DELETE' });
        toast('Orden de servicio eliminada', 'success');
    } else {
        // CRUD - GET 
        const res = await fetch(`${API}/ordenes/${idOrdenAccion}`);
        const orden = await res.json();
        
    
        orden.estado = tipoAccion;

        // CRUD - PUT aca la orden se actualiza con el nuevo estado 
        await fetch(`${API}/ordenes/${idOrdenAccion}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orden)
        });
        
        toast(tipoAccion === 'cancelado' ? 'Orden desactivada con éxito' : 'Orden activada con éxito', 'success');
    }

    closeModal('modal-confirmacion');
    renderOrdenes('all');
}


async function guardarOrden() {
    const cliente_id = document.getElementById('o-cliente').value;
    const tecnico_id = document.getElementById('o-tecnico').value || null;
    const equipo = document.getElementById('o-equipo').value;
    const falla = document.getElementById('o-falla').value;
    const estado = document.getElementById('o-estado').value;
    const tipo_entrega = document.getElementById('o-entrega').value;
    const fecha_promesa = document.getElementById('o-fecha').value || null;

    const datosOrden = { cliente_id, tecnico_id, equipo, falla, estado, tipo_entrega, fecha_promesa };

    if (ordenEditandoId) {
        // CRUD - PUT si la orden ya estaba se usa put para que se actualice con los nuevos datos
        await fetch(`${API}/ordenes/${ordenEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosOrden)
        });
        toast('Orden actualizada correctamente', 'success');
    } else {
        // CRUD - POST y si es una orden nueva usamos post para crearla y guardarla 
        await fetch(`${API}/ordenes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosOrden)
        });
        toast('Orden creada correctamente', 'success');
    }

    ordenEditandoId = null;
    closeModal('modal-orden');
    renderOrdenes('all');
}

function prepararEdicion(id) {
    ordenEditandoId = id;

    // CRUD - GET aca se busca la orden por el id para q se muestren los datos 
    fetch(`${API}/ordenes/${id}`)
        .then(r => r.json())
        .then(orden => {
            document.getElementById('o-cliente').value = orden.cliente_id;
            document.getElementById('o-tecnico').value = orden.tecnico_id || '';
            document.getElementById('o-equipo').value = orden.equipo;
            document.getElementById('o-falla').value = orden.falla;
            document.getElementById('o-estado').value = orden.estado;
            document.getElementById('o-entrega').value = orden.tipo_entrega;
            document.getElementById('o-fecha').value = orden.fecha_promesa ? orden.fecha_promesa.split('T')[0] : '';

            openModal('modal-orden');
        });
}

function filtrarOrdenes(estado, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderOrdenes(estado);
}

cargarDatos().then(() => renderOrdenes('all'));