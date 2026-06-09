const express = require('express');
const router = express.Router();
const pool = require('../db');

// CRUD - GET Todas las órdenes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ordenes_servicio ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - GET por ID
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

// CRUD - POST (Crear nueva orden)
router.post('/', async (req, res) => {
    try {
        const { 
            cliente_id, tecnico_id, equipo, marca, modelo, 
            serial_equipo, falla, diagnostico, estado, tipo_entrega, 
            fecha_promesa, costo_servicio, notas 
        } = req.body;

        const result = await pool.query(
            `INSERT INTO ordenes_servicio (
                cliente_id, tecnico_id, equipo, marca, modelo, 
                serial_equipo, falla, diagnostico, estado, tipo_entrega, 
                fecha_promesa, costo_servicio, notas, creado_en, actualizado_en
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING *`,
            [
                cliente_id, tecnico_id, equipo, marca, modelo, 
                serial_equipo, falla, diagnostico || '', estado, tipo_entrega, 
                fecha_promesa, costo_servicio, notas
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - PUT (Actualizar orden existente)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            cliente_id, tecnico_id, equipo, marca, modelo, 
            serial_equipo, falla, diagnostico, estado, tipo_entrega, 
            fecha_promesa, costo_servicio, notas 
        } = req.body;

        const result = await pool.query(
            `UPDATE ordenes_servicio SET 
                cliente_id=$1, tecnico_id=$2, equipo=$3, marca=$4, modelo=$5, 
                serial_equipo=$6, falla=$7, diagnostico=$8, estado=$9, tipo_entrega=$10, 
                fecha_promesa=$11, costo_servicio=$12, notas=$13, actualizado_en=NOW() 
             WHERE id=$14 RETURNING *`,
            [
                cliente_id, tecnico_id, equipo, marca, modelo, 
                serial_equipo, falla, diagnostico, estado, tipo_entrega, 
                fecha_promesa, costo_servicio, notas, id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - DELETE
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM ordenes_servicio WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });
        res.json({ mensaje: 'Orden eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;