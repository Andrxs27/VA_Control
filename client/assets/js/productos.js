const API = 'http://localhost:3000/api';

let productosListados = []; 
let productoEditandoId = null; 

// Variables globales para guardar los estados de los filtros actuales
let filtroTexto = '';
let filtroCategoria = '';

// Variables globales temporales para el modal de confirmación unificado
let idProductoAccion = null;
let tipoAccionProducto = ''; // 'activar', 'desactivar' o 'eliminar'

// ==========================================
// 1. CARGAR Y RENDERIZAR PRODUCTOS
// ==========================================
async function renderProductos(productosAMostrar = null) {
    try {
        if (productosAMostrar === null) {
            const res = await fetch(`${API}/productos`);
            if (!res.ok) throw new Error('No se pudo obtener el catálogo de productos');
            productosListados = await res.json();
            productosAMostrar = productosListados;
        }

        let html = '';
        for (const p of productosAMostrar) {
            const btnEstado = p.activo 
                ? `<button class="btn btn-sm" style="background:#6b7280;color:white" onclick="solicitarCambioEstadoProducto(${p.id}, false)" title="Desactivar">
                    <i class="ti ti-ban"></i>
                   </button>`
                : `<button class="btn btn-sm" style="background:#10b981;color:white" onclick="solicitarCambioEstadoProducto(${p.id}, true)" title="Activar">
                    <i class="ti ti-refresh"></i>
                   </button>`;

            html += `<tr>
                <td><code>${p.sku}</code></td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${p.stock} uds.</td>
                <td>$${Number(p.precio_venta).toFixed(2)}</td>
                <td>
                    <span class="badge ${p.activo ? 'badge-green' : 'badge-gray'}">
                        ${p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${p.id})" title="Editar">
                        <i class="ti ti-edit"></i>
                    </button>
                    ${btnEstado}
                    <button class="btn btn-danger btn-sm" onclick="solicitarEliminacionProducto(${p.id})" title="Eliminar definitivamente">
                        <i class="ti ti-trash"></i>
                    </button>
                </td>
            </tr>`;
        }

        document.getElementById('tb-productos').innerHTML = html ||
            '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">No se encontraron productos con los criterios de búsqueda</td></tr>';
            
    } catch (error) {
        toast(`Error: ${error.message}`, 'error');
    }
}

// ==========================================
// 2. SISTEMA DE FILTRADO DINÁMICO COMBINADO
// ==========================================
function filtrarTabla(idTabla, valor) {
    filtroTexto = valor.toLowerCase().trim();
    aplicarFiltrosCombinados();
}

// ==========================================
// 3. PREPARAR FORMULARIO PARA CREACIÓN
// ==========================================
function filtrarPorCategoria(categoria) {
    filtroCategoria = categoria;
    aplicarFiltrosCombinados();
}

function aplicarFiltrosCombinados() {
    const productosFiltrados = productosListados.filter(p => {
        const coincideTexto = p.nombre.toLowerCase().includes(filtroTexto) || 
                              p.sku.toLowerCase().includes(filtroTexto);
        
        const coincideCategoria = filtroCategoria === '' || p.categoria === filtroCategoria;
        
        return coincideTexto && coincideCategoria;
    });

    renderProductos(productosFiltrados);
}

function prepararCreacion() {
    resetearFormulario();
    if (typeof openModal === 'function') {
        openModal('modal-producto'); 
    } else {
        console.warn("La función openModal() no está definida.");
    }
}

