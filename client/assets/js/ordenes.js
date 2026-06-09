const API = 'http://localhost:3000/api';
let usuariosDB = [];
let clientesDB = [];
let ordenEditandoId = null;

let idOrdenAccion = null;
let tipoAccion = '';

// Variables globales para el sistema de filtrado dinámico combinado
let ordenesListados = [];
let filtroTexto = '';
let filtroEstado = 'all';

// Cargar los datos de los selectores 
async function cargarDatos() {
    try {
        const resUsuarios = await fetch(`${API}/usuarios`);
        usuariosDB = await resUsuarios.json();

        const resClientes = await fetch(`${API}/clientes`);
        clientesDB = await resClientes.json();

        document.getElementById('o-cliente').innerHTML = '<option value="">Seleccionar...</option>' +
            clientesDB.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

        document.getElementById('o-tecnico').innerHTML = '<option value="">Sin asignar</option>' +
            usuariosDB.filter(u => u.rol === 'tecnico').map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        if (typeof toast === 'function') toast('Error al conectar con el servidor', 'danger');
    }
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
    try {
        // Si el filtro obliga a recargar la API (all o true) o si la lista local está vacía
        if (filtro === 'all' || filtro === true || ordenesListados.length === 0) {
            const res = await fetch(`${API}/ordenes`);
            ordenesListados = await res.json();
        }
        
        // Si el parámetro recibido es un estado de pestaña válido, actualizamos el filtro de estado global
        if (['all', 'pendiente', 'en_proceso', 'completado', 'entregado', 'cancelado'].includes(filtro)) {
            filtroEstado = filtro;
        }
        
        // =========================================================================
        // ACTUALIZACIÓN DE BADGE: Filtrar y contar órdenes en los 3 estados requeridos
        // =========================================================================
        const ordenesActivas = ordenesListados.filter(o => 
            o.estado === 'pendiente' || 
            o.estado === 'en_proceso' || 
            o.estado === 'completado'
        ).length;

        const badgeOrdenes = document.getElementById('badge-ordenes');
        if (badgeOrdenes) {
            badgeOrdenes.innerText = ordenesActivas;
            // Si no hay órdenes pendientes, en proceso o completadas, ocultamos el badge
            if (ordenesActivas === 0) {
                badgeOrdenes.style.display = 'none';
            } else {
                badgeOrdenes.style.display = 'inline-flex';
            }
        }
        // =========================================================================

        // Aplicación del sistema de filtrado combinado (Estado de pestaña + Texto de búsqueda)
        const data = ordenesListados.filter(o => {
            const coincideEstado = filtroEstado === 'all' || o.estado === filtroEstado;
            
            const nombreCliente = getNombreCliente(o.cliente_id).toLowerCase();
            const nombreTecnico = o.tecnico_id ? getNombreUsuario(o.tecnico_id).toLowerCase() : 'sin asignar';
            const equipo = (o.equipo || '').toLowerCase();
            const falla = (o.falla || '').toLowerCase();
            const idStr = String(o.id);
            const idFormateado = `#${idStr.padStart(4, '0')}`;

            const coincideTexto = nombreCliente.includes(filtroTexto) ||
                                  nombreTecnico.includes(filtroTexto) ||
                                  equipo.includes(filtroTexto) ||
                                  falla.includes(filtroTexto) ||
                                  idStr.includes(filtroTexto) ||
                                  idFormateado.includes(filtroTexto);

            return coincideEstado && coincideTexto;
        });

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
            '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">No se encontraron órdenes con los criterios de búsqueda</td></tr>';
    } catch (error) {
        console.error("Error al renderizar órdenes:", error);
    }
}

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
    tipoAccion = 'eliminar'; 

    document.getElementById('confirm-titulo').innerText = '¿Eliminar orden de servicio?';
    document.getElementById('confirm-mensaje').innerText = 'Al confirmar, la orden se eliminará de forma permanente del sistema. Esta acción no se puede revertir.';
    document.getElementById('confirm-icon').className = 'ti ti-alert-triangle';

    document.getElementById('confirm-btn-proceder').onclick = ejecutarAccionConfirmada;
    openModal('modal-confirmacion');
}

