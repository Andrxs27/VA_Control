const API = "https://vacontrol-production.up.railway.app/api";
let clientesLista = [];
let clienteEditandoId = null;
let accionConfirmadaCallback = null;

// SISTEMA DE TRADUCCIÓN 
function _en() { return localStorage.getItem('va_idioma') === 'en'; }
function _t(es, en) { return _en() ? en : es; }

if (typeof openModal !== 'function') {
    window.openModal  = id => document.getElementById(id)?.classList.add('open'); // el window garantiza que las funciones sean globales 
}
if (typeof closeModal !== 'function') {
    window.closeModal = id => document.getElementById(id)?.classList.remove('open');
}

//  (CRUD - GET)
async function cargarClientes() {
    try {
        const inputBuscar = document.getElementById('buscar-cliente'); //
        if (inputBuscar) inputBuscar.value = '';

        // fetch  GET para traer la lisat de los clientes desde el backend 
        const res = await fetch(`${API}/clientes`);
        if (!res.ok) throw new Error(_t('Error al obtener clientes', 'Error fetching clients'));
        clientesLista = await res.json();
        renderizarTabla(clientesLista);
    } catch (error) {
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

// renderizacion de las tablas 
function renderizarTabla(lista) {
    const tbody = document.getElementById('tb-clientes');
    if (!tbody) return;
    tbody.innerHTML = '';

    const thead = tbody.closest('table')?.querySelector('thead');//
    if (thead) {
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>${_t('Documento', 'Document')}</th>
                <th>${_t('Nombre', 'Name')}</th>
                <th>${_t('Correo', 'Email')}</th>
                <th>${_t('Teléfono', 'Phone')}</th>
                <th>${_t('Estado', 'Status')}</th>
                <th>${_t('Acciones', 'Actions')}</th>
            </tr>`;
    }

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text3)">${_t('No hay clientes registrados','No registered clients')}</td></tr>`;
        return;
    }

    lista.forEach(c => {
        
        const botonEstado = c.activo
            ? `<button class="btn btn-sm" style="background:#6b7280;color:white" onclick="solicitarCambioEstado(${c.id},false)" title="${_t('Desactivar','Deactivate')}"><i class="ti ti-user-off"></i></button>`
            : `<button class="btn btn-sm" style="background:#10b981;color:white" onclick="solicitarCambioEstado(${c.id},true)" title="${_t('Activar','Activate')}"><i class="ti ti-user-check"></i></button>`;

        const badgeLabel = c.activo ? _t('Activo','Active') : _t('Inactivo','Inactive');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.id}</td>
            <td><strong>${c.identificacion || 'N/A'}</strong></td>
            <td>${c.nombre}</td>
            <td>${c.email || '—'}</td>
            <td>${c.telefono || '—'}</td>
            <td><span class="badge ${c.activo ? 'badge-green' : 'badge-gray'}">${badgeLabel}</span></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${c.id})" title="${_t('Editar','Edit')}"><i class="ti ti-edit"></i></button>
                ${botonEstado}
                <button class="btn btn-danger btn-sm" onclick="solicitarEliminacion(${c.id})" title="${_t('Eliminar','Delete')}"><i class="ti ti-trash"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
}

//filtar clientes 
function filtrarClientes() {
    const texto = document.getElementById('buscar-cliente').value.toLowerCase().trim();
    if (!texto) { renderizarTabla(clientesLista); return; }
    renderizarTabla(clientesLista.filter(c => //
        (c.identificacion || '').toLowerCase().includes(texto) ||
        (c.nombre        || '').toLowerCase().includes(texto) ||
        (c.email         || '').toLowerCase().includes(texto) ||
        (c.telefono      || '').toLowerCase().includes(texto)
    ));
}

function prepararCreacion() {
    clienteEditandoId = null;
    const desbloq = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = ''; el.disabled = false;
        el.style.background = el.style.color = el.style.cursor = el.style.opacity = '';
    };
    desbloq('c-identificacion'); desbloq('c-email');
    document.getElementById('c-nombre').value    = '';
    document.getElementById('c-telefono').value  = '';
    document.getElementById('c-direccion').value = '';
    document.getElementById('c-tipo').value      = 'particular';
    const notas = document.getElementById('c-notas');
    if (notas) notas.value = '';

    document.getElementById('modal-cliente-titulo').innerText = _t('Nuevo Cliente','New Client');
    const btn = document.querySelector('#modal-cliente .modal-footer .btn-primary');
    if (btn) btn.innerHTML = `<i class="ti ti-check"></i> ${_t('Crear Cliente','Create Client')}`;

    openModal('modal-cliente');
}

function prepararEdicion(id) {
    const cliente = clientesLista.find(c => c.id === id);
    if (!cliente) return;
    clienteEditandoId = id; 

    const bloquear = (id, valor) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = valor; el.disabled = true;
        el.style.background = 'var(--bg1)'; el.style.color = 'var(--text3)';
        el.style.cursor = 'not-allowed';     el.style.opacity = '0.6';
    };
    bloquear('c-identificacion', cliente.identificacion || '');
    bloquear('c-email', cliente.email || '');

    document.getElementById('c-nombre').value    = cliente.nombre    || '';
    document.getElementById('c-telefono').value  = cliente.telefono  || '';
    document.getElementById('c-direccion').value = cliente.direccion || '';
    document.getElementById('c-tipo').value      = cliente.tipo      || 'particular';
    const notas = document.getElementById('c-notas');
    if (notas) notas.value = cliente.notas || '';

    document.getElementById('modal-cliente-titulo').innerText = _t('Editar Cliente','Edit Client');
    const btn = document.querySelector('#modal-cliente .modal-footer .btn-primary');
    if (btn) btn.innerHTML = `<i class="ti ti-check"></i> ${_t('Guardar Cambios','Save Changes')}`;

    openModal('modal-cliente');
}

