const API = "https://vacontrol-production.up.railway.app";

function _en()      { return localStorage.getItem('va_idioma') === 'en'; }
function _t(es, en) { return _en() ? en : es; }

// ── TOGGLE PASSWORD ───────────────────────────────────────────────────────────
document.getElementById('toggle-pass').addEventListener('click', () => {
    const input = document.getElementById('password');
    const icon  = document.getElementById('eye-icon');
    if (input.type === 'password') { input.type = 'text';     icon.className = 'ti ti-eye-off'; }
    else                           { input.type = 'password'; icon.className = 'ti ti-eye'; }
});

// ── MENSAJES DE ERROR ─────────────────────────────────────────────────────────
function mostrarError(mensaje) {
    const msg = document.getElementById('error-msg');
    document.getElementById('error-text').textContent = mensaje;
    msg.classList.add('visible');
}
function ocultarError() { document.getElementById('error-msg').classList.remove('visible'); }

// ── ENTER KEY ────────────────────────────────────────────────────────────────
document.getElementById('password').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
document.getElementById('email').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('password').focus(); });
document.getElementById('btn-login').addEventListener('click', handleLogin);

// ── LOGIN ─────────────────────────────────────────────────────────────────────
async function handleLogin() {
    ocultarError();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        mostrarError(_t('Por favor completa todos los campos.','Please fill in all fields.'));
        return;
    }

    const btn = document.getElementById('btn-login');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const res  = await fetch(`${API}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            mostrarError(data.error || _t('Error al iniciar sesión.','Login error.'));
            return;
        }
        localStorage.setItem('va_token',   data.token);
        localStorage.setItem('va_usuario', JSON.stringify(data.usuario));
        window.location.href = '/pages/dashboard.html';
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarError(_t(
            'No se pudo conectar con el servidor. Verifica que esté activo.',
            'Could not connect to the server. Make sure it is running.'
        ));
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Si ya hay sesión activa, redirigir al dashboard
if (localStorage.getItem('va_token')) {
    window.location.href = '/pages/dashboard.html';
}