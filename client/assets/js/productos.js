const API = "https://vacontrol-production.up.railway.app/api";
let productosListados    = [];
let productoEditandoId   = null;
let filtroTexto          = '';
let filtroCategoria      = '';
let idProductoAccion     = null;
let tipoAccionProducto   = '';

function _en()        { return localStorage.getItem('va_idioma') === 'en'; }
function _t(es, en)   { return _en() ? en : es; }

// ── DICCIONARIOS PARA TRADUCCIONES ───────────────────────────────────────────
const traduccionesNombres = {
    "Cambio de pantalla": "Screen replacement",
    "Pantalla iPhone 13": "iPhone 13 Screen",
    "Samsung Galaxy S24": "Samsung Galaxy S24",
    "iPhone 15 Pro": "iPhone 15 Pro",
    "MacBook Air M2": "MacBook Air M2"
};

const traduccionesCategorias = {
    "servicios": "Services",
    "repuestos": "Spare Parts",
    "electronicos": "Electronics"
};

// ── 1. CARGAR Y RENDERIZAR ───────────────────────────────────────────────────
async function renderProductos(productosAMostrar = null) {
    try {
        if (productosAMostrar === null) {
            const res = await fetch(`${API}/productos`);
            if (!res.ok) throw new Error(_t('No se pudo obtener el catálogo','Could not fetch product catalog'));
            productosListados    = await res.json();
            productosAMostrar    = productosListados;
        }

        const lblDesact  = _t('Desactivar','Deactivate');
        const lblActivar = _t('Activar','Activate');
        const lblEditar  = _t('Editar','Edit');
        const lblElim    = _t('Eliminar','Delete');
        const activo     = _t('Activo','Active');
        const inactivo   = _t('Inactivo','Inactive');
        const unidad     = _t('uds.','units');

        let html = '';
        for (const p of productosAMostrar) {
            const btnEstado = p.activo
                ? `<button class="btn btn-sm" style="background:#6b7280;color:white" onclick="solicitarCambioEstadoProducto(${p.id},false)" title="${lblDesact}"><i class="ti ti-ban"></i></button>`
                : `<button class="btn btn-sm" style="background:#10b981;color:white" onclick="solicitarCambioEstadoProducto(${p.id},true)"  title="${lblActivar}"><i class="ti ti-refresh"></i></button>`;

            const nombreMostrar = _en() ? (traduccionesNombres[p.nombre] || p.nombre) : p.nombre;
            const categoriaMostrar = _en() ? (traduccionesCategorias[p.categoria] || p.categoria) : p.categoria;

            html += `<tr>
                <td><code>${p.sku}</code></td>
                <td>${nombreMostrar}</td>
                <td>${categoriaMostrar}</td>
                <td>${p.stock} ${unidad}</td>
                <td>$${Number(p.precio_venta).toFixed(2)}</td>
                <td><span class="badge ${p.activo ? 'badge-green' : 'badge-gray'}">${p.activo ? activo : inactivo}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${p.id})" title="${lblEditar}"><i class="ti ti-edit"></i></button>
                    ${btnEstado}
                    <button class="btn btn-danger btn-sm" onclick="solicitarEliminacionProducto(${p.id})" title="${lblElim}"><i class="ti ti-trash"></i></button>
                </td>
            </tr>`;
        }

        const noData = _t('No se encontraron productos con los criterios de búsqueda','No products found matching the search criteria');
        document.getElementById('tb-productos').innerHTML =
            html || `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">${noData}</td></tr>`;

    } catch (error) {
        toast(`Error: ${error.message}`, 'error');
    }
}

// ── 2. FILTROS ───────────────────────────────────────────────────────────────
function filtrarTabla(idTabla, valor) {
    filtroTexto = valor.toLowerCase().trim();
    aplicarFiltrosCombinados();
}

function filtrarPorCategoria(categoria) {
    filtroCategoria = categoria;
    aplicarFiltrosCombinados();
}

function aplicarFiltrosCombinados() {
    renderProductos(productosListados.filter(p =>
        (p.nombre.toLowerCase().includes(filtroTexto) || p.sku.toLowerCase().includes(filtroTexto)) &&
        (filtroCategoria === '' || p.categoria === filtroCategoria)
    ));
}

// ── 3. FORMULARIO CREAR ──────────────────────────────────────────────────────
function prepararCreacion() {
    resetearFormulario();
    if (typeof openModal === 'function') openModal('modal-producto');
}

