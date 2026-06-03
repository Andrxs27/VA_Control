// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================
const API_URL = '/api/ventas'; // Cambia esta ruta si tu backend usa otra (ej. http://localhost:3000/api/ventas)
let ventas = [];               // Almacén local de las ventas cargadas
let idVentaEditando = null;    // Si tiene un ID, el formulario se procesará como PUT (Editar)

// Inicializar la aplicación cuando el HTML esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarVentas();
    cargarSelects(); // Llena los selectores de vendedor y cliente de forma demostrativa
});

// ==========================================
// 1. READ: OBTENER Y MOSTRAR VENTAS (GET)
// ==========================================

// Obtiene todas las ventas del backend
async function cargarVentas() {
    try {
        const response = await fetch(API_URL); // GET por defecto
        if (!response.ok) throw new Error('No se pudieron obtener las ventas del servidor.');
        
        ventas = await response.json();
        renderizarTabla(ventas);
    } catch (error) {
        mostrarToast(`Error al cargar: ${error.message}`, 'error');
    }
}

// Dibuja las filas dinámicamente en el <tbody> de tu HTML
function renderizarTabla(listaVentas) {
    const tbody = document.getElementById('tb-ventas');
    tbody.innerHTML = '';

    if (listaVentas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hay transacciones registradas</td></tr>`;
        return;
    }

    listaVentas.forEach(venta => {
        // Formatear la fecha que viene de PostgreSQL (creado_en)
        const fechaFormateada = venta.creado_en 
            ? new Date(venta.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            : 'S/F';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${venta.id}</td>
            <td>Vendedor ${venta.vendedor_id || 'N/A'}</td>
            <td>Cliente ${venta.cliente_id || 'N/A'}</td>
            <td><strong>$${parseFloat(venta.total).toFixed(2)}</strong></td>
            <td><span class="badge-pago">${venta.metodo_pago.toUpperCase()}</span></td>
            <td>${fechaFormateada}</td>
            <td>
                <button class="btn-icon" onclick="prepararEdicion(${venta.id})" title="Editar"><i class="ti ti-edit"></i></button>
                <button class="btn-icon text-danger" onclick="eliminarVenta(${venta.id})" title="Eliminar"><i class="ti ti-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 2. CREATE & UPDATE: GUARDAR CAMBIOS (POST / PUT)
// ==========================================

async function guardarVenta() {
    const vendedor_id = document.getElementById('v-vendedor').value;
    const cliente_id = document.getElementById('v-cliente').value;
    const metodo_pago = document.getElementById('v-metodo').value;
    const totalInput = document.getElementById('v-total').value;

    // Validación básica del lado del cliente
    if (!totalInput || parseFloat(totalInput) <= 0) {
        mostrarToast('Por favor, ingresa un monto total válido.', 'error');
        return;
    }

    const totalDecimal = parseFloat(totalInput);

    // Mapeamos los datos para cumplir con todas las columnas que pide tu backend (pool.query)
    const datosVenta = {
        vendedor_id: vendedor_id ? parseInt(vendedor_id) : null,
        cliente_id: cliente_id ? parseInt(cliente_id) : null,
        subtotal: totalDecimal,     // Ajustado por defecto igual al total
        descuento: 0,
        impuestos: 0,
        total: totalDecimal,
        metodo_pago: metodo_pago,
        estado: 'completado',
        notas: 'Registrado desde la interfaz web'
    };

    try {
        let response;
        
        if (idVentaEditando !== null) {
            // Si estamos editando, disparamos un PUT a /api/ventas/:id
            response = await fetch(`${API_URL}/${idVentaEditando}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosVenta)
            });
        } else {
            // Si es una venta nueva, disparamos un POST a /api/ventas
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosVenta)
            });
        }

        if (!response.ok) throw new Error('Error al procesar la solicitud en el servidor.');

        mostrarToast(idVentaEditando ? 'Venta actualizada correctamente' : 'Venta registrada con éxito', 'success');
        closeModal('modal-venta');
        cargarVentas(); // Recarga la tabla de inmediato
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

// ==========================================
// 3. READ (INDIVIDUAL): PREPARAR EDICIÓN (GET por ID)
// ==========================================

async function prepararEdicion(id) {
    try {
        // Pedimos al backend los datos exactos de esa venta mediante GET /api/ventas/:id
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('No se pudo obtener el detalle de la venta.');
        
        const venta = await response.json();
        
        // Seteamos el estado global al ID que estamos manipulando
        idVentaEditando = venta.id;

        // Rellenamos el modal con la información actual
        document.getElementById('v-vendedor').value = venta.vendedor_id || '';
        document.getElementById('v-cliente').value = venta.cliente_id || '';
        document.getElementById('v-metodo').value = venta.metodo_pago;
        document.getElementById('v-total').value = venta.total;

        // Modificamos estéticamente el título del modal para avisar al usuario
        document.querySelector('#modal-venta h2').innerText = 'Editar Venta';
        openModal('modal-venta');
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

// ==========================================
// 4. DELETE: ELIMINAR REGISTRO (DELETE)
// ==========================================

async function eliminarVenta(id) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la venta #${id}? Esta acción no se puede deshacer.`)) return;

    try {
        // Enviamos la petición DELETE a /api/ventas/:id
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('No se pudo eliminar el registro.');

        mostrarToast('Venta eliminada correctamente', 'success');
        cargarVentas(); // Volver a leer la base de datos
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

// ==========================================
// 5. INTERFAZ: MODALES, FILTROS Y TOASTS
// ==========================================

function openModal(idModal) {
    document.getElementById(idModal).classList.add('active');
}

function closeModal(idModal) {
    document.getElementById(idModal).classList.remove('active');
    
    // Al cerrar, limpiamos el formulario para que quede listo para una "Nueva Venta"
    idVentaEditando = null;
    document.querySelector('#modal-venta h2').innerText = 'Nueva Venta';
    document.getElementById('v-vendedor').value = '';
    document.getElementById('v-cliente').value = '';
    document.getElementById('v-metodo').value = 'efectivo';
    document.getElementById('v-total').value = '';
}

// Filtro de búsqueda por texto en tiempo real
function filtrarTabla(idTabla, busqueda) {
    const query = busqueda.toLowerCase();
    const filas = document.querySelectorAll(`#${idTabla} tr`);
    
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(query) ? '' : 'none';
    });
}

// Filtro por selector de Método de Pago
function filtrarVentasPago(metodo) {
    if (!metodo) {
        renderizarTabla(ventas); // Si elige "Todos", muestra el array original completo
    } else {
        const filtradas = ventas.filter(v => v.metodo_pago === metodo);
        renderizarTabla(filtradas);
    }
}

// Alertas visuales dinámicas
function mostrarToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toasts');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.style.margin = '10px 0';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '6px';
    toast.style.background = tipo === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = '#fff';
    toast.style.transition = 'opacity 0.3s ease';
    toast.innerText = mensaje;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Llena con IDs simulados los selectores (reemplázalo por llamadas fetch a tus rutas de Clientes/Vendedores si las tienes)
function cargarSelects() {
    const selVendedor = document.getElementById('v-vendedor');
    const selCliente = document.getElementById('v-cliente');
    
    for (let i = 1; i <= 5; i++) {
        selVendedor.innerHTML += `<option value="${i}">ID Vendedor: ${i}</option>`;
        selCliente.innerHTML += `<option value="${i}">ID Cliente: ${i}</option>`;
    }
}