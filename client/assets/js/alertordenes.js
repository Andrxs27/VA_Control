// /client/assets/js/badges.js
const API_BADGE = 'http://localhost:3000/api';

async function actualizarBadgeOrdenes() {
    const badgeOrdenes = document.getElementById('badge-ordenes');
    
    // Si el badge no existe en el HTML actual, no hacemos la petición
    if (!badgeOrdenes) return;

    try {
        const res = await fetch(`${API_BADGE}/ordenes`);
        const ordenesListados = await res.json();
        
        // Filtrar y contar órdenes en los 3 estados requeridos
        const ordenesActivas = ordenesListados.filter(o => 
            o.estado === 'pendiente' || 
            o.estado === 'en_proceso' || 
            o.estado === 'completado'
        ).length;

        badgeOrdenes.innerText = ordenesActivas;

        // Ocultar o mostrar el badge según el número
        if (ordenesActivas === 0) {
            badgeOrdenes.style.display = 'none';
        } else {
            badgeOrdenes.style.display = 'inline-flex';
        }
    } catch (error) {
        console.error("Error al actualizar el badge de órdenes:", error);
    }
}

// Ejecutar automáticamente al cargar cualquier página que incluya este script
document.addEventListener('DOMContentLoaded', actualizarBadgeOrdenes);