// ==========================================
// 4. PREPARAR FORMULARIO PARA EDICIÓN
// ==========================================
function prepararEdicion(id) {
    const producto = productosListados.find(p => p.id === id);
    
    if (!producto) {
        toast("No se encontró el producto solicitado", "error");
        return;
    }

    productoEditandoId = id; 

    // Bloquear SKU
    const elSku = document.getElementById('p-sku');
    elSku.value = producto.sku || '';
    elSku.disabled = true;
    elSku.style.background = 'var(--bg1)';
    elSku.style.color = 'var(--text3)';
    elSku.style.cursor = 'not-allowed';
    elSku.style.opacity = '0.6';

    document.getElementById('p-categoria').value = producto.categoria || '';
    document.getElementById('p-nombre').value = producto.nombre || '';
    document.getElementById('p-descripcion').value = producto.descripcion || '';
    
    // Bloquear Stock Inicial durante la edición
    const elStock = document.getElementById('p-stock');
    elStock.value = producto.stock || 0;
    elStock.disabled = true;
    elStock.style.background = 'var(--bg1)';
    elStock.style.color = 'var(--text3)';
    elStock.style.cursor = 'not-allowed';
    elStock.style.opacity = '0.6';

    document.getElementById('p-stockmin').value = producto.stock_minimo || 5;
    document.getElementById('p-precio').value = producto.precio_venta || 0;
    
    document.querySelector('#modal-producto h2').innerText = 'Editar Producto';

    if (typeof openModal === 'function') {
        openModal('modal-producto'); 
    } else {
        console.warn("La función openModal() no está definida.");
    }
}

// ==========================================
// 5. GUARDAR / ACTUALIZAR PRODUCTO
// ==========================================
async function guardarProducto() {
    const sku = document.getElementById('p-sku').value.trim();
    const nombre = document.getElementById('p-nombre').value.trim();
    const descripcion = document.getElementById('p-descripcion').value.trim();
    const categorySelect = document.getElementById('p-categoria');
    const categoria = categorySelect ? categorySelect.value : '';
    
    const stock = parseInt(document.getElementById('p-stock').value, 10) || 0;
    const stock_minimo = parseInt(document.getElementById('p-stockmin')?.value, 10) || 0; 
    
    let precioRaw = document.getElementById('p-precio').value.toString().replace(',', '.');
    const precio_venta = parseFloat(precioRaw) || 0;

    if (!sku || !nombre) {
        toast('El SKU y el Nombre del producto son campos requeridos', 'error');
        return;
    }

    const datosProducto = { sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta };

    let url = `${API}/productos`;
    let metodo = 'POST';

    if (productoEditandoId !== null) {
        url = `${API}/productos/${productoEditandoId}`;
        metodo = 'PUT';
    }

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProducto)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Error al procesar el producto');
        }

        toast(
            productoEditandoId !== null ? 'Producto actualizado con éxito' : 'Producto creado correctamente', 
            'success'
        );
        
        resetearFormulario();
        
        if (typeof closeModal === 'function') {
            closeModal('modal-producto');
        }
        
        filtroTexto = '';
        filtroCategoria = '';
        const inputBuscar = document.querySelector('.search-box input');
        const selectCat = document.querySelector('.filter-select');
        if(inputBuscar) inputBuscar.value = '';
        if(selectCat) selectCat.value = '';

        renderProductos();
    } catch (error) {
        toast(error.message, 'error');
    }
}

// ==========================================
// 6. CONTROL DE ESTADO Y ELIMINACIÓN (MODAL PREMIUM)
// ==========================================

function solicitarCambioEstadoProducto(id, nuevoEstado) {
    idProductoAccion = id;
    tipoAccionProducto = nuevoEstado ? 'activar' : 'desactivar';

    const esDesactivar = !nuevoEstado;
    const iconWrapper = document.getElementById('confirm-icon-wrapper');
    const btnProceder = document.getElementById('confirm-btn-proceder');

    document.getElementById('confirm-titulo').innerText = esDesactivar ? '¿Desactivar producto?' : '¿Reactivar producto?';
    document.getElementById('confirm-mensaje').innerText = esDesactivar 
        ? 'El producto dejará de estar visible de forma activa en el catálogo de ventas.' 
        : 'El producto volverá a estar disponible en el catalogo de ventas.';
    
    if (esDesactivar) {
        document.getElementById('confirm-icon').className = 'ti ti-ban';
        iconWrapper.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; 
        iconWrapper.style.color = '#ef4444'; 
        btnProceder.className = 'btn btn-secondary'; 
    } else {
        document.getElementById('confirm-icon').className = 'ti ti-circle-check';
        iconWrapper.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'; 
        iconWrapper.style.color = '#10b981'; 
        btnProceder.className = 'btn btn-success'; 
    }
    
    btnProceder.onclick = ejecutarAccionConfirmadaProducto;
    openModal('modal-confirmacion');
}

