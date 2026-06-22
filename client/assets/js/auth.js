
const VA_API = 'https://vacontrol-production.up.railway.app/api';

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
    window.location.href = '/pages/login.html';
}

// Headers estándar con token para llamadas a la API
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// Guard principal: ejecuta las comprobaciones de ruta inmediatamente
(function checkAuth() {
    const token = getToken();
    
    // 1. Si no hay token, directo al login
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    // 2. 🛡️ CONTROL DE ACCESO POR RUTA (PROTECCIÓN 401)
    const usuario = getUsuario();
    const esPaginaUsuarios = window.location.pathname.includes('usuarios.html');

    if (esPaginaUsuarios && (!usuario || usuario.rol !== 'admin')) {
        console.error("Error 401: Unauthorized - No tienes permisos para esta sección.");
        
        // Redirección limpia e inmediata a la página de error independiente
        window.location.href = '/pages/401.html';
        return; 
    }

    // 3. Verificar token con el servidor en segundo plano
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
        console.warn('VA_Control: No se pudo verificar el token con el servidor.');
    });
})();

// Poblar elementos de la interfaz común (Sidebar) una vez cargue el DOM
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

    // Nombre en el sidebar
    const nombreEl = document.querySelector('.user-info p');
    if (nombreEl) nombreEl.textContent = usuario.nombre;

    // Rol en el sidebar
    const rolEl = document.querySelector('.user-info span');
    if (rolEl) {
        const roles = { admin: 'Administrador', vendedor: 'Vendedor', tecnico: 'Técnico' };

        // 1. Set the text fallback
        rolEl.textContent = roles[usuario.rol] || usuario.rol;

        // 2. Dynamically change the i18n key so the translation engine plays nice
        rolEl.setAttribute('data-i18n', `rol_${usuario.rol}`);
    }

    // Ocultar accesos del menú lateral si no es administrador
    if (usuario.rol !== 'admin') {
        const navUsuarios = document.querySelector('.nav-item[onclick*="usuarios"]');
        if (navUsuarios) navUsuarios.style.display = 'none';
    }
});