const API = 'http://localhost:3000/api';

let productosListados = []; 
let productoEditandoId = null; 

// Variables globales para guardar los estados de los filtros actuales
let filtroTexto = '';
let filtroCategoria = '';

// ==========================================
// 1. CARGAR Y RENDERIZAR PRODUCTOS
// ==========================================
// Modificado: Ahora acepta un array opcional para soportar los filtros dinámicos
async function renderProductos(productosAMostrar = null) {
    try {
        // Solo hacemos el fetch si no nos pasaron una lista ya filtrada
        if (productosAMostrar === null) {
            const res = await fetch(`${API}/productos`);
            if (!res.ok) throw new Error('No se pudo obtener el catálogo de productos');
            productosListados = await res.json();
            productosAMostrar = productosListados;
        }

        let html = '';
        for (const p of productosAMostrar) {
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
                    <button class="btn btn-danger btn-sm" onclick="desactivarProducto(${p.id})" title="Desactivar">
                        <i class="ti ti-trash"></i>
                    </button>
                </td>
            </tr>`;
        }

        document.getElementById('tb-productos').innerHTML = html ||
            '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">No se encontraron productos con los criterios de búsqueda</td></tr>';
            
    } catch (error) {
        mostrarToast(`Error: ${error.message}`, 'error');
    }
}

// ==========================================
// 2. SISTEMA DE FILTRADO DINÁMICO (NUEVO)
// ==========================================

// Maneja la barra de búsqueda (Input de texto)
function filtrarTabla(idTabla, valor) {
    filtroTexto = valor.toLowerCase().trim();
    aplicarFiltrosCombinados();
}

// Maneja el selector de categorías (Select drop-down)
function filtrarPorCategoria(categoria) {
    filtroCategoria = categoria;
    aplicarFiltrosCombinados();
}

// Junta ambos filtros para que puedas buscar un término dentro de una categoría específica
function aplicarFiltrosCombinados() {
    const productosFiltrados = productosListados.filter(p => {
        // Evaluar filtro de texto (SKU o Nombre)
        const coincideTexto = p.nombre.toLowerCase().includes(filtroTexto) || 
                              p.sku.toLowerCase().includes(filtroTexto);
        
        // Evaluar filtro de categoría
        const coincideCategoria = filtroCategoria === '' || p.categoria === filtroCategoria;
        
        return coincideTexto && coincideCategoria;
    });

    // Renderizamos pasando la lista filtrada sin volver a consultar la base de datos
    renderProductos(productosFiltrados);
}

// ==========================================
// 3. PREPARAR FORMULARIO PARA CREACIÓN
// ==========================================
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
        mostrarToast("No se encontró el producto solicitado", "error");
        return;
    }

    productoEditandoId = id; 

    document.getElementById('p-sku').value = producto.sku || '';
    document.getElementById('p-nombre').value = producto.nombre || '';
    document.getElementById('p-descripcion').value = producto.descripcion || '';
    document.getElementById('p-categoria').value = producto.categoria || '';
    document.getElementById('p-stock').value = producto.stock || 0;
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
        mostrarToast('El SKU y el Nombre del producto son campos requeridos', 'error');
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

        mostrarToast(
            productoEditandoId !== null ? 'Producto actualizado con éxito' : 'Producto creado correctamente', 
            'success'
        );
        
        resetearFormulario();
        
        if (typeof closeModal === 'function') {
            closeModal('modal-producto');
        }
        
        // Al guardar volvemos a renderizar y limpiar filtros visuales
        filtroTexto = '';
        filtroCategoria = '';
        const inputBuscar = document.querySelector('.search-box input');
        const selectCat = document.querySelector('.filter-select');
        if(inputBuscar) inputBuscar.value = '';
        if(selectCat) selectCat.value = '';

        renderProductos();
    } catch (error) {
        mostrarToast(error.message, 'error');
    }
}

// ==========================================
// 6. ELIMINAR / DESACTIVAR PRODUCTO
// ==========================================
async function desactivarProducto(id) {
    if (confirm('¿Estás seguro de desactivar este producto del catálogo?')) {
        try {
            const res = await fetch(`${API}/productos/${id}`, { method: 'DELETE' });
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'No se pudo desactivar el producto');
            }

            const data = await res.json();
            mostrarToast(data.mensaje || 'Producto desactivado', 'success');
            renderProductos();
        } catch (error) {
            mostrarToast(error.message, 'error');
        }
    }
}

// ==========================================
// 7. LIMPIEZA Y UTILS
// ==========================================
function resetearFormulario() {
    productoEditandoId = null;
    document.querySelector('#modal-producto h2').innerText = 'Nuevo Producto';
    document.getElementById('p-sku').value = '';
    document.getElementById('p-nombre').value = '';
    document.getElementById('p-descripcion').value = '';
    document.getElementById('p-categoria').value = 'electronicos';
    document.getElementById('p-stock').value = '';
    const stockMin = document.getElementById('p-stockmin');
    if (stockMin) stockMin.value = '';
    document.getElementById('p-precio').value = '';
}

function mostrarToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toasts');
    if (!container) return; 
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        margin: 8px 0;
        padding: 12px 20px;
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
        background: ${tipo === 'success' ? '#10b981' : '#ef4444'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: opacity 0.3s, transform 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    const icono = tipo === 'success' ? '<i class="ti ti-circle-check"></i>' : '<i class="ti ti-circle-x"></i>';
    toast.innerHTML = `${icono} <span>${mensaje}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300); 
    }, 3500);
}

// Inicialización
renderProductos();