// ── 4. FORMULARIO EDITAR ─────────────────────────────────────────────────────
function prepararEdicion(id) {
    const producto = productosListados.find(p => p.id === id);
    if (!producto) { toast(_t('No se encontró el producto','Product not found'), 'error'); return; }

    productoEditandoId = id;

    const bloquear = (eid, val) => {
        const el = document.getElementById(eid);
        if (!el) return;
        el.value = val; el.disabled = true;
        el.style.background = 'var(--bg1)'; el.style.color = 'var(--text3)';
        el.style.cursor = 'not-allowed';     el.style.opacity = '0.6';
    };

    // Sanitización preventiva: Si el registro remoto tiene valores corruptos < 1, los forzamos visualmente a 1
    const stockVisual = (producto.stock && producto.stock >= 1) ? producto.stock : 1;
    const stockMinVisual = (producto.stock_minimo && producto.stock_minimo >= 1) ? producto.stock_minimo : 1;

    bloquear('p-sku',   producto.sku   || '');
    bloquear('p-stock', stockVisual);

    document.getElementById('p-categoria').value   = producto.categoria     || '';
    document.getElementById('p-nombre').value       = producto.nombre        || '';
    document.getElementById('p-descripcion').value  = producto.descripcion   || '';
    document.getElementById('p-stockmin').value     = stockMinVisual;
    document.getElementById('p-precio').value       = producto.precio_venta  || 0;

    document.querySelector('#modal-producto h2').innerText = _t('Editar Producto','Edit Product');
    if (typeof openModal === 'function') openModal('modal-producto');
}

// ── 5. GUARDAR CON VALIDACIÓN TOTAL ──────────────────────────────────────────
async function guardarProducto() {
    const sku          = document.getElementById('p-sku').value.trim();
    const nombre       = document.getElementById('p-nombre').value.trim();
    const descripcion  = document.getElementById('p-descripcion').value.trim();
    const categoria    = document.getElementById('p-categoria')?.value || '';
    const precio_venta = parseFloat((document.getElementById('p-precio').value || '0').toString().replace(',','.')) || 0;

    if (!sku || !nombre) {
        toast(_t('El SKU y el Nombre son campos requeridos','SKU and Name are required fields'), 'error');
        return;
    }

    const stockInput = document.getElementById('p-stock');
    const stockMinInput = document.getElementById('p-stockmin');

    if (!stockInput || !stockMinInput) {
        toast('Error de estructura: No se encontraron los inputs de stock.', 'error');
        return;
    }

    const stock = parseInt(stockInput.value, 10);
    const stock_minimo = parseInt(stockMinInput.value, 10);

    if (isNaN(stock) || stock < 1) {
        toast(_t('El stock inicial debe ser mayor o igual a 1', 'Initial stock must be greater than or equal to 1'), 'error');
        stockInput.focus();
        return;
    }

    if (isNaN(stock_minimo) || stock_minimo < 1) {
        toast(_t('El stock mínimo debe ser mayor o igual a 1', 'Minimum stock must be greater than or equal to 1'), 'error');
        stockMinInput.focus();
        return;
    }
    
    const url    = productoEditandoId !== null ? `${API}/productos/${productoEditandoId}` : `${API}/productos`;
    const metodo = productoEditandoId !== null ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo, 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta })
        });
        
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || _t('Error al procesar el producto','Error processing product'));
        }
        
        toast(productoEditandoId !== null
            ? _t('Producto actualizado con éxito','Product updated successfully')
            : _t('Producto creado correctamente','Product created successfully'), 'success');

        resetearFormulario();
        if (typeof closeModal === 'function') closeModal('modal-producto');
        
        const inputBuscar = document.querySelector('.search-box input');
        const selectCat   = document.querySelector('.filter-select');
        if (inputBuscar) inputBuscar.value = '';
        if (selectCat)   selectCat.value   = '';
        filtroTexto = ''; filtroCategoria = '';
        
        renderProductos();
    } catch (error) {
        toast(error.message, 'error');
    }
}

