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
        const result = await pool.query('SELECT * FROM facturas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET BY ID 
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM facturas WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST 

router.post('/', async (req, res) => {
    try {
        const { venta_id, detalle_productos, impuestos } = req.body;
        const result = await pool.query(
            'INSERT INTO facturas (venta_id, detalle_productos, impuestos, fecha_emision) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [venta_id, JSON.stringify(detalle_productos), impuestos]
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
        const { detalle_productos, impuestos } = req.body;
        const result = await pool.query(
            'UPDATE facturas SET detalle_productos=$1, impuestos=$2 WHERE id=$3 RETURNING *',
            [JSON.stringify(detalle_productos), impuestos, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
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
            'DELETE FROM facturas WHERE id=$1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }
        res.json({ mensaje: 'Factura eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;