// CRUD - UPDATE / POST / PUT
async function guardarCliente() {
    const identificacion = document.getElementById('c-identificacion').value.trim();
    const nombre         = document.getElementById('c-nombre').value.trim();
    const email          = document.getElementById('c-email').value.trim();
    const telefono       = document.getElementById('c-telefono').value.trim();
    const direccion      = document.getElementById('c-direccion').value.trim();
    const tipo           = document.getElementById('c-tipo').value;
    const notas          = document.getElementById('c-notas')?.value.trim() || null;

    if (!identificacion || !nombre) {
        mostrarToast(_t('La identificación y el nombre son requeridos','ID and name are required'), 'error');
        return;
    }

    const payload = { identificacion, nombre, email: email || null, telefono: telefono || null, direccion: direccion || null, tipo, notas: notas || null };

    try {
        
        const url    = clienteEditandoId ? `${API}/clientes/${clienteEditandoId}` : `${API}/clientes`;
        const method = clienteEditandoId ? 'PUT' : 'POST';
        const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || _t('Error al guardar cliente','Error saving client'));
        }

        mostrarToast(clienteEditandoId
            ? _t('Cliente actualizado correctamente','Client updated successfully')
            : _t('Cliente creado correctamente','Client created successfully'), 'success');
        closeModal('modal-cliente');
        cargarClientes(); 
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

function abrirDialogoConfirmacion({ titulo, mensaje, icono, colorFondo, colorIcono, textoBoton, colorBoton, callback }) {
    document.getElementById('confirm-titulo').innerText  = titulo;
    document.getElementById('confirm-mensaje').innerText = mensaje;

    const iconContainer = document.getElementById('confirm-icon-container');
    iconContainer.style.backgroundColor = colorFondo;
    iconContainer.style.color           = colorIcono;
    document.getElementById('confirm-icon').className   = `ti ${icono}`;

    const btnProceder       = document.getElementById('confirm-btn-proceder');
    btnProceder.innerText   = textoBoton;
    btnProceder.style.backgroundColor = colorBoton;


    accionConfirmadaCallback = () => { callback(); closeModal('modal-confirmacion'); };
    btnProceder.onclick = accionConfirmadaCallback;
    openModal('modal-confirmacion');
}

function solicitarCambioEstado(id, nuevoEstado) {
    const cliente      = clientesLista.find(c => c.id === id);
    const identificador = cliente ? ` ${_t('de','of')} ${cliente.nombre}` : '';

    abrirDialogoConfirmacion({
        titulo:     nuevoEstado ? _t('¿Activar cuenta de cliente?','Activate client account?') : _t('¿Desactivar cuenta de cliente?','Deactivate client account?'),
        mensaje:    nuevoEstado
            ? _t(`El cliente${identificador} cambiará a estado activo.`, `Client${identificador} will be set to active.`)
            : _t(`El cliente${identificador} pasará a estar inactivo temporalmente.`, `Client${identificador} will be temporarily inactive.`),
        icono:      nuevoEstado ? 'ti-user-check' : 'ti-user-off',
        colorFondo: nuevoEstado ? '#e6f4ea' : '#f3f4f6',
        colorIcono: nuevoEstado ? '#10b981' : '#4b5563',
        textoBoton: _t('Confirmar','Confirm'),
        colorBoton: nuevoEstado ? '#10b981' : '#6b7280',
        callback:   () => cambiarEstadoCliente(id, nuevoEstado)
    });
}

function solicitarEliminacion(id) {
    const cliente      = clientesLista.find(c => c.id === id);
    const identificador = cliente ? `${cliente.nombre} (${cliente.identificacion})` : _t('este cliente','this client');

    abrirDialogoConfirmacion({
        titulo:     _t('¿Eliminar cuenta de cliente?','Delete client account?'),
        mensaje:    _t(`El registro de ${identificador} se eliminará de forma permanente.`, `The record of ${identificador} will be permanently deleted.`),
        icono:      'ti-alert-triangle',
        colorFondo: '#fee2e2',
        colorIcono: '#ef4444',
        textoBoton: _t('Confirmar','Confirm'),
        colorBoton: '#ef4444',
        callback:   () => eliminarClienteDefinitivo(id)
    });
}


async function cambiarEstadoCliente(id, nuevoEstado) {
    try {

        const res = await fetch(`${API}/clientes/${id}/estado`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: nuevoEstado })
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || _t('No se pudo cambiar el estado','Could not change status')); }
        mostrarToast(_t('Estado del cliente actualizado','Client status updated'), 'success');
        cargarClientes();
    } catch (error) { mostrarToast(error.message, 'error'); }
}
// CRUD - DELETE
async function eliminarClienteDefinitivo(id) {
    try {
        const res  = await fetch(`${API}/clientes/${id}`, { method: 'DELETE' });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || _t('No se pudo eliminar el cliente','Could not delete client')); }
        const data = await res.json();
        mostrarToast(data.mensaje || _t('Cliente eliminado permanentemente','Client permanently deleted'), 'success');
        cargarClientes();
    } catch (error) { mostrarToast(error.message, 'error'); }
}

// las notificaciones tipo toast 
function mostrarToast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: 'ti-circle-check', error: 'ti-circle-x', info: 'ti-info-circle' };
    el.innerHTML = `<i class="ti ${icons[type] || 'ti-info-circle'}" style="font-size:16px;color:${type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--blue)'}"></i>${msg}`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500); 
}

cargarClientes();