const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// =========================================================================
// MIDDLEWARE DE VALIDACIÓN PARA CLIENTES (CORREGIDO)
// =========================================================================
const validarClienteMiddleware = (req, res, next) => {
    let { nombre, email, telefono, identificacion } = req.body;

    // 1. Validar presencia de campos obligatorios principales
    if (!nombre || !identificacion) {
        return res.status(400).json({ error: 'La identificación y el nombre son obligatorios.' });
    }

    // 2. Limpieza y validación del NOMBRE
    nombre = nombre.trim().replace(/\s+/g, ' '); 

    if (nombre.length < 2) { 
        return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
    }
    if (nombre.length > 120) { // Incrementado para nombres de empresas largos
        return res.status(400).json({ error: 'El nombre no puede superar los 120 caracteres.' });
    }

    // Se eliminó la regex restrictiva que impedía números para permitir Razones Sociales / NITs corporativos
    req.body.nombre = nombre;

    // 3. Validación del EMAIL (Opcional, pero si viene, se valida el formato)
    if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
        }
        req.body.email = email.trim();
    } else {
        req.body.email = null; // Guardar NULL si está vacío
    }

    // 4. Validación básica del TELÉFONO (Si se envía)
    if (telefono && telefono.trim() !== '') {
        const telefonoLimpiado = telefono.trim();
        if (telefonoLimpiado.length < 7 || telefonoLimpiado.length > 20) {
            return res.status(400).json({ error: 'El teléfono debe tener entre 7 y 20 caracteres.' });
        }
        req.body.telefono = telefonoLimpiado;
    } else {
        req.body.telefono = null;
    }

    next();
};

// =========================================================================
// RUTAS / CONTROLADORES (CRUD)
// =========================================================================

// GET - Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error en GET /clientes:', error);
        res.status(500).json({ error: 'Error interno al obtener los clientes.' });
    }
});

// POST - Crear cliente
router.post('/', validarClienteMiddleware, async (req, res) => {
    try {
        const { identificacion, nombre, email, telefono, direccion, tipo, notas } = req.body;

        // Validar si el correo ya existe (sólo si se ingresó uno)
        if (email) {
            const existeEmail = await pool.query('SELECT id FROM clientes WHERE email = $1', [email]);
            if (existeEmail.rows.length > 0) {
                return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
            }
        }

        // notas por defecto en null si no es enviado
        const campoNotas = notas || null;

        const result = await pool.query(
            `INSERT INTO clientes (identificacion, nombre, email, telefono, direccion, tipo, notas, activo, creado_en, actualizado_en) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()) RETURNING *`,
            [identificacion, nombre, email, telefono, direccion, tipo || 'particular', campoNotas]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error en POST /clientes:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear el cliente.' });
    }
});

// PUT - Actualizar cliente
router.put('/:id', validarClienteMiddleware, async (req, res) => {
    try {
        // 1. Convertir el ID de string a entero para evitar conflictos con PostgreSQL
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El ID de cliente proporcionado no es válido.' });
        }

        const { identificacion, nombre, email, telefono, direccion, tipo, notas } = req.body;

        // 2. Verificar duplicados usando el ID ya transformado a entero
        if (email) {
            const emailDuplicado = await pool.query(
                'SELECT id FROM clientes WHERE email = $1 AND id != $2', 
                [email, id]
            );
            if (emailDuplicado.rows.length > 0) {
                return res.status(400).json({ error: 'El correo electrónico ya está siendo usado por otro cliente.' });
            }
        }

        const campoNotas = notas || null;
        const campoTipo = tipo || 'particular'; 

        // 3. Ejecutar la actualización (REVISA si en tu BD es "notas" o "notes")
        const result = await pool.query(
            `UPDATE clientes 
             SET identificacion=$1, nombre=$2, email=$3, telefono=$4, direccion=$5, tipo=$6, notas=$7, actualizado_en=NOW() 
             WHERE id=$8 RETURNING *`,
            [identificacion, nombre, email, telefono, direccion, campoTipo, campoNotas, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        // Esto te mostrará el motivo exacto del fallo en la terminal del backend
        console.error(`Error en PUT /clientes/${req.params.id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el cliente.' });
    }
});

// PATCH - Alternar estado activo/inactivo
router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        const result = await pool.query(
            'UPDATE clientes SET activo=$1, actualizado_en=NOW() WHERE id=$2 RETURNING id, activo',
            [activo, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        res.json({ mensaje: `Cliente ${activo ? 'activado' : 'desactivado'} correctamente.`, cliente: result.rows[0] });
    } catch (error) {
        console.error(`Error en PATCH /clientes/${req.params.id}/estado:`, error);
        res.status(500).json({ error: 'Error interno al cambiar el estado del cliente.' });
    }
});

// DELETE - Eliminar permanentemente
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM clientes WHERE id=$1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        res.json({ mensaje: 'El registro del cliente ha sido eliminado permanentemente del sistema.' });
    } catch (error) {
        console.error(`Error en DELETE /clientes/${req.params.id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar definitivamente el cliente.' });
    }
});

module.exports = router;