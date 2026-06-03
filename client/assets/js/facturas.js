const API = 'http://localhost:3000/api';
// Variable para saber qué factura estamos editando (null si es nueva)
let facturaEditandoId = null; 

// 1. CARGAR DATOS INICIALES
async function cargarDatos() {
    // Espacio reservado por si cruzas datos de otras tablas en el futuro
}

// 2. FORMATEADORES DE ESTILO
function formatFecha(fecha) {
    if (!fecha) return '—';
    return fecha.split('T')[0];
}

function tipoFacturaBadge(ventaId) {
    if (ventaId) {
        return `<span class="badge badge-blue">Venta</span>`;
    }
    return `<span class="badge badge-purple" style="background: #e0d4fc; color: #6366f1;">Servicio</span>`;
}

// 3. RENDERIZAR FACTURAS EN LA TABLA
async function renderFacturas() {
    const res = await fetch(`${API}/facturas`);
    const facturas = await res.json();

    let html = '';
    for (const f of facturas) {
        const tipo = f.venta_id ? 'Venta' : 'Servicio';
        const referencia = f.venta_id || f.orden_servicio_id || 'N/A';

        html += `<tr>
            <td style="font-weight:600">#${String(f.id).padStart(4, '0')}</td>
            <td>${tipoFacturaBadge(f.venta_id)}</td>
            <td>ID: ${referencia}</td>
            <td>$${parseFloat(f.subtotal).toFixed(2)}</td>
            <td>$${parseFloat(f.impuestos).toFixed(2)}</td>
            <td style="font-weight:600">$${parseFloat(f.total).toFixed(2)}</td>
            <td>${formatFecha(f.fecha_emision)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="prepararEditarFactura(${f.id}, '${tipo.toLowerCase()}', ${referencia}, ${f.subtotal}, ${f.impuestos})">
                    <i class="ti ti-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarFactura(${f.id})">
                    <i class="ti ti-trash"></i>
                </button>
            </td>
        </tr>`;
    }

    document.getElementById('tb-facturas').innerHTML = html ||
        '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">No hay facturas emitidas</td></tr>';
}

// 4. EMITIR / GUARDAR / ACTUALIZAR FACTURA (Soporta POST y PUT)
async function guardarFactura() {
    const tipoFactura = document.getElementById('f-tipo').value;
    const referenciaId = parseInt(document.getElementById('f-ref').value);
    const subtotal = parseFloat(document.getElementById('f-subtotal').value);
    const porcentajeIva = parseFloat(document.getElementById('f-iva').value) || 0;

    if (!referenciaId || !subtotal) {
        alert('Referencia y Subtotal son requeridos');
        return;
    }

    const impuestos = subtotal * (porcentajeIva / 100);
    const total = subtotal + impuestos;

    const payload = {
        venta_id: tipoFactura === 'venta' ? referenciaId : null,
        orden_servicio_id: tipoFactura === 'servicio' ? referenciaId : null,
        subtotal: subtotal,
        descuento: 0,
        impuestos: impuestos,
        total: total,
        notas: facturaEditandoId ? `Modificada desde interfaz web` : `Emitida desde interfaz web`
    };

    if (facturaEditandoId) {
        // --- AQUÍ ESTÁ TU FETCH PUT ---
        await fetch(`${API}/facturas/${facturaEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } else {
        // --- TU FETCH POST ORIGINAL ---
        await fetch(`${API}/facturas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    closeModal('modal-factura');
    renderFacturas();
}

// 5. PREPARAR FORMULARIO PARA EDITAR (Llenar campos)
function prepararEditarFactura(id, tipo, referencia, subtotal, impuestos) {
    facturaEditandoId = id; // Guardamos el ID que vamos a actualizar
    
    // Cambiamos el título del modal dinámicamente
    document.querySelector('#modal-factura h2').innerText = `Editar Factura #${String(id).padStart(4, '0')}`;
    
    // Rellenamos los inputs con los valores actuales de la fila
    document.getElementById('f-tipo').value = tipo;
    document.getElementById('f-ref').value = referencia;
    document.getElementById('f-subtotal').value = subtotal;
    
    // Calcular IVA aproximado basado en los impuestos actuales
    const ivaCalculado = subtotal > 0 ? Math.round((impuestos / subtotal) * 100) : 19;
    document.getElementById('f-iva').value = ivaCalculado;

    calcularTotalPreview();
    openModal('modal-factura');
}

// 6. ELIMINAR FACTURA
async function eliminarFactura(id) {
    if (!confirm('¿Seguro que deseas eliminar esta factura?')) return;
    
    await fetch(`${API}/facturas/${id}`, { method: 'DELETE' });
    renderFacturas();
}

// 7. DETECTAR CAMBIOS PARA EL TOTAL EN VIVO
function calcularTotalPreview() {
    const subtotal = parseFloat(document.getElementById('f-subtotal').value) || 0;
    const iva = parseFloat(document.getElementById('f-iva').value) || 0;
    const total = subtotal + (subtotal * (iva / 100));
    document.getElementById('f-total-preview').innerHTML = `Total estimado: <strong>$${total.toFixed(2)}</strong>`;
}

// Listeners para el cálculo en vivo al escribir
document.getElementById('f-subtotal').addEventListener('input', calcularTotalPreview);
document.getElementById('f-iva').addEventListener('input', calcularTotalPreview);

// --- CONTROL DE MODALES ---
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    if(id === 'modal-factura') {
        // Limpieza estricta al cerrar
        facturaEditandoId = null; 
        document.querySelector('#modal-factura h2').innerText = 'Emitir Factura';
        document.getElementById('f-ref').value = '';
        document.getElementById('f-subtotal').value = '';
        document.getElementById('f-iva').value = '19';
        calcularTotalPreview();
    }
}

// --- FILTRADO DE TABLA ---
function filtrarTabla(tablaId, busqueda) {
    const filtro = busqueda.toLowerCase();
    const filas = document.getElementById(tablaId).getElementsByTagName('tr');

    for (let i = 0; i < filas.length; i++) {
        const textoFila = filas[i].innerText.toLowerCase();
        filas[i].style.display = textoFila.includes(filtro) ? '' : 'none';
    }
}

// INICIALIZACIÓN
cargarDatos().then(() => renderFacturas());