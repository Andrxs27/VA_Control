/**
 * auth.js — Guard de autenticación para VA Control
 * * Incluir este script en TODAS las páginas protegidas (dashboard, productos, etc.)
 * ANTES de cualquier otro script de la página.
 * * Uso en HTML:
 * <script src="/client/assets/js/auth.js"></script>
 */

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

// Función para pintar/actualizar los datos del usuario en la interfaz (Sidebar)
function actualizarUI() {
    const usuario = getUsuario();
    if (!usuario) return;

    // 1. Iniciales del avatar
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl && usuario.nombre) {
        const iniciales = usuario.nombre
            .split(' ')
            .filter(n => n) // Evita errores si hay dobles espacios
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        avatarEl.textContent = iniciales;
    }

    // 2. Nombre en el sidebar
    const nombreEl = document.querySelector('.user-info p');
    if (nombreEl) nombreEl.textContent = usuario.nombre;

    // 3. Rol en el sidebar (Soporte Multi-idioma)
    const rolEl = document.querySelector('.user-info span');
    if (rolEl) {
        // Mapeamos el rol de la base de datos con tu clave de traducción de los archivos JSON
        const i18nRoles = { admin: 'rol_admin', vendedor: 'rol_vendedor', tecnico: 'rol_tecnico' };
        const claveTraduccion = i18nRoles[usuario.rol] || `rol_${usuario.rol}`;
        
        // Cambiamos el atributo dinámicamente
        rolEl.setAttribute('data-i18n', claveTraduccion);

        // 🔄 EJECUTAR TRADUCCIÓN: Intentamos forzar al motor de i18n a traducir el nuevo atributo
        if (typeof aplicarTraducciones === 'function') {
            aplicarTraducciones(); // Cambia esto por el nombre de tu función global de i18n si es diferente
        } else if (window.i18next && typeof i18next.t === 'function') {
            rolEl.textContent = i18next.t(claveTraduccion);
        } else {
            // Respaldo en texto plano en español si la librería de idiomas aún no se ha inicializado
            const rolesRespaldo = { admin: 'Administrador', vendedor: 'Vendedor', tecnico: 'Técnico' };
            rolEl.textContent = rolesRespaldo[usuario.rol] || usuario.rol;
        }
    }

    // 4. Mostrar u ocultar accesos del menú lateral según el rol actual
    const navUsuarios = document.querySelector('.nav-item[onclick*="usuarios"]');
    if (navUsuarios) {
        navUsuarios.style.display = usuario.rol === 'admin' ? '' : 'none';
    }
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
        window.location.href = '/pages/401.html';
        return; 
    }

    // 3. Verificar token y actualizar datos del usuario en tiempo real
    fetch(`${VA_API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (res.status === 401) {
            logout();
            throw new Error('Sesión expirada o inválida');
        }
        return res.json();
    })
    .then(data => {
        // Validamos si la API devuelve el usuario directamente o anidado en data.usuario
        const usuarioActualizado = data.usuario || data;
        
        if (usuarioActualizado && usuarioActualizado.rol) {
            // Guardamos los datos nuevos en el localStorage (por si cambió de admin a tecnico)
            localStorage.setItem('va_usuario', JSON.stringify(usuarioActualizado));
            
            // Forzamos el rediseño de la UI con los datos frescos del servidor
            actualizarUI();
        }
    })
    .catch((err) => {
        console.warn('VA_Control:', err.message || 'No se pudo verificar el token con el servidor.');
    });
})();

// Poblar elementos de la interfaz común una vez cargue el DOM inicial
document.addEventListener('DOMContentLoaded', () => {
    actualizarUI();
});