const API = "https://vacontrol-production.up.railway.app/api";
let ventasData    = [];
let usuariosData  = [];
let clientesData  = [];
let productosData = [];
let carritoItems  = [];

function _en()      { return localStorage.getItem('va_idioma') === 'en'; }
function _t(es, en) { return _en() ? en : es; }
function _locale()  { return _en() ? 'en-US' : 'es-CO'; }

document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    configurarEventos();
});

async function inicializarApp() {
    await Promise.all([cargarSelectores(), obtenerVentas()]);
}

function configurarEventos() {
    const btnAgregar = document.getElementById('btn-agregar-item');
    if (btnAgregar) btnAgregar.addEventListener('click', agregarProductoAlCarrito);
}

// ── 1. SELECTORES ─────────────────────────────────────────────────────────────
async function cargarSelectores() {
    try {
        const [resUsuarios, resClientes, resProductos] = await Promise.all([
            fetch(`${API}/usuarios`).then(r => r.ok ? r.json() : []),
            fetch(`${API}/clientes`).then(r => r.ok ? r.json() : []),
            fetch(`${API}/productos`).then(r => r.ok ? r.json() : [])
        ]);
        usuariosData  = resUsuarios;
        clientesData  = resClientes;
        productosData = resProductos;

        const selVendedor = document.getElementById('v-vendedor');
        if (selVendedor) {
            selVendedor.innerHTML = `<option value="">${_t('Seleccione un Vendedor...','Select a Seller...')}</option>`;
            usuariosData.filter(u => u.activo).forEach(u => selVendedor.add(new Option(u.nombre, u.id)));
        }

        const selCliente = document.getElementById('v-cliente');
        if (selCliente) {
            selCliente.innerHTML = `<option value="">${_t('Seleccione un Cliente...','Select a Client...')}</option>`;
            clientesData.filter(c => c.activo).forEach(c =>
                selCliente.add(new Option(`${c.identificacion || ''} — ${c.nombre}`, c.id))
            );
        }

        const selProducto = document.getElementById('v-producto-selector');
        if (selProducto) {
            const stockTxt = _t('Stock','Stock');
            selProducto.innerHTML = `<option value="">${_t('Seleccionar producto...','Select product...')}</option>`;
            productosData.forEach(p => {
                const opt = new Option(
                    `${p.nombre} (${stockTxt}: ${p.stock ?? 0}) — $${parseFloat(p.precio).toFixed(2)}`, p.id
                );
                if ((p.stock ?? 0) <= 0) opt.disabled = true;
                selProducto.add(opt);
            });
        }
    } catch (error) {
        console.error('Error cargando catálogos:', error);
        mostrarToast(_t('Error al inicializar los selectores','Error initializing selectors'), 'error');
    }
}

// ── 2. CARRITO ────────────────────────────────────────────────────────────────
function agregarProductoAlCarrito() {
    const selector    = document.getElementById('v-producto-selector');
    const cantInput   = document.getElementById('v-producto-cantidad');
    if (!selector || !cantInput) return;

    const productoId = parseInt(selector.value);
    const cantidad   = parseInt(cantInput.value);
    if (!productoId || isNaN(cantidad) || cantidad <= 0) {
        mostrarToast(_t('Seleccione un producto y una cantidad válida','Select a product and a valid quantity'), 'error');
        return;
    }
    const producto = productosData.find(p => p.id === productoId);
    if (!producto) return;
    if ((producto.stock ?? 0) < cantidad) {
        mostrarToast(_t(`Stock insuficiente. Disponible: ${producto.stock ?? 0}`, `Insufficient stock. Available: ${producto.stock ?? 0}`), 'error');
        return;
    }
    const itemExistente = carritoItems.find(i => i.producto_id === productoId);
    if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        if ((producto.stock ?? 0) < nuevaCantidad) {
            mostrarToast(_t(`La suma excede el stock disponible (${producto.stock ?? 0})`, `Sum exceeds available stock (${producto.stock ?? 0})`), 'error');
            return;
        }
        itemExistente.cantidad = nuevaCantidad;
        itemExistente.total    = itemExistente.cantidad * itemExistente.precio_unitario;
    } else {
        carritoItems.push({
            producto_id: producto.id, nombre: producto.nombre,
            cantidad, precio_unitario: parseFloat(producto.precio),
            total: cantidad * parseFloat(producto.precio)
        });
    }
    cantInput.value = '1'; selector.value = '';
    renderizarCarrito();
}

