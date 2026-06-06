const API = 'http://localhost:3000/api';
let usuariosLista = [];
let usuarioEditandoId = null;

// Callback temporal para el modal de confirmación personalizada
let accionConfirmadaCallback = null;

// ==========================================
// 1. CARGAR Y MOSTRAR USUARIOS
// ==========================================
async function cargarUsuarios() {
    try {
        // Limpiar el buscador cada vez que se refrescan los datos globales
        const inputBuscar = document.getElementById('buscar-usuario');
        if (inputBuscar) inputBuscar.value = '';

        const res = await fetch(`${API}/usuarios`);
        if (!res.ok) throw new Error('Error al obtener usuarios');
        usuariosLista = await res.json();
        renderizarTabla(usuariosLista);
    } catch (error) {
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

function renderizarTabla(lista) {
    const tbody = document.getElementById('tb-usuarios');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--color-text-secondary)">No hay usuarios registrados</td></tr>`;
        return;
    }

    lista.forEach(u => {
        // Configurar botón de cambiar estado dinámicamente según el valor actual de u.activo
        const botonEstado = u.activo 
            ? `<button class="btn btn-sm" style="background-color: #6b7280; color: white;" onclick="solicitarCambioEstado(${u.id}, false)" title="Desactivar">
                <i class="ti ti-user-off"></i>
               </button>`
            : `<button class="btn btn-sm" style="background-color: #10b981; color: white;" onclick="solicitarCambioEstado(${u.id}, true)" title="Activar">
                <i class="ti ti-user-check"></i>
               </button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>${rolBadge(u.rol)}</td>
            <td><span class="badge ${u.activo ? 'badge-green' : 'badge-gray'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${u.id})" title="Editar">
                    <i class="ti ti-edit"></i>
                </button>
                ${botonEstado}
                <button class="btn btn-danger btn-sm" onclick="solicitarEliminacion(${u.id})" title="Eliminar Permanentemente">
                    <i class="ti ti-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function rolBadge(rol) {
    const map = {
        admin:    ['badge-red',   'Admin'],
        vendedor: ['badge-blue',  'Vendedor'],
        tecnico:  ['badge-amber', 'Técnico'],
    };
    const [cls, label] = map[rol] || ['badge-gray', rol];
    return `<span class="badge ${cls}">${label}</span>`;
}

// ==========================================
// NUEVA SECCIÓN: FILTRAR EN TIEMPO REAL
// ==========================================
function filtrarUsuarios() {
    const textoBusqueda = document.getElementById('buscar-usuario').value.toLowerCase().trim();

    // Si el buscador está vacío, volvemos a mostrar todo el arreglo original
    if (!textoBusqueda) {
        renderizarTabla(usuariosLista);
        return;
    }

    // Filtrar coincidencias parciales por Nombre, Email o Rol mapeado
    const usuariosFiltrados = usuariosLista.filter(u => {
        const nombre = u.nombre ? u.nombre.toLowerCase() : '';
        const email = u.email ? u.email.toLowerCase() : '';
        const rol = u.rol ? u.rol.toLowerCase() : '';

        return nombre.includes(textoBusqueda) || 
               email.includes(textoBusqueda) || 
               rol.includes(textoBusqueda);
    });

    renderizarTabla(usuariosFiltrados);
}

// ==========================================
// 2. PREPARAR FORMULARIO (CREAR / EDITAR)
// ==========================================

function prepararCreacion() {
    usuarioEditandoId = null;

    document.getElementById('u-nombre').value = '';
    document.getElementById('u-email').value = '';
    document.getElementById('u-rol').value = 'admin';
    document.getElementById('u-password').value = '';

    const passGroup = document.getElementById('u-password').closest('.form-group');
    if (passGroup) passGroup.style.display = 'block';

    document.querySelector('#modal-usuario h2').innerText = 'Nuevo Usuario';
    const btnGuardar = document.querySelector('#modal-usuario .modal-footer .btn-primary');
    if (btnGuardar) btnGuardar.innerHTML = '<i class="ti ti-check"></i> Crear Usuario';

    openModal('modal-usuario');
}

function prepararEdicion(id) {
    const usuario = usuariosLista.find(u => u.id === id);
    if (!usuario) return;

    usuarioEditandoId = id;

    document.getElementById('u-nombre').value   = usuario.nombre;
    document.getElementById('u-email').value    = usuario.email;
    document.getElementById('u-rol').value      = usuario.rol;
    document.getElementById('u-password').value = '';

    const passGroup = document.getElementById('u-password').closest('.form-group');
    if (passGroup) passGroup.style.display = 'none';

    document.querySelector('#modal-usuario h2').innerText = 'Editar Usuario';
    const btnGuardar = document.querySelector('#modal-usuario .modal-footer .btn-primary');
    if (btnGuardar) btnGuardar.innerHTML = '<i class="ti ti-check"></i> Guardar Cambios';

    openModal('modal-usuario');
}

// ==========================================
// 3. PROCESAR GUARDADO (POST / PUT)
// ==========================================
async function guardarUsuario() {
    const nombre   = document.getElementById('u-nombre').value.trim();
    const email    = document.getElementById('u-email').value.trim();
    const rol      = document.getElementById('u-rol').value;
    const password = document.getElementById('u-password').value;

    if (!nombre || !email) {
        mostrarToast('Nombre y email son requeridos', 'error');
        return;
    }

    if (!usuarioEditandoId && !password) {
        mostrarToast('La contraseña es requerida para nuevos usuarios', 'error');
        return;
    }

    try {
        let res;

        if (usuarioEditandoId) {
            res = await fetch(`${API}/usuarios/${usuarioEditandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, rol })
            });
        } else {
            res = await fetch(`${API}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password, rol })
            });
        }

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al guardar usuario');
        }

        mostrarToast(usuarioEditandoId ? 'Usuario actualizado' : 'Usuario creado correctamente', 'success');
        closeModal('modal-usuario');
        cargarUsuarios();
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

// ==========================================
// 4. PASO INTERMEDIO: CONFIRMACIONES BONITAS (CORPORATIVAS)
// ==========================================
function abrirDialogoConfirmacion({ titulo, mensaje, icono, colorFondo, colorIcono, textoBoton, colorBoton, callback }) {
    document.getElementById('confirm-titulo').innerText = titulo;
    document.getElementById('confirm-mensaje').innerText = mensaje;
    
    const iconContainer = document.getElementById('confirm-icon-container');
    iconContainer.style.backgroundColor = colorFondo;
    iconContainer.style.color = colorIcono;
    
    const iconElem = document.getElementById('confirm-icon');
    iconElem.className = `ti ${icono}`;
    
    const btnProceder = document.getElementById('confirm-btn-proceder');
    btnProceder.innerText = textoBoton;
    btnProceder.style.backgroundColor = colorBoton;
    
    // Asignar el callback al botón dinámicamente
    accionConfirmadaCallback = () => {
        callback();
        closeModal('modal-confirmacion');
    };
    
    btnProceder.onclick = accionConfirmadaCallback;
    openModal('modal-confirmacion');
}

function solicitarCambioEstado(id, nuevoEstado) {
    const usuario = usuariosLista.find(u => u.id === id);
    const identificador = usuario ? ` de ${usuario.nombre}` : '';

    abrirDialogoConfirmacion({
        titulo: nuevoEstado ? '¿Activar cuenta de usuario?' : '¿Desactivar cuenta de usuario?',
        mensaje: nuevoEstado 
            ? `El usuario${identificador} recuperará el acceso a las operaciones normales de la plataforma.` 
            : `El usuario${identificador} será inhabilitado de forma temporal y no podrá iniciar sesión en el sistema.`,
        icono: nuevoEstado ? 'ti-user-check' : 'ti-user-off',
        colorFondo: nuevoEstado ? '#e6f4ea' : '#f3f4f6',
        colorIcono: nuevoEstado ? '#10b981' : '#4b5563',
        textoBoton: 'Confirmar',
        colorBoton: nuevoEstado ? '#10b981' : '#6b7280',
        callback: () => cambiarEstadoUsuario(id, nuevoEstado)
    });
}

function solicitarEliminacion(id) {
    const usuario = usuariosLista.find(u => u.id === id);
    const identificador = usuario ? `${usuario.nombre} (${usuario.email})` : 'este usuario';

    abrirDialogoConfirmacion({
        titulo: '¿Eliminar cuenta de usuario?',
        mensaje: `Al confirmar, la cuenta de ${identificador} se eliminará de forma permanente del sistema. Esta acción no se puede revertir.`,
        icono: 'ti-alert-triangle',
        colorFondo: '#fee2e2',
        colorIcono: '#ef4444',
        textoBoton: 'Confirmar',
        colorBoton: '#ef4444',
        callback: () => eliminarUsuarioDefinitivo(id)
    });
}

// ==========================================
// 5. OPERACIONES AJAX DEFINITIVAS
// ==========================================
async function cambiarEstadoUsuario(id, nuevoEstado) {
    try {
        const res = await fetch(`${API}/usuarios/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: nuevoEstado })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'No se pudo cambiar el estado');
        }

        mostrarToast(`Estado del usuario actualizado correctamente`, 'success');
        cargarUsuarios();
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

async function eliminarUsuarioDefinitivo(id) {
    try {
        const res = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'No se pudo eliminar el usuario');
        }
        
        const data = await res.json();
        mostrarToast(data.mensaje || 'Usuario eliminado permanentemente', 'success');
        cargarUsuarios();
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

// ==========================================
// UTILS
// ==========================================
function mostrarToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toasts');
    const toast = document.createElement('div');
    toast.style.cssText = `margin:8px 0;padding:12px 20px;border-radius:8px;color:#fff;font-size:14px;
        background:${tipo === 'success' ? '#10b981' : '#ef4444'};transition:opacity 0.3s`;
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ==========================================
// INICIALIZAR
// ==========================================
cargarUsuarios();