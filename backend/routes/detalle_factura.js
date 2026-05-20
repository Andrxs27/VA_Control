const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM detalle_factura');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM detalle_factura WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Detalle no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { factura_id, producto_id, cantidad, precio_unitario } = req.body;
        const result = await pool.query(
            'INSERT INTO detalle_factura (factura_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
            [factura_id, producto_id, cantidad, precio_unitario]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, precio_unitario } = req.body;
        const result = await pool.query(
            'UPDATE detalle_factura SET cantidad=$1, precio_unitario=$2 WHERE id=$3 RETURNING *',
            [cantidad, precio_unitario, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Detalle no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM detalle_factura WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Detalle no encontrado' });
        res.json({ mensaje: 'Detalle eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;