function eliminarItemCarrito(index) { carritoItems.splice(index, 1); renderizarCarrito(); }

function renderizarCarrito() {
    const tbody   = document.getElementById('tb-detalle-venta');
    const trVacio = document.getElementById('tr-carrito-vacio');
    if (!tbody) return;
    Array.from(tbody.querySelectorAll('tr:not(#tr-carrito-vacio)')).forEach(r => r.remove());
    if (carritoItems.length === 0) {
        if (trVacio) trVacio.style.display = '';
        actualizarTotales(0, 0, 0); return;
    }
    if (trVacio) trVacio.style.display = 'none';
    let subtotal = 0;
    carritoItems.forEach((item, index) => {
        subtotal += item.total;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td class="text-center">${item.cantidad}</td>
            <td class="text-right">$${item.precio_unitario.toFixed(2)}</td>
            <td class="text-right"><strong>$${item.total.toFixed(2)}</strong></td>
            <td class="text-center">
                <button type="button" class="btn btn-danger btn-sm" onclick="eliminarItemCarrito(${index})">
                    <i class="ti ti-minus"></i>
                </button>
            </td>`;
        tbody.appendChild(tr);
    });
    const impuestos = subtotal * 0.19;
    actualizarTotales(subtotal, impuestos, subtotal + impuestos);
}

function actualizarTotales(subtotal, impuestos, total) {
    const s = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = `$${val.toFixed(2)}`; };
    s('lbl-subtotal', subtotal); s('lbl-impuestos', impuestos); s('lbl-total', total);
}

// ── 3. OBTENER Y RENDERIZAR VENTAS ────────────────────────────────────────────
async function obtenerVentas() {
    try {
        const response = await fetch(`${API}/ventas`);
        if (!response.ok) throw new Error(_t('Error al consultar ventas','Error fetching sales'));
        ventasData = await response.json();
        renderizarTablaVentas(ventasData);
    } catch (error) { mostrarToast(error.message, 'error'); }
}

function renderizarTablaVentas(ventas) {
    const tbody = document.getElementById('tb-ventas');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (ventas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text3)">${_t('No hay ventas registradas','No registered sales')}</td></tr>`;
        return;
    }
    const estadoBadge = { completada:'badge-green', borrador:'badge-blue', anulada:'badge-red' };
    ventas.forEach(v => {
        const vendedorNombre = v.vendedor_nombre || `ID: ${v.vendedor_id}`;
        const clienteNombre  = v.cliente_nombre  || `ID: ${v.cliente_id}`;
        const badgeClass     = estadoBadge[v.estado] || 'badge-blue';
        const fecha          = v.creado_en ? new Date(v.creado_en).toLocaleDateString(_locale()) : 'N/A';
        const lblVer         = _t('Ver detalle','View detail');
        const lblElim        = _t('Eliminar venta','Delete sale');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${v.id}</strong></td>
            <td>${vendedorNombre}</td>
            <td>${clienteNombre}</td>
            <td><strong class="text-success">$${parseFloat(v.total).toFixed(2)}</strong></td>
            <td><span class="badge badge-blue">${v.metodo_pago.toUpperCase()}</span></td>
            <td><span class="badge ${badgeClass}">${v.estado}</span></td>
            <td>${fecha}</td>
            <td style="display:flex;gap:6px;">
                <button class="btn btn-secondary btn-sm" onclick="verDetalleVenta(${v.id})" title="${lblVer}"><i class="ti ti-eye"></i></button>
                <button class="btn btn-danger btn-sm" onclick="solicitarEliminacionVenta(${v.id})" title="${lblElim}"><i class="ti ti-trash"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
}

// ── 4. DETALLE VENTA ──────────────────────────────────────────────────────────
async function verDetalleVenta(id) {
    try {
        const [resVenta, resDetalles] = await Promise.all([
            fetch(`${API}/ventas/${id}`).then(r => r.json()),
            fetch(`${API}/ventas/${id}/detalles`).then(r => r.json())
        ]);
        document.getElementById('detalle-venta-id').innerText = `#${resVenta.id}`;
        document.getElementById('det-vendedor').innerText     = resVenta.vendedor_nombre || `ID: ${resVenta.vendedor_id}`;
        document.getElementById('det-cliente').innerText      = resVenta.cliente_nombre  || `ID: ${resVenta.cliente_id}`;
        document.getElementById('det-fecha').innerText        = resVenta.creado_en ? new Date(resVenta.creado_en).toLocaleDateString(_locale()) : 'N/A';
        document.getElementById('det-metodo').innerText       = resVenta.metodo_pago?.toUpperCase() || '—';
        document.getElementById('det-estado').innerText       = resVenta.estado || '—';
        document.getElementById('det-total').innerText        = `$${parseFloat(resVenta.total).toFixed(2)}`;
        document.getElementById('det-lbl-subtotal').innerText  = `$${parseFloat(resVenta.subtotal).toFixed(2)}`;
        document.getElementById('det-lbl-descuento').innerText = `$${parseFloat(resVenta.descuento||0).toFixed(2)}`;
        document.getElementById('det-lbl-impuestos').innerText = `$${parseFloat(resVenta.impuestos).toFixed(2)}`;
        document.getElementById('det-lbl-total').innerText     = `$${parseFloat(resVenta.total).toFixed(2)}`;

        const tbodyItems = document.getElementById('tb-detalle-items');
        tbodyItems.innerHTML = '';
        if (resDetalles.length === 0) {
            tbodyItems.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text3)">${_t('Sin líneas de detalle registradas','No detail lines registered')}</td></tr>`;
        } else {
            resDetalles.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.producto_nombre || `ID: ${item.producto_id}`}</td>
                    <td class="text-center">${item.cantidad}</td>
                    <td class="text-right">$${parseFloat(item.precio_unitario).toFixed(2)}</td>
                    <td class="text-right">$${parseFloat(item.descuento_item||0).toFixed(2)}</td>
                    <td class="text-right"><strong>$${parseFloat(item.subtotal).toFixed(2)}</strong></td>`;
                tbodyItems.appendChild(tr);
            });
        }
        openModal('modal-detalle-venta');
    } catch (error) { mostrarToast(_t('No se pudo cargar el detalle de la venta','Could not load sale details'), 'error'); }
}

// ── 5. GUARDAR VENTA ──────────────────────────────────────────────────────────
async function guardarVenta() {
    const vendedorId = document.getElementById('v-vendedor').value;
    const clienteId  = document.getElementById('v-cliente').value;
    const metodoPago = document.getElementById('v-metodo').value;
    const btnGuardar = document.getElementById('btn-registrar-venta');

    if (!vendedorId || !clienteId) { mostrarToast(_t('Seleccione un vendedor y un cliente','Select a seller and a client'), 'error'); return; }
    if (carritoItems.length === 0) { mostrarToast(_t('Agregue al menos un producto a la venta','Add at least one product to the sale'), 'error'); return; }

    const subtotal  = carritoItems.reduce((acc, i) => acc + i.total, 0);
    const impuestos = subtotal * 0.19;
    const total     = subtotal + impuestos;
    const payload   = {
        vendedor_id: parseInt(vendedorId), cliente_id: parseInt(clienteId),
        subtotal, descuento: 0, impuestos, total, metodo_pago: metodoPago,
        estado: 'completada',
        notas: _t('Emitido desde terminal POS Web','Issued from Web POS terminal'),
        detalles: carritoItems.map(i => ({
            producto_id: i.producto_id, cantidad: i.cantidad,
            precio_unitario: i.precio_unitario, descuento_item: 0
        }))
    };
    try {
        if (btnGuardar) btnGuardar.disabled = true;
        const response = await fetch(`${API}/ventas`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || _t('Error al registrar la venta','Error registering sale')); }
        mostrarToast(_t('Venta registrada con éxito','Sale registered successfully'), 'success');
        closeModal('modal-venta');
        resetFormularioVenta();
        await Promise.all([obtenerVentas(), cargarSelectores()]);
    } catch (error) { mostrarToast(error.message, 'error'); }
    finally { if (btnGuardar) btnGuardar.disabled = false; }
}

// ── 6. ELIMINAR VENTA ─────────────────────────────────────────────────────────
function solicitarEliminacionVenta(id) {
    abrirDialogoConfirmacion({
        titulo:     _t('¿Eliminar esta venta?','Delete this sale?'),
        mensaje:    _t(`La venta #${id} se eliminará definitivamente y el stock será restaurado.`, `Sale #${id} will be permanently deleted and stock will be restored.`),
        icono:      'ti-alert-triangle',
        colorFondo: '#fee2e2',
        colorIcono: '#ef4444',
        textoBoton: _t('Eliminar Venta','Delete Sale'),
        colorBoton: '#ef4444',
        callback: async () => {
            try {
                const response = await fetch(`${API}/ventas/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error(_t('No se pudo eliminar la venta','Could not delete sale'));
                mostrarToast(_t('Venta eliminada y stock restaurado','Sale deleted and stock restored'), 'success');
                await Promise.all([obtenerVentas(), cargarSelectores()]);
            } catch (error) { mostrarToast(error.message, 'error'); }
        }
    });
}

// ── 7. FILTROS ────────────────────────────────────────────────────────────────
function filtrarTablaVentas(texto) {
    const q = texto.toLowerCase();
    renderizarTablaVentas(ventasData.filter(v =>
        String(v.id).includes(q) ||
        (v.cliente_nombre  || '').toLowerCase().includes(q) ||
        (v.vendedor_nombre || '').toLowerCase().includes(q)
    ));
}

function filtrarVentasPago(metodo) {
    renderizarTablaVentas(metodo ? ventasData.filter(v => v.metodo_pago === metodo) : ventasData);
}

// ── 8. MODAL CONFIRMACIÓN ─────────────────────────────────────────────────────
function abrirDialogoConfirmacion({ titulo, mensaje, icono, colorFondo, colorIcono, textoBoton, colorBoton, callback }) {
    document.getElementById('confirm-titulo').innerText  = titulo;
    document.getElementById('confirm-mensaje').innerText = mensaje;
    const iconContainer = document.getElementById('confirm-icon-container');
    if (iconContainer) { iconContainer.style.backgroundColor = colorFondo; iconContainer.style.color = colorIcono; }
    const iconElem = document.getElementById('confirm-icon');
    if (iconElem) iconElem.className = `ti ${icono}`;
    const btnProceder = document.getElementById('confirm-btn-proceder');
    if (btnProceder) {
        btnProceder.innerText = textoBoton;
        btnProceder.style.backgroundColor = colorBoton;
        btnProceder.onclick = () => { callback(); closeModal('modal-confirmacion'); };
    }
    openModal('modal-confirmacion');
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function openModal(id)  { const m = document.getElementById(id); if (m) { m.classList.add('open'); } }
function closeModal(id) { const m = document.getElementById(id); if (m) { m.classList.remove('open'); } }

function resetFormularioVenta() {
    document.getElementById('v-vendedor').value = '';
    document.getElementById('v-cliente').value  = '';
    document.getElementById('v-metodo').value   = 'efectivo';
    carritoItems = [];
    renderizarCarrito();
}

function mostrarToast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success:'ti-circle-check', error:'ti-circle-x', info:'ti-info-circle' };
    el.innerHTML = `<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;color:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)'}"></i>${msg}`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}