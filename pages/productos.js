const API = 'http://localhost:3000/api';

let productosListados = []; 
let productoEditandoId = null; 

async function renderProductos() {
    try {
        const res = await fetch(`${API}/productos`);
        productosListados = await res.json();

        let html = '';
        for (const p of productosListados) {
            html += `<tr>
          <td><code>${p.sku}</code></td>
          <td>${p.nombre}</td>
          <td>${p.categoria}</td>
          <td>${p.stock} uds.</td>
          <td>${p.precio_venta}</td>
          <td>${p.activo ? 'Activo' : 'Inactivo'}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${p.id})">
              <i class="ti ti-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="desactivarProducto(${p.id})">
              <i class="ti ti-trash"></i>
            </button>
          </td>
        </tr>`;
        }

        document.getElementById('tb-productos').innerHTML = html ||
            '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">No hay productos</td></tr>';
            
    } catch (error) {
        console.error("Error al renderizar productos:", error);
    }
}

function prepararEdicion(id) {
    const producto = productosListados.find(p => p.id === id);
    
    if (!producto) {
        console.error("No se encontró el producto con ID:", id);
        return;
    }

    productoEditandoId = id; // Activamos el modo edición (PUT)

    // Llenamos el formulario con los datos cargados
    document.getElementById('p-sku').value = producto.sku || '';
    document.getElementById('p-nombre').value = producto.nombre || '';
    document.getElementById('p-categoria').value = producto.categoria || '';
    document.getElementById('p-stock').value = producto.stock || 0;
    document.getElementById('p-precio').value = producto.precio_venta || 0;
    

    if (typeof openModal === 'function') {
        openModal('modal-producto'); 
    } else {
        console.warn("La función openModal() no está definida. Abre el modal manualmente.");
    }
}

async function guardarProducto() {
    const sku = document.getElementById('p-sku').value;
    const nombre = document.getElementById('p-nombre').value;
    const categoria = document.getElementById('p-categoria').value;
    const stock = document.getElementById('p-stock').value;
    const stock_minimo = document.getElementById('p-stockmin')?.value || 0; // Evita error si el input no existe
    const precio_venta = document.getElementById('p-precio').value;

    if (!sku || !nombre) {
        alert('SKU y nombre son requeridos');
        return;
    }

    const datosProducto = { sku, nombre, categoria, stock, stock_minimo, precio_venta };

    let url = `${API}/productos`;
    let metodo = 'POST';

    if (productoEditandoId !== null) {
        url = `${API}/productos/${productoEditandoId}`;
        metodo = 'PUT';
    }

    try {
        await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProducto)
        });

        resetearFormulario();
        
        if (typeof closeModal === 'function') {
            closeModal('modal-producto');
        }
        
        renderProductos();
    } catch (error) {
        console.error("Error al guardar el producto:", error);
    }
}

async function desactivarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await fetch(`${API}/productos/${id}`, { method: 'DELETE' });
            renderProductos();
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    }
}

function resetearFormulario() {
    productoEditandoId = null;
    document.getElementById('p-sku').value = '';
    document.getElementById('p-nombre').value = '';
    document.getElementById('p-categoria').value = '';
    document.getElementById('p-stock').value = '';
    const stockMin = document.getElementById('p-stockmin');
    if (stockMin) stockMin.value = '';
    document.getElementById('p-precio').value = '';
}

// Ejecución inicial
renderProductos();