const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nombre, email, telefono, direccion, notas } = req.body;
        const result = await pool.query(
            'INSERT INTO clientes (nombre, email, telefono, direccion, notas, activo, creado_en, actualizado_en) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING *',
            [nombre, email, telefono, direccion, notas]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, telefono, direccion, notas } = req.body;
        const result = await pool.query(
            'UPDATE clientes SET nombre=$1, email=$2, telefono=$3, direccion=$4, notas=$5, actualizado_en=NOW() WHERE id=$6 RETURNING *',
            [nombre, email, telefono, direccion, notas, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('UPDATE clientes SET activo=false WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ mensaje: 'Cliente desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;