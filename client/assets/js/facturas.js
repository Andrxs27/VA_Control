const API = 'http://localhost:3000/api';
let facturaEditandoId = null;

function _en()      { return localStorage.getItem('va_idioma') === 'en'; }
function _t(es, en) { return _en() ? en : es; }

// ── FORMATO FECHA ─────────────────────────────────────────────────────────────
function formatFecha(fecha) {
    if (!fecha) return '—';
    return fecha.split('T')[0];
}

function tipoFacturaBadge(ventaId) {
    const label = ventaId ? _t('Venta','Sale') : _t('Servicio','Service');
    const cls   = ventaId ? 'badge-blue' : 'badge-green';
    return `<span class="badge ${cls}">${label}</span>`;
}

// ── 3. RENDERIZAR FACTURAS ────────────────────────────────────────────────────
async function renderFacturas() {
    try {
        const res      = await fetch(`${API}/facturas`);
        const facturas = await res.json();

        const noData  = _t('No hay facturas emitidas','No issued invoices');
        const lblEdit = _t('Editar','Edit');
        const lblElim = _t('Eliminar','Delete');

        let html = '';
        for (const f of facturas) {
            const tipo       = f.venta_id ? _t('venta','sale') : _t('servicio','service');
            const referencia = f.venta_id || f.orden_servicio_id || 'N/A';
            html += `<tr>
                <td style="font-weight:600">#${String(f.id).padStart(4,'0')}</td>
                <td>${tipoFacturaBadge(f.venta_id)}</td>
                <td>ID: ${referencia}</td>
                <td>$${parseFloat(f.subtotal).toFixed(2)}</td>
                <td>$${parseFloat(f.impuestos).toFixed(2)}</td>
                <td style="font-weight:600">$${parseFloat(f.total).toFixed(2)}</td>
                <td>${formatFecha(f.fecha_emision)}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="prepararEditarFactura(${f.id},'${tipo}',${referencia},${f.subtotal},${f.impuestos})" title="${lblEdit}">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarFactura(${f.id})" title="${lblElim}">
                        <i class="ti ti-trash"></i>
                    </button>
                </td>
            </tr>`;
        }

        document.getElementById('tb-facturas').innerHTML =
            html || `<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">${noData}</td></tr>`;
    } catch (err) {
        console.error('Error al cargar facturas:', err);
    }
}

// ── 4. GUARDAR / ACTUALIZAR FACTURA ──────────────────────────────────────────
async function guardarFactura() {
    const tipoFactura  = document.getElementById('f-tipo').value;
    const referenciaId = parseInt(document.getElementById('f-ref').value);
    const subtotal     = parseFloat(document.getElementById('f-subtotal').value);
    const pctIva       = parseFloat(document.getElementById('f-iva').value) || 0;

    if (!referenciaId || !subtotal) {
        alert(_t('Referencia y Subtotal son requeridos','Reference and Subtotal are required'));
        return;
    }

    const impuestos = subtotal * (pctIva / 100);
    const total     = subtotal + impuestos;
    const payload   = {
        venta_id:          tipoFactura === 'venta'    ? referenciaId : null,
        orden_servicio_id: tipoFactura === 'servicio' ? referenciaId : null,
        subtotal, descuento: 0, impuestos, total,
        notas: facturaEditandoId
            ? _t('Modificada desde interfaz web','Modified from web interface')
            : _t('Emitida desde interfaz web','Issued from web interface')
    };

    if (facturaEditandoId) {
        await fetch(`${API}/facturas/${facturaEditandoId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } else {
        await fetch(`${API}/facturas`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    closeModal('modal-factura');
    renderFacturas();
}

// ── 5. PREPARAR EDITAR ────────────────────────────────────────────────────────
function prepararEditarFactura(id, tipo, referencia, subtotal, impuestos) {
    facturaEditandoId = id;
    const titulo      = _t(`Editar Factura #${String(id).padStart(4,'0')}`, `Edit Invoice #${String(id).padStart(4,'0')}`);
    document.querySelector('#modal-factura h2').innerText = titulo;

    document.getElementById('f-tipo').value     = tipo;
    document.getElementById('f-ref').value      = referencia;
    document.getElementById('f-subtotal').value = subtotal;
    const ivaCalculado = subtotal > 0 ? Math.round((impuestos / subtotal) * 100) : 19;
    document.getElementById('f-iva').value = ivaCalculado;

    calcularTotalPreview();
    openModal('modal-factura');
}

// ── 6. ELIMINAR ───────────────────────────────────────────────────────────────
async function eliminarFactura(id) {
    const msg = _t('¿Seguro que deseas eliminar esta factura?','Are you sure you want to delete this invoice?');
    if (!confirm(msg)) return;
    await fetch(`${API}/facturas/${id}`, { method: 'DELETE' });
    renderFacturas();
}

// ── 7. TOTAL EN VIVO ──────────────────────────────────────────────────────────
function calcularTotalPreview() {
    const subtotal = parseFloat(document.getElementById('f-subtotal').value) || 0;
    const iva      = parseFloat(document.getElementById('f-iva').value)      || 0;
    const total    = subtotal + (subtotal * (iva / 100));
    const lbl      = _t('Total estimado','Estimated total');
    document.getElementById('f-total-preview').innerHTML =
        `${lbl}: <strong style="color:var(--green)">$${total.toFixed(2)}</strong>`;
}

document.getElementById('f-subtotal').addEventListener('input', calcularTotalPreview);
document.getElementById('f-iva').addEventListener('input', calcularTotalPreview);

// ── MODALES ───────────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
    if (id === 'modal-factura') {
        facturaEditandoId = null;
        const titulo      = _t('Emitir Factura','Issue Invoice');
        document.querySelector('#modal-factura h2').innerText = titulo;
        document.getElementById('f-ref').value     = '';
        document.getElementById('f-subtotal').value = '';
        document.getElementById('f-iva').value     = '19';
        calcularTotalPreview();
    }
}

// ── FILTRADO ──────────────────────────────────────────────────────────────────
function filtrarTabla(tablaId, busqueda) {
    const filtro = busqueda.toLowerCase();
    const filas  = document.getElementById(tablaId).getElementsByTagName('tr');
    for (let i = 0; i < filas.length; i++) {
        filas[i].style.display = filas[i].innerText.toLowerCase().includes(filtro) ? '' : 'none';
    }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
renderFacturas();