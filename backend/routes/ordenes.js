const express = require('express');
const router = express.Router();
const pool = require('../db');

// CRUD - GET Todas las órdenes
/**
 * @swagger
 * /api/ordenes:
 *   get:
 *     summary: Listar todas las órdenes de servicio
 *     tags: [Órdenes de servicio]
 *     responses:
 *       200:
 *         description: Lista de órdenes de servicio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrdenServicio'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al obtener las órdenes.'
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ordenes_servicio ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - GET por ID
/**
 * @swagger
 * /api/ordenes/{id}:
 *   get:
 *     summary: Obtener una orden de servicio por ID
 *     tags: [Órdenes de servicio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenServicio'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Orden no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al obtener la orden.'
 */
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
/**
 * @swagger
 * /api/ordenes:
 *   post:
 *     summary: Crear una nueva orden de servicio
 *     tags: [Órdenes de servicio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenServicioInput'
 *     responses:
 *       201:
 *         description: Orden creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenServicio'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al crear la orden.'
 */
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
/**
 * @swagger
 * /api/ordenes/{id}:
 *   put:
 *     summary: Actualizar una orden de servicio existente
 *     tags: [Órdenes de servicio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenServicioInput'
 *     responses:
 *       200:
 *         description: Orden actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenServicio'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Orden no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al actualizar la orden.'
 */
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
/**
 * @swagger
 * /api/ordenes/{id}:
 *   delete:
 *     summary: Eliminar una orden de servicio
 *     tags: [Órdenes de servicio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden eliminada correctamente
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Orden no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al eliminar la orden.'
 */
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