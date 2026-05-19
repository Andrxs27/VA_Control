const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ordenes_servicio');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM ordenes_servicio WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { cliente_id, tecnico_id, equipo, falla, estado, tipo_entrega, fecha_promesa } = req.body;
        const result = await pool.query(
            'INSERT INTO ordenes_servicio (cliente_id, tecnico_id, equipo, falla, estado, tipo_entrega, fecha_promesa) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [cliente_id, tecnico_id, equipo, falla, estado, tipo_entrega, fecha_promesa]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente_id, tecnico_id, equipo, falla, estado, tipo_entrega, fecha_promesa } = req.body;
        const result = await pool.query(
            'UPDATE ordenes_servicio SET cliente_id=$1, tecnico_id=$2, equipo=$3, falla=$4, estado=$5, tipo_entrega=$6, fecha_promesa=$7 WHERE id=$8 RETURNING *',
            [cliente_id, tecnico_id, equipo, falla, estado, tipo_entrega, fecha_promesa, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM ordenes_servicio WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });
        res.json({ mensaje: 'Orden eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;