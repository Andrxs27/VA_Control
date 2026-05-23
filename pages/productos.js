const API = 'http://localhost:3000/api';

async function renderProductos() {
    const res = await fetch(`${API}/productos`);
    const productos = await res.json();

    let html = '';
    for (const p of productos) {
        html += `<tr>
    <td><code>${p.sku}</code></td>
    <td>${p.nombre}</td>
    <td>${p.categoria}</td>
    <td>${p.stock} uds.</td>
    <td>${p.precio_venta}</td>
    <td>${p.active ? 'Activo' : 'Inactivo'}</td>
    <td>
        <button class="btn btn-danger btn-sm" onclick="desactivarProducto(${p.id})">
        <i class="ti ti-trash"></i>
        </button>
    </td>
    </tr>`;
    }

    document.getElementById('tb-productos').innerHTML = html ||
        '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">No hay productos</td></tr>';
}

async function guardarProducto() {
    const sku = document.getElementById('p-sku').value;
    const nombre = document.getElementById('p-nombre').value;
    const categoria = document.getElementById('p-categoria').value;
    const stock = document.getElementById('p-stock').value;
    const stock_minimo = document.getElementById('p-stockmin').value;
    const precio_venta = document.getElementById('p-precio').value;

    if (!sku || !nombre) {
        alert('SKU y nombre son requeridos');
        return;
    }

    await fetch(`${API}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, nombre, categoria, stock, stock_minimo, precio_venta })
    });

    closeModal('modal-producto');
    renderProductos();
}


async function desactivarProducto(id) {
    await fetch(`${API}/productos/${id}`, { method: 'DELETE' });
    renderProductos();
}


renderProductos();