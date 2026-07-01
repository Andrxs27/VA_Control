const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// CRUD - GET 
/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Listar todas las facturas
 *     tags: [Facturas]
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al obtener las facturas.'
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM facturas');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - GET id
/**
 * @swagger
 * /api/facturas/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Factura no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al obtener la factura.'
 */
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
/**
 * @swagger
 * /api/facturas:
 *   post:
 *     summary: Crear una nueva factura (asociada a una venta o a una orden de servicio)
 *     tags: [Facturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FacturaInput'
 *     responses:
 *       201:
 *         description: Factura creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al crear la factura.'
 */
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
/**
 * @swagger
 * /api/facturas/{id}:
 *   put:
 *     summary: Actualizar una factura existente
 *     tags: [Facturas]
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
 *             $ref: '#/components/schemas/FacturaInput'
 *     responses:
 *       200:
 *         description: Factura actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Factura no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al actualizar la factura.'
 */
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
/**
 * @swagger
 * /api/facturas/{id}:
 *   delete:
 *     summary: Eliminar una factura
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factura eliminada correctamente
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Factura no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al eliminar la factura.'
 */
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