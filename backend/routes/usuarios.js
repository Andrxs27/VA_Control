const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// CRUD - GET 
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, email, rol, activo FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - GET id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - POST
router.post('/', async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol, activo, creado_en, actualizado_en) VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING id, nombre, email, rol, activo',
            [nombre, email, password, rol]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - PUT
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol } = req.body;
        const result = await pool.query(
            'UPDATE usuarios SET nombre=$1, email=$2, rol=$3, actualizado_en=NOW() WHERE id=$4 RETURNING id, nombre, email, rol, activo',
            [nombre, email, rol, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - DELETE (lo desactiva pero no lo borra)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('UPDATE usuarios SET activo=false WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;