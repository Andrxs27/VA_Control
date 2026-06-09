const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    try {
        const result = await pool.query(
            'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = result.rows[0];

        if (!usuario.activo) {
            return res.status(403).json({ error: 'Tu cuenta está desactivada. Contacta al administrador.' });
        }
        

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
            process.env.JWT_SECRET || 'va_control_secret_key',
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Bienvenido',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// OBTENER PERFIL DEL USUARIO AUTENTICADO
exports.getMe = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// CAMBIAR CONTRASEÑA (usuario autenticado)
exports.cambiarPassword = async (req, res) => {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
        return res.status(400).json({ error: 'Ambas contraseñas son requeridas.' });
    }
    if (passwordNueva.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const result = await pool.query(
            'SELECT password FROM usuarios WHERE id = $1',
            [req.user.id]
        );

        const usuario = result.rows[0];
        const esValida = await bcrypt.compare(passwordActual, usuario.password);

        if (!esValida) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        const hash = await bcrypt.hash(passwordNueva, 10);
        await pool.query(
            'UPDATE usuarios SET password = $1, actualizado_en = NOW() WHERE id = $2',
            [hash, req.user.id]
        );

        res.json({ message: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        console.error('Error en cambiarPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