function solicitarEliminacionProducto(id) {
    idProductoAccion = id;
    tipoAccionProducto = 'eliminar'; 

    const iconWrapper = document.getElementById('confirm-icon-wrapper');
    const btnProceder = document.getElementById('confirm-btn-proceder');

    document.getElementById('confirm-titulo').innerText = '¿Eliminar producto?';
    document.getElementById('confirm-mensaje').innerText = 'Al confirmar, el producto se eliminará de forma permanente del sistema. Esta acción es irreversible.';
    
    document.getElementById('confirm-icon').className = 'ti ti-alert-triangle';
    iconWrapper.style.backgroundColor = 'rgba(220, 38, 38, 0.15)'; 
    iconWrapper.style.color = 'var(--red)'; 
    btnProceder.className = 'btn btn-danger'; 
    
    btnProceder.onclick = ejecutarAccionConfirmadaProducto;
    openModal('modal-confirmacion');
}

async function ejecutarAccionConfirmadaProducto() {
    if (idProductoAccion === null || !tipoAccionProducto) return;

    try {
        if (tipoAccionProducto === 'eliminar') {
            const res = await fetch(`${API}/productos/${idProductoAccion}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'No se pudo eliminar el producto');
            }
            const data = await res.json();
            toast(data.mensaje || 'Producto eliminado correctamente', 'success');
        } else {
            const nuevoEstado = (tipoAccionProducto === 'activar');
            const res = await fetch(`${API}/productos/${idProductoAccion}/estado`, { 
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: nuevoEstado })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'No se pudo cambiar el estado del producto');
            }
            toast(`Producto ${nuevoEstado ? 'activado' : 'desactivado'} con éxito`, 'success');
        }
    } catch (error) {
        toast(error.message, 'error');
    } finally {
        closeModal('modal-confirmacion');
        idProductoAccion = null;
        tipoAccionProducto = '';
        renderProductos();
    }
}

// ==========================================
// 7. LIMPIEZA Y UTILS
// ==========================================
function resetearFormulario() {
    productoEditandoId = null;
    document.querySelector('#modal-producto h2').innerText = 'Nuevo Producto';
    
    // Rehabilitar SKU
    const elSku = document.getElementById('p-sku');
    elSku.value = '';
    elSku.disabled = false;
    elSku.style.background = '';
    elSku.style.color = '';
    elSku.style.cursor = '';
    elSku.style.opacity = '';
    
    // Asegurar que la categoría siempre comience activa y por defecto
    document.getElementById('p-categoria').value = 'electronicos';
    document.getElementById('p-categoria').disabled = false;

    document.getElementById('p-nombre').value = '';
    document.getElementById('p-descripcion').value = '';
    
    // Rehabilitar Stock Inicial
    const elStock = document.getElementById('p-stock');
    elStock.value = '';
    elStock.disabled = false;
    elStock.style.background = '';
    elStock.style.color = '';
    elStock.style.cursor = '';
    elStock.style.opacity = '';

    const stockMin = document.getElementById('p-stockmin');
    if (stockMin) stockMin.value = '';
    document.getElementById('p-precio').value = '';
}

function toast(msg, type='info') {
    const c = document.getElementById('toasts');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = {success:'ti-circle-check', error:'ti-circle-x', info:'ti-info-circle', warning:'ti-alert-triangle'};
    t.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}"></i>${msg}`;
    c.appendChild(t);
    setTimeout(()=>t.remove(), 3500);
}

// Inicialización
renderProductos();