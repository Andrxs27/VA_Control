const API = "https://vacontrol-production.up.railway.app/api";
let usuariosLista        = [];
let usuarioEditandoId    = null;
let accionConfirmadaCallback = null;

function _en()      { return localStorage.getItem('va_idioma') === 'en'; }
function _t(es, en) { return _en() ? en : es; }

const getAuthHeaders = () => {
    const token = localStorage.getItem('va_token');
    return { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
};

// ── TOAST ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success:'ti-circle-check', error:'ti-circle-x', info:'ti-info-circle' };
    el.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}"></i>${msg}`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// ── PASSWORD TOGGLE ──────────────────────────────────────────────────────────
function togglePasswordVisibility(inputId, boton) {
    const input = document.getElementById(inputId);
    const icono = boton.querySelector('i');
    if (input.type === 'password') { input.type = 'text';     icono.className = 'ti ti-eye-off'; }
    else                           { input.type = 'password'; icono.className = 'ti ti-eye'; }
}

function restablecerVisibilidadPasswords() {
    ['u-password','u-confirm-password'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.type = 'password';
    });
    document.querySelectorAll('.password-wrapper .icon-btn-toggle i').forEach(i => { i.className = 'ti ti-eye'; });
}

// ── 1. CARGAR USUARIOS ───────────────────────────────────────────────────────
async function cargarUsuarios() {
    try {
        const inputBuscar = document.getElementById('buscar-usuario');
        if (inputBuscar) inputBuscar.value = '';
        const res = await fetch(`${API}/usuarios`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(_t('Error al obtener usuarios','Error fetching users'));
        usuariosLista = await res.json();
        renderizarTabla(usuariosLista);
    } catch (error) {
        toast(`Error: ${error.message}`, 'error');
    }
}

function rolBadge(rol) {
    const en = _en();
    const map = {
        admin:    ['badge-red',   en ? 'Admin'       : 'Admin'],
        vendedor: ['badge-blue',  en ? 'Seller'      : 'Vendedor'],
        tecnico:  ['badge-amber', en ? 'Technician'  : 'Técnico'],
    };
    const [cls, label] = map[rol] || ['badge-gray', rol];
    return `<span class="badge ${cls}">${label}</span>`;
}

function renderizarTabla(lista) {
    const tbody = document.getElementById('tb-usuarios');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3)">${_t('No hay usuarios registrados','No registered users')}</td></tr>`;
        return;
    }

    const activo   = _t('Activo','Active');
    const inactivo = _t('Inactivo','Inactive');
    const desact   = _t('Desactivar','Deactivate');
    const activar  = _t('Activate','Activate');
    const editar   = _t('Editar','Edit');
    const eliminar = _t('Eliminar','Delete');

    lista.forEach(u => {
        const botonEstado = u.activo
            ? `<button class="btn btn-sm" style="background:#6b7280;color:white" onclick="solicitarCambioEstado(${u.id},false)" title="${desact}"><i class="ti ti-user-off"></i></button>`
            : `<button class="btn btn-sm" style="background:#10b981;color:white" onclick="solicitarCambioEstado(${u.id},true)"  title="${activar}"><i class="ti ti-user-check"></i></button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>${rolBadge(u.rol)}</td>
            <td><span class="badge ${u.activo ? 'badge-green' : 'badge-gray'}">${u.activo ? activo : inactivo}</span></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${u.id})" title="${editar}"><i class="ti ti-edit"></i></button>
                ${botonEstado}
                <button class="btn btn-danger btn-sm" onclick="solicitarEliminacion(${u.id})" title="${eliminar}"><i class="ti ti-trash"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
}

// ── FILTRAR ──────────────────────────────────────────────────────────────────
function filtrarUsuarios() {
    const texto = document.getElementById('buscar-usuario').value.toLowerCase().trim();
    if (!texto) { renderizarTabla(usuariosLista); return; }
    renderizarTabla(usuariosLista.filter(u =>
        (u.nombre || '').toLowerCase().includes(texto) ||
        (u.email  || '').toLowerCase().includes(texto) ||
        (u.rol    || '').toLowerCase().includes(texto)
    ));
}

// ── 2. FORMULARIO CREAR / EDITAR ─────────────────────────────────────────────
function prepararCreacion() {
    usuarioEditandoId = null;
    document.getElementById('u-nombre').value = '';
    document.getElementById('u-email').value  = '';
    document.getElementById('u-rol').value    = 'admin';

    const passInput = document.getElementById('u-password');
    passInput.value       = '';
    passInput.placeholder = '••••••••';

    const confirmPass = document.getElementById('u-confirm-password');
    if (confirmPass) { confirmPass.value = ''; confirmPass.placeholder = '••••••••'; }

    restablecerVisibilidadPasswords();

    document.querySelector('#modal-usuario h2').innerText = _t('Nuevo Usuario','New User');
    const btn = document.querySelector('#modal-usuario .modal-footer .btn-primary');
    if (btn) btn.innerHTML = `<i class="ti ti-check"></i> ${_t('Crear Usuario','Create User')}`;

    openModal('modal-usuario');
}

function prepararEdicion(id) {
    const usuario = usuariosLista.find(u => u.id === id);
    if (!usuario) return;
    usuarioEditandoId = id;

    document.getElementById('u-nombre').value = usuario.nombre;
    document.getElementById('u-email').value  = usuario.email;
    document.getElementById('u-rol').value    = usuario.rol;

    const passInput = document.getElementById('u-password');
    passInput.value       = '';
    passInput.placeholder = _t('Dejar en blanco para no cambiar','Leave blank to keep unchanged');

    const confirmPass = document.getElementById('u-confirm-password');
    if (confirmPass) { confirmPass.value = ''; confirmPass.placeholder = _t('Dejar en blanco para no cambiar','Leave blank to keep unchanged'); }

    restablecerVisibilidadPasswords();

    document.querySelector('#modal-usuario h2').innerText = _t('Editar Usuario','Edit User');
    const btn = document.querySelector('#modal-usuario .modal-footer .btn-primary');
    if (btn) btn.innerHTML = `<i class="ti ti-check"></i> ${_t('Guardar Cambios','Save Changes')}`;

    openModal('modal-usuario');
}

// ── 3. GUARDAR ───────────────────────────────────────────────────────────────
async function guardarUsuario() {
    const nombre         = document.getElementById('u-nombre').value.trim();
    const email          = document.getElementById('u-email').value.trim();
    const rol            = document.getElementById('u-rol').value;
    const password       = document.getElementById('u-password').value;
    const confirmPassword = document.getElementById('u-confirm-password').value;

    if (!nombre || !email) { toast(_t('Nombre y email son requeridos','Name and email are required'), 'error'); return; }
    if (!usuarioEditandoId && !password) { toast(_t('La contraseña es requerida para nuevos usuarios','Password is required for new users'), 'error'); return; }
    if (password !== confirmPassword) { toast(_t('Las contraseñas no coinciden','Passwords do not match'), 'error'); return; }

    try {
        let res;
        if (usuarioEditandoId) {
            const datos = { nombre, email, rol };
            if (password.trim() !== '') datos.password = password;
            res = await fetch(`${API}/usuarios/${usuarioEditandoId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(datos) });
        } else {
            res = await fetch(`${API}/usuarios`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ nombre, email, password, rol }) });
        }
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || _t('Error al guardar usuario','Error saving user')); }
        toast(usuarioEditandoId ? _t('Usuario actualizado','User updated') : _t('Usuario creado correctamente','User created successfully'), 'success');
        closeModal('modal-usuario');
        cargarUsuarios();
    } catch (error) { toast(error.message, 'error'); }
}