// ── 6. CONTROL DE ESTADO Y ELIMINACIÓN ──────────────────────────────────────
function solicitarCambioEstadoProducto(id, nuevoEstado) {
    idProductoAccion     = id;
    tipoAccionProducto   = nuevoEstado ? 'activar' : 'desactivar';
    const esDesactivar   = !nuevoEstado;
    const iconWrapper    = document.getElementById('confirm-icon-wrapper');
    const btnProceder    = document.getElementById('confirm-btn-proceder');

    document.getElementById('confirm-titulo').innerText  = esDesactivar
        ? _t('¿Desactivar producto?','Deactivate product?')
        : _t('¿Reactivar producto?','Reactivate product?');
    document.getElementById('confirm-mensaje').innerText = esDesactivar
        ? _t('El producto dejará de estar visible en el catálogo.','The product will no longer be visible in the catalog.')
        : _t('El producto volverá a estar disponible en el catálogo.','The product will be available in the catalog again.');

    document.getElementById('confirm-icon').className  = esDesactivar ? 'ti ti-ban' : 'ti ti-circle-check';
    if(iconWrapper) {
        iconWrapper.style.backgroundColor = esDesactivar ? 'rgba(239,68,68,0.1)'  : 'rgba(16,185,129,0.1)';
        iconWrapper.style.color           = esDesactivar ? '#ef4444'               : '#10b981';
    }
    if(btnProceder) {
        btnProceder.className             = esDesactivar ? 'btn btn-secondary'     : 'btn btn-success';
        btnProceder.onclick               = ejecutarAccionConfirmadaProducto;
    }
    openModal('modal-confirmacion');
}

function solicitarEliminacionProducto(id) {
    idProductoAccion   = id;
    tipoAccionProducto = 'eliminar';
    const iconWrapper  = document.getElementById('confirm-icon-wrapper');
    const btnProceder  = document.getElementById('confirm-btn-proceder');

    document.getElementById('confirm-titulo').innerText  = _t('¿Eliminar producto?','Delete product?');
    document.getElementById('confirm-mensaje').innerText = _t(
        'Al confirmar, el producto se eliminará permanentemente. Esta acción es irreversible.',
        'Upon confirming, the product will be permanently deleted. This action is irreversible.'
    );
    document.getElementById('confirm-icon').className  = 'ti ti-alert-triangle';
    if(iconWrapper) {
        iconWrapper.style.backgroundColor = 'rgba(220,38,38,0.15)';
        iconWrapper.style.color           = 'var(--red)';
    }
    if(btnProceder) {
        btnProceder.className             = 'btn btn-danger';
        btnProceder.onclick               = ejecutarAccionConfirmadaProducto;
    }
    openModal('modal-confirmacion');
}

async function ejecutarAccionConfirmadaProducto() {
    if (idProductoAccion === null || !tipoAccionProducto) return;
    try {
        if (tipoAccionProducto === 'eliminar') {
            const res = await fetch(`${API}/productos/${idProductoAccion}`, { method: 'DELETE' });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || _t('No se pudo eliminar','Could not delete')); }
            const data = await res.json();
            toast(data.mensaje || _t('Producto eliminado correctamente','Product deleted successfully'), 'success');
        } else {
            const nuevoEstado = (tipoAccionProducto === 'activar');
            const res = await fetch(`${API}/productos/${idProductoAccion}/estado`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: nuevoEstado })
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || _t('No se pudo cambiar el estado','Could not change status')); }
            toast(nuevoEstado
                ? _t('Producto activado con éxito','Product updated successfully')
                : _t('Producto desactivado con éxito','Product deactivated successfully'), 'success');
        }
    } catch (error) {
        toast(error.message, 'error');
    } finally {
        closeModal('modal-confirmacion');
        idProductoAccion = null; tipoAccionProducto = '';
        renderProductos();
    }
}

// ── 7. RESET Y UTILS ─────────────────────────────────────────────────────────
function resetearFormulario() {
    productoEditandoId = null;
    document.querySelector('#modal-producto h2').innerText = _t('Nuevo Producto','New Product');

    const desbloq = (id, val = '') => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = val; el.disabled = false;
        el.style.background = el.style.color = el.style.cursor = el.style.opacity = '';
    };
    desbloq('p-sku');
    desbloq('p-stock', 1); // Forzado por defecto a 1
    
    document.getElementById('p-categoria').value  = 'electronicos';
    document.getElementById('p-categoria').disabled = false;
    document.getElementById('p-nombre').value     = '';
    document.getElementById('p-descripcion').value = '';
    
    const stockMin = document.getElementById('p-stockmin');
    if (stockMin) stockMin.value = 1; // Forzado por defecto a 1
    
    document.getElementById('p-precio').value = '';
}

function toast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success:'ti-circle-check', error:'ti-circle-x', info:'ti-info-circle', warning:'ti-alert-triangle' };
    el.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}"></i>${msg}`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

renderProductos();