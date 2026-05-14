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
        const result = await pool.query('SELECT * FROM clientes');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET BY ID 
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST
router.post('/', async (req, res) => {
    try {
        const { nombre, identificacion, telefono, correo, direccion } = req.body;
        const result = await pool.query(
            'INSERT INTO clientes (nombre, identificacion, telefono, correo, direccion, creado_en) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [nombre, identificacion, telefono, correo, direccion]
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
        const { nombre, identificacion, telefono, correo, direccion } = req.body;
        const result = await pool.query(
            'UPDATE clientes SET nombre=$1, identificacion=$2, telefono=$3, correo=$4, direccion=$5 WHERE id=$6 RETURNING *',
            [nombre, identificacion, telefono, correo, direccion, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
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
            'DELETE FROM clientes WHERE id=$1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;