// ── 4. CONFIRMACIONES ────────────────────────────────────────────────────────
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
    const usuario      = usuariosLista.find(u => u.id === id);
    const identificador = usuario ? ` ${_t('de','of')} ${usuario.nombre}` : '';
    abrirDialogoConfirmacion({
        titulo:     nuevoEstado ? _t('¿Activar cuenta de usuario?','Activate user account?') : _t('¿Desactivar cuenta de usuario?','Deactivate user account?'),
        mensaje:    nuevoEstado
            ? _t(`El usuario${identificador} recuperará el acceso al sistema.`, `User${identificador} will regain access to the system.`)
            : _t(`El usuario${identificador} será inhabilitado temporalmente.`, `User${identificador} will be temporarily disabled.`),
        icono:      nuevoEstado ? 'ti-user-check' : 'ti-user-off',
        colorFondo: nuevoEstado ? '#e6f4ea' : '#f3f4f6',
        colorIcono: nuevoEstado ? '#10b981' : '#4b5563',
        textoBoton: _t('Confirmar','Confirm'),
        colorBoton: nuevoEstado ? '#10b981' : '#6b7280',
        callback:   () => cambiarEstadoUsuario(id, nuevoEstado)
    });
}

function solicitarEliminacion(id) {
    const usuario      = usuariosLista.find(u => u.id === id);
    const identificador = usuario ? `${usuario.nombre} (${usuario.email})` : _t('este usuario','this user');
    abrirDialogoConfirmacion({
        titulo:     _t('¿Eliminar cuenta de usuario?','Delete user account?'),
        mensaje:    _t(`La cuenta de ${identificador} se eliminará permanentemente.`, `The account of ${identificador} will be permanently deleted.`),
        icono:      'ti-alert-triangle',
        colorFondo: '#fee2e2',
        colorIcono: '#ef4444',
        textoBoton: _t('Confirmar','Confirm'),
        colorBoton: '#ef4444',
        callback:   () => eliminarUsuarioDefinitivo(id)
    });
}

// ── 5. OPERACIONES AJAX ──────────────────────────────────────────────────────
async function cambiarEstadoUsuario(id, nuevoEstado) {
    try {
        const res = await fetch(`${API}/usuarios/${id}/estado`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ activo: nuevoEstado }) });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || _t('No se pudo cambiar el estado','Could not change status')); }
        toast(_t('Estado del usuario actualizado','User status updated'), 'success');
        cargarUsuarios();
    } catch (error) { toast(error.message, 'error'); }
}

async function eliminarUsuarioDefinitivo(id) {
    try {
        const res = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || _t('No se pudo eliminar el usuario','Could not delete user')); }
        const data = await res.json();
        toast(data.mensaje || _t('Usuario eliminado permanentemente','User permanently deleted'), 'success');
        cargarUsuarios();
    } catch (error) { toast(error.message, 'error'); }
}

cargarUsuarios();