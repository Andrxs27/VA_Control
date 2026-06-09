    const API = 'http://localhost:3000/api';

    // Toggle password visibility
    document.getElementById('toggle-pass').addEventListener('click', () => {
      const input = document.getElementById('password');
      const icon = document.getElementById('eye-icon');
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'ti ti-eye-off';
      } else {
        input.type = 'password';
        icon.className = 'ti ti-eye';
      }
    });

    // Mostrar error
    function mostrarError(mensaje) {
      const msg = document.getElementById('error-msg');
      document.getElementById('error-text').textContent = mensaje;
      msg.classList.add('visible');
    }

    function ocultarError() {
      document.getElementById('error-msg').classList.remove('visible');
    }

    // Submit con Enter
    document.getElementById('password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('email').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('password').focus();
    });

    document.getElementById('btn-login').addEventListener('click', handleLogin);

    async function handleLogin() {
      ocultarError();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        mostrarError('Por favor completa todos los campos.');
        return;
      }

      const btn = document.getElementById('btn-login');
      btn.classList.add('loading');
      btn.disabled = true;

      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          mostrarError(data.error || 'Error al iniciar sesión.');
          return;
        }

        // Guardar datos en localStorage
        localStorage.setItem('va_token', data.token);
        localStorage.setItem('va_usuario', JSON.stringify(data.usuario));

        // Redirigir al dashboard
        window.location.href = '/client/assets/pages/dashboard.html';

      } catch (error) {
        console.error('Error de conexión:', error);
        mostrarError('No se pudo conectar con el servidor. Verifica que esté activo.');
      } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }

    // Si ya hay sesión activa, redirigir directo al dashboard
    if (localStorage.getItem('va_token')) {
      window.location.href = '/client/assets/pages/dashboard.html';
    }