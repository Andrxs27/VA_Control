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
        const { vendedor_id, cliente_id, total, metodo_pago } = req.body;
        const result = await pool.query(
            'INSERT INTO ventas (vendedor_id, cliente_id, total, metodo_pago, creado_en) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [vendedor_id, cliente_id, total, metodo_pago]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { vendedor_id, cliente_id, total, metodo_pago } = req.body;
        const result = await pool.query(
            'UPDATE ventas SET vendedor_id=$1, cliente_id=$2, total=$3, metodo_pago=$4 WHERE id=$5 RETURNING *',
            [vendedor_id, cliente_id, total, metodo_pago, id]
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
        const result = await pool.query('DELETE FROM ventas WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json({ mensaje: 'Venta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;