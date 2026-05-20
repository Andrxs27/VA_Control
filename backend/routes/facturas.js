const express = require('express');
const router = express.Router();
const pool = require('../db');



router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM facturas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

router.post('/', async (req, res) => {
    try {
        const { venta_id, orden_servicio_id, detalle_productos_json, impuestos } = req.body;
        const result = await pool.query(
            'INSERT INTO facturas (venta_id, orden_servicio_id, detalle_productos_json, impuestos, fecha_emision) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [venta_id, orden_servicio_id, JSON.stringify(detalle_productos_json), impuestos]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { detalle_productos_json, impuestos } = req.body;
        const result = await pool.query(
            'UPDATE facturas SET detalle_productos_json=$1, impuestos=$2 WHERE id=$3 RETURNING *',
            [JSON.stringify(detalle_productos_json), impuestos, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM facturas WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json({ mensaje: 'Factura eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;