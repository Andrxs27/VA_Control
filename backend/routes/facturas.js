const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// CRUD - GET 
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM facturas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - GET id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM facturas WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - POST
router.post('/', async (req, res) => {
    try {
        const { venta_id, orden_servicio_id, subtotal, descuento, impuestos, total, notas } = req.body;
        const result = await pool.query(
            `INSERT INTO facturas (venta_id, orden_servicio_id, subtotal, descuento, impuestos, total, notas, fecha_emision)
            VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`,
            [venta_id || null, orden_servicio_id || null, parseFloat(subtotal) || 0,
            parseFloat(descuento) || 0, parseFloat(impuestos) || 0, parseFloat(total) || 0, notas || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("ERROR POST FACTURAS:", error);
        res.status(500).json({ error: error.message });
    }
});

// CRUD - PUT
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { venta_id, orden_servicio_id, subtotal, descuento, impuestos, total, notas } = req.body;
        const result = await pool.query(
            `UPDATE facturas SET venta_id=$1, orden_servicio_id=$2, subtotal=$3,
            descuento=$4, impuestos=$5, total=$6, notas=$7 WHERE id=$8 RETURNING *`,
            [venta_id || null, orden_servicio_id || null, subtotal, descuento, impuestos, total, notas || '', id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - DELETE (esta si la elimina)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM facturas WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json({ mensaje: 'Factura eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;