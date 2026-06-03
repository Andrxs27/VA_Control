const API = 'http://localhost:3000/api';
let usuariosDB = [];
let clientesDB = [];

async function cargarDatos() {
    const resUsuarios = await fetch(`${API}/usuarios`);
    usuariosDB = await resUsuarios.json();

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
        <button class="btn btn-danger btn-sm" onclick="eliminarOrden(${o.id})"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`;
    }

    document.getElementById('tb-ordenes').innerHTML = html ||
        '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">No hay órdenes</td></tr>';
}

async function guardarOrden() {
    const cliente_id = document.getElementById('o-cliente').value;
    const tecnico_id = document.getElementById('o-tecnico').value || null;
    const equipo = document.getElementById('o-equipo').value;
    const falla = document.getElementById('o-falla').value;
    const estado = document.getElementById('o-estado').value;
    const tipo_entrega = document.getElementById('o-entrega').value;
    const fecha_promesa = document.getElementById('o-fecha').value;

    if (!cliente_id || !equipo || !falla) {
        alert('Cliente, equipo y falla son requeridos');
        return;
    }

    await fetch(`${API}/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id, tecnico_id, equipo, falla, estado, tipo_entrega, fecha_promesa })
    });

    closeModal('modal-orden');
    renderOrdenes();
}

async function eliminarOrden(id) {
    await fetch(`${API}/ordenes/${id}`, { method: 'DELETE' });
    renderOrdenes();
}

function filtrarOrdenes(estado, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderOrdenes(estado);
}

cargarDatos().then(() => renderOrdenes());