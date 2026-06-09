/**
 * auth.js — Guard de autenticación para VA Control
 * 
 * Incluir este script en TODAS las páginas protegidas (dashboard, productos, etc.)
 * ANTES de cualquier otro script de la página.
 * 
 * Uso en HTML:
 *   <script src="/client/assets/js/auth.js"></script>
 */

const VA_API = 'http://localhost:3000/api';

// Obtiene el token almacenado
function getToken() {
    return localStorage.getItem('va_token');
}

// Obtiene los datos del usuario almacenado
function getUsuario() {
    try {
        return JSON.parse(localStorage.getItem('va_usuario')) || null;
    } catch {
        return null;
    }
}

// Cierra sesión y redirige al login
function logout() {
    localStorage.removeItem('va_token');
    localStorage.removeItem('va_usuario');
    window.location.href = '/client/assets/pages/login.html';
}

// Headers estándar con token para llamadas a la API
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// Guard principal: si no hay token, redirige al login
(function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/client/assets/pages/login.html';
        return;
    }

    // Verificar token con el servidor (opcional pero recomendado)
    fetch(`${VA_API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (res.status === 401) {
            // Token expirado o inválido
            logout();
        }
    })
    .catch(() => {
        // Si el servidor no responde, dejamos pasar (modo offline)
        // Puedes cambiar esto por logout() si prefieres ser estricto
        console.warn('VA_Control: No se pudo verificar el token con el servidor.');
    });
})();

// Poblar el elemento del sidebar con los datos del usuario autenticado
document.addEventListener('DOMContentLoaded', () => {
    const usuario = getUsuario();
    if (!usuario) return;

    // Iniciales del avatar
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
        const iniciales = usuario.nombre
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        avatarEl.textContent = iniciales;
    }

    // Nombre
    const nombreEl = document.querySelector('.user-info p');
    if (nombreEl) nombreEl.textContent = usuario.nombre;

    // Rol
    const rolEl = document.querySelector('.user-info span');
    if (rolEl) {
        const roles = { admin: 'Administrador', vendedor: 'Vendedor', tecnico: 'Técnico' };
        rolEl.textContent = roles[usuario.rol] || usuario.rol;
    }

    // Mostrar/ocultar secciones según rol (solo admin ve Usuarios y Reportes completos)
    if (usuario.rol !== 'admin') {
        const navUsuarios = document.querySelector('.nav-item[onclick*="usuarios"]');
        if (navUsuarios) navUsuarios.style.display = 'none';
    }
});
