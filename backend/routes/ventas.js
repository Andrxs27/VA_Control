const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==========================================
// GET / — Listar todas las ventas con nombre de cliente y vendedor
// ==========================================
/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Listar todas las ventas (incluye nombre de cliente y vendedor)
 *     tags: [Ventas]
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al obtener las ventas.'
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                v.*,
                u.nombre AS vendedor_nombre,
                c.nombre AS cliente_nombre
            FROM ventas v
            LEFT JOIN usuarios u ON u.id = v.vendedor_id
            LEFT JOIN clientes c ON c.id = v.cliente_id
            ORDER BY v.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// GET /:id — Obtener una venta por ID
// ==========================================
/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener una venta por ID
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Venta no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al obtener la venta.'
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                v.*,
                u.nombre AS vendedor_nombre,
                c.nombre AS cliente_nombre
            FROM ventas v
            LEFT JOIN usuarios u ON u.id = v.vendedor_id
            LEFT JOIN clientes c ON c.id = v.cliente_id
            WHERE v.id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// GET /:id/detalles — Obtener líneas de detalle de una venta
// ==========================================
/**
 * @swagger
 * /api/ventas/{id}/detalles:
 *   get:
 *     summary: Obtener las líneas de detalle (productos) de una venta
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la venta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 1 }
 *                   venta_id: { type: integer, example: 1 }
 *                   producto_id: { type: integer, example: 3 }
 *                   producto_nombre: { type: string, example: 'Pantalla Samsung A52' }
 *                   producto_referencia: { type: string, example: 'PROD-001' }
 *                   cantidad: { type: integer, example: 2 }
 *                   precio_unitario: { type: number, example: 85000 }
 *                   descuento_item: { type: number, example: 0 }
 *                   subtotal: { type: number, example: 170000 }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al obtener el detalle de la venta.'
 */
router.get('/:id/detalles', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                dv.*,
                p.nombre AS producto_nombre,
                p.referencia AS producto_referencia
            FROM detalle_venta dv
            JOIN productos p ON p.id = dv.producto_id
            WHERE dv.venta_id = $1
            ORDER BY dv.id ASC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// POST / — Crear venta + detalles (transacción atómica)
// ==========================================
/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Crear una venta junto con sus líneas de detalle (transacción atómica, descuenta stock)
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VentaInput'
 *     responses:
 *       201:
 *         description: Venta creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       400:
 *         description: La venta no tiene productos en el detalle
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'La venta debe tener al menos un producto en el detalle'
 *       500:
 *         description: Error interno o stock insuficiente (rollback automático)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al crear la venta. Stock insuficiente o datos inválidos.'
 */
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            vendedor_id, cliente_id, subtotal, descuento = 0,
            impuestos, total, metodo_pago, estado = 'completada',
            notas, detalles = []
        } = req.body;

        if (!detalles || detalles.length === 0) {
            return res.status(400).json({ error: 'La venta debe tener al menos un producto en el detalle' });
        }

        await client.query('BEGIN');

        // 1. Insertar cabecera de la venta
        const ventaResult = await client.query(
            `INSERT INTO ventas 
                (vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas, creado_en)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
            [vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas]
        );
        const ventaId = ventaResult.rows[0].id;

        // 2. Insertar cada línea de detalle y descontar stock
        for (const item of detalles) {
            const { producto_id, cantidad, precio_unitario, descuento_item = 0 } = item;
            const subtotalItem = (precio_unitario * cantidad) - descuento_item;

            // Verificar stock disponible (lock row para evitar race condition)
            const stockResult = await client.query(
                'SELECT stock FROM productos WHERE id = $1 FOR UPDATE',
                [producto_id]
            );
            if (stockResult.rows.length === 0) {
                throw new Error(`Producto ID ${producto_id} no existe`);
            }
            const stockActual = stockResult.rows[0].stock;
            if (stockActual < cantidad) {
                throw new Error(`Stock insuficiente para producto ID ${producto_id}. Disponible: ${stockActual}`);
            }

            // Insertar línea de detalle
            await client.query(
                `INSERT INTO detalle_venta 
                    (venta_id, producto_id, cantidad, precio_unitario, descuento_item, subtotal)
                 VALUES ($1,$2,$3,$4,$5,$6)`,
                [ventaId, producto_id, cantidad, precio_unitario, descuento_item, subtotalItem]
            );

            // Descontar stock del producto
            await client.query(
                'UPDATE productos SET stock = stock - $1 WHERE id = $2',
                [cantidad, producto_id]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(ventaResult.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// ==========================================
// PUT /:id — Actualizar solo los campos de cabecera
// ==========================================
/**
 * @swagger
 * /api/ventas/{id}:
 *   put:
 *     summary: Actualizar los campos de cabecera de una venta (no modifica el detalle ni el stock)
 *     tags: [Ventas]
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
 *             type: object
 *             properties:
 *               vendedor_id: { type: integer, example: 2 }
 *               cliente_id: { type: integer, example: 1 }
 *               subtotal: { type: number, example: 170000 }
 *               descuento: { type: number, example: 0 }
 *               impuestos: { type: number, example: 0 }
 *               total: { type: number, example: 170000 }
 *               metodo_pago: { type: string, example: 'efectivo' }
 *               estado: { type: string, example: 'completada' }
 *               notas: { type: string, example: 'Cliente confirmó pago' }
 *     responses:
 *       200:
 *         description: Venta actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Venta no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al actualizar la venta.'
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas } = req.body;
        const result = await pool.query(
            `UPDATE ventas 
             SET vendedor_id=$1, cliente_id=$2, subtotal=$3, descuento=$4, impuestos=$5,
                 total=$6, metodo_pago=$7, estado=$8, notas=$9
             WHERE id=$10 RETURNING *`,
            [vendedor_id, cliente_id, subtotal, descuento, impuestos, total, metodo_pago, estado, notas, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// DELETE /:id — Eliminar venta (los detalles se borran por CASCADE)
// El stock se restaura automáticamente antes de eliminar
// ==========================================
/**
 * @swagger
 * /api/ventas/{id}:
 *   delete:
 *     summary: Eliminar una venta (restaura el stock de los productos automáticamente)
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta eliminada y stock restaurado correctamente
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Venta no encontrada'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error interno del servidor al eliminar la venta.'
 */
router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        // Recuperar detalles para restaurar stock
        const detalles = await client.query(
            'SELECT producto_id, cantidad FROM detalle_venta WHERE venta_id = $1',
            [id]
        );

        // Restaurar stock de cada producto
        for (const item of detalles.rows) {
            await client.query(
                'UPDATE productos SET stock = stock + $1 WHERE id = $2',
                [item.cantidad, item.producto_id]
            );
        }

        // Eliminar la venta (detalle_venta se borra por ON DELETE CASCADE)
        const result = await client.query('DELETE FROM ventas WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        await client.query('COMMIT');
        res.json({ mensaje: 'Venta eliminada y stock restaurado correctamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;