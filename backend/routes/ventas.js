const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ventas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas } = req.body;
        const result = await pool.query(
            'INSERT INTO ventas (vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas, creado_en) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *',
            [vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas } = req.body;
        const result = await pool.query(
            'UPDATE ventas SET vendedor_id=$1, cliente_id=$2, subtotal=$3, descuento=$4, impuestos=$5, total=$6, metodo_pago=$7, estado=$8, notas=$9 WHERE id=$10 RETURNING *',
            [vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM ventas WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json({ mensaje: 'Venta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;