async function ejecutarAccionConfirmada() {
    try {
        if (tipoAccion === 'eliminar') {
            await fetch(`${API}/ordenes/${idOrdenAccion}`, { method: 'DELETE' });
            toast('Orden de servicio eliminada', 'success');
        } else {
            const res = await fetch(`${API}/ordenes/${idOrdenAccion}`);
            const orden = await res.json();
            
            orden.estado = tipoAccion;

            await fetch(`${API}/ordenes/${idOrdenAccion}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orden)
            });
            
            toast(tipoAccion === 'cancelado' ? 'Orden desactivada con éxito' : 'Orden activada con éxito', 'success');
        }
    } catch (error) {
        console.error("Error al ejecutar acción confirmada:", error);
        toast('No se pudo realizar la operación', 'danger');
    } finally {
        closeModal('modal-confirmacion');
        renderOrdenes('all');
    }
}

function nuevaOrden() {
    ordenEditandoId = null;
    
    document.getElementById('o-cliente').value = '';
    document.getElementById('o-tecnico').value = '';
    document.getElementById('o-equipo').value = '';
    document.getElementById('o-fecha').value = '';
    document.getElementById('o-marca').value = '';
    document.getElementById('o-modelo').value = '';
    document.getElementById('o-serial').value = '';
    document.getElementById('o-costo').value = '';
    document.getElementById('o-falla').value = '';
    document.getElementById('o-diagnostico').value = '';
    document.getElementById('o-notas').value = '';
    document.getElementById('o-entrega').value = 'tienda';
    document.getElementById('o-estado').value = 'pendiente';

    const modalTitle = document.querySelector('#modal-orden .modal-head h2');
    if (modalTitle) modalTitle.innerText = 'Nueva Orden de Servicio';

    openModal('modal-orden');
}

async function guardarOrden() {
    try {
        const cliente_id = document.getElementById('o-cliente').value;
        const tecnico_id = document.getElementById('o-tecnico').value || null;
        const equipo = document.getElementById('o-equipo').value;
        const falla = document.getElementById('o-falla').value;
        const estado = document.getElementById('o-estado').value;
        const tipo_entrega = document.getElementById('o-entrega').value;
        const fecha_promesa = document.getElementById('o-fecha').value || null;
        const marca = document.getElementById('o-marca').value;
        const modelo = document.getElementById('o-modelo').value;
        const notas = document.getElementById('o-notas').value;
        const diagnostico = document.getElementById('o-diagnostico').value;

        // ALINEACIÓN DE CLAVES EXTRAPTADAS CON EL BACKEND
        const serial_equipo = document.getElementById('o-serial').value;
        const costo_servicio = parseFloat(document.getElementById('o-costo').value) || 0;

        if (!cliente_id || !equipo || !falla) {
            toast('Por favor completa los campos obligatorios (*)', 'warning');
            return;
        }

        const datosOrden = { 
            cliente_id, tecnico_id, equipo, falla, estado, 
            tipo_entrega, fecha_promesa, marca, modelo, serial_equipo, costo_servicio, notas, diagnostico 
        };

        if (ordenEditandoId) {
            await fetch(`${API}/ordenes/${ordenEditandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosOrden)
            });
            toast('Orden actualizada correctamente', 'success');
        } else {
            await fetch(`${API}/ordenes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosOrden)
            });
            toast('Orden creada correctamente', 'success');
        }
        closeModal('modal-orden');
    } catch (error) {
        console.error("Error al guardar la orden:", error);
        toast('Error al guardar la orden en el servidor', 'danger');
    } finally {
        ordenEditandoId = null;
        renderOrdenes('all');
    }
}

async function prepararEdicion(id) {
    try {
        ordenEditandoId = id;

        const res = await fetch(`${API}/ordenes/${id}`);
        const orden = await res.json();

        const modalTitle = document.querySelector('#modal-orden .modal-head h2');
        if (modalTitle) modalTitle.innerText = `Editar Orden #${String(id).padStart(4, '0')}`;

        document.getElementById('o-cliente').value = orden.cliente_id;
        document.getElementById('o-tecnico').value = orden.tecnico_id || '';
        document.getElementById('o-equipo').value = orden.equipo;
        document.getElementById('o-falla').value = orden.falla;
        document.getElementById('o-estado').value = orden.estado;
        document.getElementById('o-entrega').value = orden.tipo_entrega;
        document.getElementById('o-fecha').value = orden.fecha_promesa ? orden.fecha_promesa.split('T')[0] : '';
        document.getElementById('o-marca').value = orden.marca || '';
        document.getElementById('o-modelo').value = orden.modelo || '';
        document.getElementById('o-notas').value = orden.notas || '';
        document.getElementById('o-diagnostico').value = orden.diagnostico || '';

        // ALINEACIÓN DE CAMPOS DESDE LA RESPUESTA DE LA BASE DE DATOS
        document.getElementById('o-serial').value = orden.serial_equipo || '';
        document.getElementById('o-costo').value = orden.costo_servicio || '';

        openModal('modal-orden');
    } catch (error) {
        console.error("Error al obtener la orden para edición:", error);
        toast('No se pudieron cargar los datos de la orden', 'danger');
    }
}

function filtrarOrdenes(estado, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderOrdenes(estado);
}

// Función encargada de actualizar el filtro de texto y repintar al escribir
function filtrarTablaOrdenes(valor) {
    filtroTexto = valor.toLowerCase().trim();
    renderOrdenes(false); // Renderiza usando la lista en memoria instantáneamente
}

cargarDatos().then(() => renderOrdenes('all'));