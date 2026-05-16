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
        const result = await pool.query('SELECT id, nombre, rol, email, config, active FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET BY ID 
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, nombre, rol, email, config, active FROM usuarios WHERE id = $1', [id]);
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
        const { nombre, rol, email, password, config } = req.body;
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, rol, email, password, config, active) VALUES ($1, $2, $3, $4, $5, true) RETURNING id, nombre, rol, email, config, active',
            [nombre, rol, email, password, config]
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
        const { nombre, rol, email, config } = req.body;
        const result = await pool.query(
            'UPDATE usuarios SET nombre=$1, rol=$2, email=$3, config=$4 WHERE id=$5 RETURNING id, nombre, rol, email, config, active',
            [nombre, rol, email, config, id]
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
            'UPDATE usuarios SET active=false WHERE id=$1 RETURNING id, nombre, rol, email, active',
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