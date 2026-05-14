const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'va_control_db',
    password: '123456',
    port: 5432,
});

// GET ALL
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, correo, rol, activo, creado_en FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET BY ID 
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, nombre, correo, rol, activo, creado_en FROM usuarios WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST 
router.post('/', async (req, res) => {
    try {
        const { nombre, correo, contrasena, rol } = req.body;
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contrasena, rol, activo, creado_en) VALUES ($1, $2, $3, $4, true, NOW()) RETURNING id, nombre, correo, rol, activo, creado_en',
            [nombre, correo, contrasena, rol]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT 
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, rol } = req.body;
        const result = await pool.query(
            'UPDATE usuarios SET nombre=$1, correo=$2, rol=$3 WHERE id=$4 RETURNING id, nombre, correo, rol, activo, creado_en',
            [nombre, correo, rol, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE 
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE usuarios SET activo=false WHERE id=$1 RETURNING id, nombre, correo, rol, activo',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ mensaje: 'Usuario desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;