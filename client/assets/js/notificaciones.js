// /client/assets/js/notificaciones.js
// Activa el botón de notificaciones (campana) de la topbar.
// Muestra un panel desplegable con las alertas de stock (GET /api/inventario/alertas).

const API_NOTIF = 'https://vacontrol-production.up.railway.app/api';

let notifAlertas = [];
let notifIntervalo = null;

function _enNotif()      { return localStorage.getItem('va_idioma') === 'en'; }
function _tNotif(es, en) { return _enNotif() ? en : es; }

function _headersNotif() {
    return typeof authHeaders === 'function' ? authHeaders() : { 'Content-Type': 'application/json' };
}

// ── 1. CREAR EL PANEL (una sola vez por página) ─────────────────────────────
function crearPanelNotificaciones() {
    if (document.getElementById('notif-dropdown')) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'notif-dropdown';
    dropdown.className = 'notif-dropdown';
    dropdown.innerHTML = `
        <div class="notif-header">
            <span>${_tNotif('Alertas de stock', 'Stock alerts')}</span>
            <button class="notif-link" id="notif-ver-todo" type="button">${_tNotif('Ver inventario', 'View inventory')}</button>
        </div>
        <div class="notif-list" id="notif-list">
            <div class="notif-empty">${_tNotif('Cargando...', 'Loading...')}</div>
        </div>
    `;
    document.body.appendChild(dropdown);

    dropdown.querySelector('#notif-ver-todo').addEventListener('click', () => {
        window.location.href = 'inventario.html';
    });

    // Cerrar el panel al hacer click fuera de él
    document.addEventListener('click', function (e) {
        const btnNotif = document.getElementById('btn-notif');
        if (!dropdown.contains(e.target) && e.target !== btnNotif && !btnNotif?.contains(e.target)) {
            cerrarPanelNotificaciones();
        }
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarPanelNotificaciones();
    });
}

// ── 2. ABRIR / CERRAR ────────────────────────────────────────────────────────
function abrirPanelNotificaciones() {
    const dropdown = document.getElementById('notif-dropdown');
    const btnNotif  = document.getElementById('btn-notif');
    if (!dropdown || !btnNotif) return;

    if (dropdown.classList.contains('notif-dropdown--open')) {
        cerrarPanelNotificaciones();
        return;
    }

    const rect = btnNotif.getBoundingClientRect();
    dropdown.style.top   = (rect.bottom + 8) + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
    dropdown.classList.add('notif-dropdown--open');

    cargarAlertasStock();
}

function cerrarPanelNotificaciones() {
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) dropdown.classList.remove('notif-dropdown--open');
}

// ── 3. CARGAR ALERTAS DESDE LA API ──────────────────────────────────────────
async function cargarAlertasStock() {
    try {
        const res = await fetch(`${API_NOTIF}/inventario/alertas`, { headers: _headersNotif() });
        if (!res.ok) throw new Error('No se pudieron cargar las alertas de stock');
        notifAlertas = await res.json();
        renderListaNotificaciones();
        actualizarBadgeNotif();
    } catch (error) {
        console.error('Error al cargar alertas de stock:', error);
        const lista = document.getElementById('notif-list');
        if (lista) {
            lista.innerHTML = `<div class="notif-empty"><i class="ti ti-alert-circle"></i> ${_tNotif('No se pudieron cargar las alertas.', 'Could not load alerts.')}</div>`;
        }
    }
}

function renderListaNotificaciones() {
    const lista = document.getElementById('notif-list');
    if (!lista) return;

    if (!notifAlertas.length) {
        lista.innerHTML = `<div class="notif-empty"><i class="ti ti-circle-check"></i> ${_tNotif('Sin alertas de stock', 'No stock alerts')}</div>`;
        return;
    }

    lista.innerHTML = notifAlertas.map(p => {
        const sinStock  = p.estado_stock === 'sin_stock';
        const icono     = sinStock ? 'ti-alert-triangle' : 'ti-alert-circle';
        const color     = sinStock ? 'var(--red)' : 'var(--amber)';
        const etiqueta  = sinStock ? _tNotif('Sin stock', 'Out of stock') : _tNotif('Stock bajo', 'Low stock');
        const nombre    = p.nombre ?? '';

        return `
            <div class="notif-item" data-producto-id="${p.id}">
                <i class="ti ${icono}" style="color:${color}"></i>
                <div class="notif-item-body">
                    <div class="notif-item-title">${nombre}</div>
                    <div class="notif-item-sub">${etiqueta} · ${_tNotif('stock', 'stock')}: ${p.stock} / ${_tNotif('mínimo', 'min')}: ${p.stock_minimo}</div>
                </div>
            </div>
        `;
    }).join('');

    lista.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', () => {
            window.location.href = 'inventario.html';
        });
    });
}

// ── 4. BADGE NUMÉRICO SOBRE LA CAMPANA ──────────────────────────────────────
function actualizarBadgeNotif() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;

    if (notifAlertas.length > 0) {
        badge.textContent = notifAlertas.length > 9 ? '9+' : String(notifAlertas.length);
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// ── 5. ACTIVAR EL BOTÓN EXISTENTE DE LA TOPBAR ──────────────────────────────
function inyectarBotonNotificaciones() {
    const btns = document.querySelectorAll('.icon-btn');
    let btnNotif = null;
    btns.forEach(btn => {
        if (btn.querySelector('.ti-bell')) btnNotif = btn;
    });
    if (!btnNotif) return;

    btnNotif.id = 'btn-notif';
    btnNotif.setAttribute('data-i18n', 'topbar_alertas');
    btnNotif.setAttribute('data-i18n-type', 'title');

    // Reemplazamos el punto estático por un badge numérico dinámico
    const puntoViejo = btnNotif.querySelector('.badge-dot');
    if (puntoViejo) puntoViejo.remove();

    if (!btnNotif.querySelector('.notif-badge')) {
        const badge = document.createElement('span');
        badge.id = 'notif-badge';
        badge.className = 'notif-badge';
        badge.style.display = 'none';
        btnNotif.appendChild(badge);
    }

    btnNotif.addEventListener('click', function (e) {
        e.stopPropagation();
        abrirPanelNotificaciones();
    });
}

// ── 6. INICIALIZACIÓN ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    crearPanelNotificaciones();
    inyectarBotonNotificaciones();
    cargarAlertasStock(); // carga inicial para poblar el badge desde que abre la página

    // Refrescar el conteo de alertas cada 60s
    if (notifIntervalo) clearInterval(notifIntervalo);
    notifIntervalo = setInterval(cargarAlertasStock, 60000);
});
