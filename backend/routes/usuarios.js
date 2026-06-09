const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const bcrypt = require('bcrypt'); // <-- IMPORTACIÓN DE BCRYPT AÑADIDA

// MIDDLEWARE DE VALIDACIÓN 

const validarUsuarioMiddleware = (req, res, next) => {
    let { nombre, email, password, rol } = req.body;

    // 1. Validar presencia de campos obligatorios
    if (!nombre || !email || !rol) {
        return res.status(400).json({ error: 'Los campos nombre, email y rol son obligatorios.' });
    }

    // 2. Limpieza y validación del NOMBRE
    nombre = nombre.trim().replace(/\s+/g, ' '); // Elimina espacios dobles e innecesarios

    if (nombre.length < 2) { 
        return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
    }
    if (nombre.length > 80) {
        return res.status(400).json({ error: 'El nombre no puede superar los 80 caracteres.' });
    }

    // Seguridad: Permite letras de cualquier tipo (incluye acentos y ñ) y espacios. Bloquea números y símbolos.
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombreRegex.test(nombre)) {
        return res.status(400).json({ error: 'El nombre solo puede contener letras y espacios.' });
    }

    // Guardamos el nombre formateado de vuelta en el cuerpo de la petición
    req.body.nombre = nombre;

    // 3. Validación del EMAIL (Formato estándar global)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
    }

    // 4. Validación de la CONTRASEÑA (Solo requerida al crear un usuario)
    if (req.method === 'POST') {
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña es obligatoria y debe tener al menos 6 caracteres.' });
        }
    }

    // Si todo es correcto, permitimos que continúe hacia la Base de Datos
    next();
};

// =========================================================================
// RUTAS / CONTROLADORES (CRUD)
// =========================================================================

// CRUD - GET (Obtener todos los usuarios - activos e inactivos)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, email, rol, activo FROM usuarios ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error en GET /usuarios:', error);
        res.status(500).json({ error: 'Error interno al obtener los usuarios.' });
    }
});

// CRUD - GET por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error en GET /usuarios/${req.params.id}:`, error);
        res.status(500).json({ error: 'Error interno al obtener el usuario.' });
    }
});

// CRUD - POST (Crear usuario)
router.post('/', validarUsuarioMiddleware, async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Verificar si el correo ya existe
        const existeEmail = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (existeEmail.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
        }

        // ENCRIPTACIÓN DE CONTRASEÑA CON BCRYPT
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol, activo, creado_en, actualizado_en) VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING id, nombre, email, rol, activo',
            [nombre, email, hashedPassword, rol] // <-- Se guarda la contraseña encriptada
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error en POST /usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear el usuario.' });
    }
});

// CRUD - PUT (Actualizar usuario)
router.put('/:id', validarUsuarioMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol } = req.body;

        // Evitar que use el correo de otro usuario existente
        const emailDuplicado = await pool.query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [email, id]);
        if (emailDuplicado.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está siendo usado por otro usuario.' });
        }

        const result = await pool.query(
            'UPDATE usuarios SET nombre=$1, email=$2, rol=$3, actualizado_en=NOW() WHERE id=$4 RETURNING id, nombre, email, rol, activo',
            [nombre, email, rol, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error en PUT /usuarios/${req.params.id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el usuario.' });
    }
});

// NUEVA RUTA - PATCH (Alternar estado activo/inactivo - Borrado lógico)
router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        const result = await pool.query(
            'UPDATE usuarios SET activo=$1, actualizado_en=NOW() WHERE id=$2 RETURNING id, activo',
            [activo, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json({ mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente.`, usuario: result.rows[0] });
    } catch (error) {
        console.error(`Error en PATCH /usuarios/${req.params.id}/estado:`, error);
        res.status(500).json({ error: 'Error interno al cambiar el estado del usuario.' });
    }
});

// CRUD - DELETE (Eliminar usuario permanentemente)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM usuarios WHERE id=$1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json({ mensaje: 'La cuenta de usuario ha sido eliminada permanentemente del sistema.' });
    } catch (error) {
        console.error(`Error en DELETE /usuarios/${req.params.id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar definitivamente el usuario.' });
    }
});

module.exports = router;