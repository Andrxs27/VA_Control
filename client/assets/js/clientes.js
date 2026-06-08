const API = 'http://localhost:3000/api';
let clientesLista = [];
let clienteEditandoId = null;

// Callback temporal para el modal de confirmación personalizada
let accionConfirmadaCallback = null;

// Funciones globales de modales (en caso de que script.js no las exponga globalmente)
if (typeof openModal !== 'function') {
    window.openModal = function(id) { document.getElementById(id)?.classList.add('active'); };
}
if (typeof closeModal !== 'function') {
    window.closeModal = function(id) { document.getElementById(id)?.classList.remove('active'); };
}

// ==========================================
// 1. CARGAR Y MOSTRAR CLIENTES
// ==========================================
async function cargarClientes() {
    try {
        // Limpiar el buscador cada vez que se refrescan los datos globales
        const inputBuscar = document.getElementById('buscar-cliente');
        if (inputBuscar) inputBuscar.value = '';

        const res = await fetch(`${API}/clientes`);
        if (!res.ok) throw new Error('Error al obtener clientes');
        clientesLista = await res.json();
        renderizarTabla(clientesLista);
    } catch (error) {
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

function renderizarTabla(lista) {
    const tbody = document.getElementById('tb-clientes');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--color-text-secondary)">No hay clientes registrados</td></tr>`;
        return;
    }

    lista.forEach(c => {
        // Configurar botón de cambiar estado dinámicamente según el valor actual de c.activo
        const botonEstado = c.activo 
            ? `<button class="btn btn-sm" style="background-color: #6b7280; color: white;" onclick="solicitarCambioEstado(${c.id}, false)" title="Desactivar">
                <i class="ti ti-user-off"></i>
               </button>`
            : `<button class="btn btn-sm" style="background-color: #10b981; color: white;" onclick="solicitarCambioEstado(${c.id}, true)" title="Activar">
                <i class="ti ti-user-check"></i>
               </button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.id}</td>
            <td><strong>${c.identificacion || 'N/A'}</strong></td>
            <td>${c.nombre}</td>
            <td>${c.email || '—'}</td>
            <td>${c.telefono || '—'}</td>
            <td><span class="badge ${c.activo ? 'badge-green' : 'badge-gray'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${c.id})" title="Editar">
                    <i class="ti ti-edit"></i>
                </button>
                ${botonEstado}
                <button class="btn btn-danger btn-sm" onclick="solicitarEliminacion(${c.id})" title="Eliminar Permanentemente">
                    <i class="ti ti-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 2. FILTRAR EN TIEMPO REAL
// ==========================================
function filtrarClientes() {
    const textoBusqueda = document.getElementById('buscar-cliente').value.toLowerCase().trim();

    // Si el buscador está vacío, volvemos a mostrar todo el arreglo original
    if (!textoBusqueda) {
        renderizarTabla(clientesLista);
        return;
    }

    // Filtrar modificaciones parciales por Identificación, Nombre, Email o Teléfono
    const clientesFiltrados = clientesLista.filter(c => {
        const identificacion = c.identificacion ? c.identificacion.toLowerCase() : '';
        const nombre = c.nombre ? c.nombre.toLowerCase() : '';
        const email = c.email ? c.email.toLowerCase() : '';
        const telefono = c.telefono ? c.telefono.toLowerCase() : '';

        return identificacion.includes(textoBusqueda) || 
               nombre.includes(textoBusqueda) || 
               email.includes(textoBusqueda) || 
               telefono.includes(textoBusqueda);
    });

    renderizarTabla(clientesFiltrados);
}

// ==========================================
// 3. PREPARAR FORMULARIO (CREAR / EDITAR)
// ==========================================
function prepararCreacion() {
    clienteEditandoId = null;

    document.getElementById('c-identificacion').value = '';
    document.getElementById('c-nombre').value = '';
    document.getElementById('c-email').value = '';
    document.getElementById('c-telefono').value = '';
    document.getElementById('c-direccion').value = '';
    document.getElementById('c-tipo').value = 'particular';
    
    // Limpieza del nuevo campo notas
    const txtNotas = document.getElementById('c-notas');
    if (txtNotas) txtNotas.value = '';

    document.getElementById('modal-cliente-titulo').innerText = 'Nuevo Cliente';
    const btnGuardar = document.querySelector('#modal-cliente .modal-footer .btn-primary');
    if (btnGuardar) btnGuardar.innerHTML = '<i class="ti ti-check"></i> Crear Cliente';

    openModal('modal-cliente');
}

function prepararEdicion(id) {
    const cliente = clientesLista.find(c => c.id === id);
    if (!cliente) return;

    clienteEditandoId = id;

    document.getElementById('c-identificacion').value = cliente.identificacion || '';
    document.getElementById('c-nombre').value         = cliente.nombre || '';
    document.getElementById('c-email').value          = cliente.email || '';
    document.getElementById('c-telefono').value       = cliente.telefono || '';
    document.getElementById('c-direccion').value      = cliente.direccion || '';
    document.getElementById('c-tipo').value           = cliente.tipo || 'particular';
    
    // Forzar el uso de .notas para coincidir con el payload que envías al backend
    const txtNotas = document.getElementById('c-notas');
    if (txtNotas) txtNotas.value = cliente.notas || cliente.notes || '';

    document.getElementById('modal-cliente-titulo').innerText = 'Editar Cliente';
    const btnGuardar = document.querySelector('#modal-cliente .modal-footer .btn-primary');
    if (btnGuardar) btnGuardar.innerHTML = '<i class="ti ti-check"></i> Guardar Cambios';

    openModal('modal-cliente');
}

// ==========================================
// 4. PROCESAR GUARDADO (POST / PUT)
// ==========================================
async function guardarCliente() {
    const identificacion = document.getElementById('c-identificacion').value.trim();
    const nombre         = document.getElementById('c-nombre').value.trim();
    const email          = document.getElementById('c-email').value.trim();
    const telefono       = document.getElementById('c-telefono').value.trim();
    const direccion      = document.getElementById('c-direccion').value.trim();
    const tipo           = document.getElementById('c-tipo').value;
    
    // Captura dinámica de las notas del textarea
    const txtNotas       = document.getElementById('c-notas');
    const notas          = txtNotas ? txtNotas.value.trim() : null;

    if (!identificacion || !nombre) {
        mostrarToast('La identificación y el nombre/razón social son requeridos', 'error');
        return;
    }

    // Se normalizan las cadenas vacías opcionales a null para coincidir con la base de datos
    const payload = { 
        identificacion, 
        nombre, 
        email: email || null, 
        telefono: telefono || null, 
        direccion: direccion || null, 
        tipo,
        notas: notas || null 
    };

    try {
        let res;

        if (clienteEditandoId) {
            res = await fetch(`${API}/clientes/${clienteEditandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(`${API}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al guardar cliente');
        }

        mostrarToast(clienteEditandoId ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente', 'success');
        closeModal('modal-cliente');
        cargarClientes();
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

// ==========================================
// 5. DIÁLOGOS DE CONFIRMACIÓN CORPORATIVOS
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
    
    accionConfirmadaCallback = () => {
        callback();
        closeModal('modal-confirmacion');
    };
    
    btnProceder.onclick = accionConfirmadaCallback;
    openModal('modal-confirmacion');
}

// Cambiar estado dinámicamente según el valor actual de c.activo
function solicitarCambioEstado(id, nuevoEstado) {
    const cliente = clientesLista.find(c => c.id === id);
    const identificador = cliente ? ` de ${cliente.nombre}` : '';

    abrirDialogoConfirmacion({
        titulo: nuevoEstado ? '¿Activar cuenta de cliente?' : '¿Desactivar cuenta de cliente?',
        mensaje: nuevoEstado 
            ? `El cliente${identificador} cambiará a estado activo y figurará con normalidad en operaciones del sistema.` 
            : `El cliente${identificador} pasará a estar inactivo en la plataforma temporalmente.`,
        icono: nuevoEstado ? 'ti-user-check' : 'ti-user-off',
        colorFondo: nuevoEstado ? '#e6f4ea' : '#f3f4f6',
        colorIcono: nuevoEstado ? '#10b981' : '#4b5563',
        textoBoton: 'Confirmar',
        colorBoton: nuevoEstado ? '#10b981' : '#6b7280',
        callback: () => cambiarEstadoCliente(id, nuevoEstado)
    });
}

function solicitarEliminacion(id) {
    const cliente = clientesLista.find(c => c.id === id);
    const identificador = cliente ? `${cliente.nombre} (${cliente.identificacion})` : 'este cliente';

    abrirDialogoConfirmacion({
        titulo: '¿Eliminar cuenta de cliente?',
        mensaje: `Al confirmar, el registro de ${identificador} se eliminará de forma permanente. Esta acción no se puede deshacer.`,
        icono: 'ti-alert-triangle',
        colorFondo: '#fee2e2',
        colorIcono: '#ef4444',
        textoBoton: 'Confirmar',
        colorBoton: '#ef4444',
        callback: () => eliminarClienteDefinitivo(id)
    });
}

// ==========================================
// 6. OPERACIONES AJAX DEFINITIVAS
// ==========================================
async function cambiarEstadoCliente(id, nuevoEstado) {
    try {
        const res = await fetch(`${API}/clientes/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: nuevoEstado })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'No se pudo cambiar el estado');
        }

        mostrarToast(`Estado del cliente actualizado correctamente`, 'success');
        cargarClientes();
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

async function eliminarClienteDefinitivo(id) {
    try {
        const res = await fetch(`${API}/clientes/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'No se pudo eliminar el cliente');
        }
        
        const data = await res.json();
        mostrarToast(data.mensaje || 'Cliente eliminado permanentemente', 'success');
        cargarClientes();
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

// ==========================================
// UTILS & TOAST SYSTEM
// ==========================================
function mostrarToast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    if (!c) return; // Validación por si el contenedor no existe en el DOM
    
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    
    const icons = {
        success: 'ti-circle-check',
        error: 'ti-circle-x',
        info: 'ti-info-circle'
    };
    
    t.innerHTML = `<i class="ti ${icons[type] || 'ti-info-circle'}" style="font-size:16px;color:${type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--blue)'}"></i>${msg}`;
    
    c.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// ==========================================
// INICIALIZAR
// ==========================================
cargarClientes();