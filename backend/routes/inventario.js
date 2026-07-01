const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, adminOVendedor } = require('../middleware/authMiddleware');

// ============================================================
// GET /api/inventario
// Resumen de stock de todos los productos con estado
// ============================================================
/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Resumen de stock de todos los productos (excluye categoría "servicios")
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de inventario con estado de stock
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventarioResumen'
 *       401:
 *         description: Token requerido, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Token de autenticación requerido.'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error al obtener el inventario'
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.sku,
        p.nombre,
        p.categoria,
        p.stock,
        p.stock_minimo,
        p.activo,
        p.actualizado_en,
        CASE
          WHEN p.stock = 0                        THEN 'sin_stock'
          WHEN p.stock <= p.stock_minimo           THEN 'stock_bajo'
          ELSE                                          'normal'
        END AS estado_stock,
        (
          SELECT m.creado_en
          FROM movimientos_inventario m
          WHERE m.producto_id = p.id
          ORDER BY m.creado_en DESC
          LIMIT 1
        ) AS ultimo_movimiento
      FROM productos p
      WHERE p.categoria != 'servicios'
      ORDER BY estado_stock ASC, p.nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error GET /inventario:', error);
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
});

// ============================================================
// GET /api/inventario/alertas
// Solo productos con stock bajo o sin stock
// ============================================================
/**
 * @swagger
 * /api/inventario/alertas:
 *   get:
 *     summary: Listar productos con stock bajo o sin stock (alertas)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Productos en estado de alerta de stock
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 3 }
 *                   sku: { type: string, example: 'PROD-001' }
 *                   nombre: { type: string, example: 'Pantalla Samsung A52' }
 *                   categoria: { type: string, example: 'repuestos' }
 *                   stock: { type: integer, example: 2 }
 *                   stock_minimo: { type: integer, example: 5 }
 *                   estado_stock: { type: string, enum: [sin_stock, stock_bajo], example: 'stock_bajo' }
 *       401:
 *         description: Token requerido, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Token de autenticación requerido.'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error al obtener alertas de stock'
 */
router.get('/alertas', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.sku,
        p.nombre,
        p.categoria,
        p.stock,
        p.stock_minimo,
        CASE
          WHEN p.stock = 0             THEN 'sin_stock'
          WHEN p.stock <= p.stock_minimo THEN 'stock_bajo'
        END AS estado_stock
      FROM productos p
      WHERE p.activo = true
        AND p.categoria != 'servicios'
        AND p.stock <= p.stock_minimo
      ORDER BY p.stock ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error GET /inventario/alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas de stock' });
  }
});

// ============================================================
// GET /api/inventario/movimientos
// Historial completo de movimientos (con filtros opcionales)
// Query params: producto_id, tipo, desde, hasta, limit
// ============================================================
/**
 * @swagger
 * /api/inventario/movimientos:
 *   get:
 *     summary: Historial de movimientos de inventario (con filtros opcionales)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: integer
 *         description: Filtrar por producto
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [entrada, salida, ajuste]
 *         description: Filtrar por tipo de movimiento
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial del rango
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final del rango
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Máximo de registros a devolver (tope 500)
 *     responses:
 *       200:
 *         description: Historial de movimientos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MovimientoInventario'
 *       401:
 *         description: Token requerido, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Token de autenticación requerido.'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error al obtener el historial de movimientos'
 */
router.get('/movimientos', verifyToken, async (req, res) => {
  try {
    const { producto_id, tipo, desde, hasta, limit = 100 } = req.query;

    const condiciones = [];
    const valores = [];
    let idx = 1;

    if (producto_id) {
      condiciones.push(`m.producto_id = $${idx++}`);
      valores.push(parseInt(producto_id));
    }
    if (tipo && ['entrada', 'salida', 'ajuste'].includes(tipo)) {
      condiciones.push(`m.tipo = $${idx++}`);
      valores.push(tipo);
    }
    if (desde) {
      condiciones.push(`m.creado_en >= $${idx++}`);
      valores.push(new Date(desde));
    }
    if (hasta) {
      condiciones.push(`m.creado_en <= $${idx++}`);
      valores.push(new Date(hasta));
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    valores.push(Math.min(parseInt(limit), 500));
    const limitIdx = idx;

    const result = await pool.query(`
      SELECT
        m.id,
        m.tipo,
        m.cantidad,
        m.stock_antes,
        m.stock_despues,
        m.motivo,
        m.creado_en,
        p.id        AS producto_id,
        p.sku       AS producto_sku,
        p.nombre    AS producto_nombre,
        u.nombre    AS usuario_nombre
      FROM movimientos_inventario m
      JOIN productos p ON p.id = m.producto_id
      LEFT JOIN usuarios u ON u.id = m.usuario_id
      ${where}
      ORDER BY m.creado_en DESC
      LIMIT $${limitIdx}
    `, valores);

    res.json(result.rows);
  } catch (error) {
    console.error('Error GET /inventario/movimientos:', error);
    res.status(500).json({ error: 'Error al obtener el historial de movimientos' });
  }
});

// ============================================================
// GET /api/inventario/movimientos/:productoId
// Historial de movimientos de un producto específico
// ============================================================
/**
 * @swagger
 * /api/inventario/movimientos/{productoId}:
 *   get:
 *     summary: Historial de movimientos de un producto específico (últimos 50)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto y su historial de movimientos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 producto:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 3 }
 *                     nombre: { type: string, example: 'Pantalla Samsung A52' }
 *                     sku: { type: string, example: 'PROD-001' }
 *                 movimientos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MovimientoInventario'
 *       401:
 *         description: Token requerido, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Token de autenticación requerido.'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Producto no encontrado'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error al obtener movimientos del producto'
 */
router.get('/movimientos/:productoId', verifyToken, async (req, res) => {
  try {
    const { productoId } = req.params;

    // Verificar que el producto existe
    const prod = await pool.query('SELECT id, nombre, sku FROM productos WHERE id = $1', [productoId]);
    if (!prod.rows.length) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const result = await pool.query(`
      SELECT
        m.id,
        m.tipo,
        m.cantidad,
        m.stock_antes,
        m.stock_despues,
        m.motivo,
        m.creado_en,
        u.nombre AS usuario_nombre
      FROM movimientos_inventario m
      LEFT JOIN usuarios u ON u.id = m.usuario_id
      WHERE m.producto_id = $1
      ORDER BY m.creado_en DESC
      LIMIT 50
    `, [productoId]);

    res.json({
      producto: prod.rows[0],
      movimientos: result.rows
    });
  } catch (error) {
    console.error('Error GET /inventario/movimientos/:productoId:', error);
    res.status(500).json({ error: 'Error al obtener movimientos del producto' });
  }
});

// ============================================================
// POST /api/inventario/movimientos
// Registrar un movimiento y actualizar el stock del producto
// Body: { producto_id, tipo, cantidad, motivo }
// ============================================================
/**
 * @swagger
 * /api/inventario/movimientos:
 *   post:
 *     summary: Registrar un movimiento de inventario (entrada, salida o ajuste) y actualizar el stock
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimientoInventarioInput'
 *     responses:
 *       201:
 *         description: Movimiento registrado y stock actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movimiento:
 *                   $ref: '#/components/schemas/MovimientoInventario'
 *                 stock_actualizado: { type: integer, example: 15 }
 *                 mensaje: { type: string, example: 'Movimiento registrado. Stock de "Pantalla Samsung A52": 5 → 15 uds.' }
 *       400:
 *         description: Datos inválidos o stock insuficiente para una salida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Stock insuficiente. Stock actual: 4 uds. Cantidad solicitada: 10 uds.'
 *       401:
 *         description: Token requerido, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Token de autenticación requerido.'
 *       403:
 *         description: Se requiere rol Administrador o Vendedor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Acceso denegado. Se requiere rol de Administrador o Vendedor.'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'El producto seleccionado no existe'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error al registrar el movimiento: la conexión con la base de datos falló.'
 */
router.post('/movimientos', verifyToken, adminOVendedor, async (req, res) => {
  const client = await pool.connect();
  try {
    const { producto_id, tipo, cantidad, motivo } = req.body;

    // --- Validaciones ---
    if (!producto_id || !tipo || !cantidad) {
      return res.status(400).json({ error: 'Los campos producto, tipo y cantidad son obligatorios' });
    }
    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return res.status(400).json({ error: 'El tipo de movimiento debe ser: entrada, salida o ajuste' });
    }
    const cant = parseInt(cantidad);
    if (isNaN(cant) || cant <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser un número entero positivo' });
    }

    await client.query('BEGIN');

    // Bloqueo para evitar condiciones de carrera
    const prodResult = await client.query(
      'SELECT id, nombre, sku, stock FROM productos WHERE id = $1 FOR UPDATE',
      [producto_id]
    );
    if (!prodResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'El producto seleccionado no existe' });
    }

    const producto = prodResult.rows[0];
    const stockAntes = producto.stock;
    let stockDespues;

    if (tipo === 'entrada') {
      stockDespues = stockAntes + cant;
    } else if (tipo === 'salida') {
      if (stockAntes < cant) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Stock insuficiente. Stock actual: ${stockAntes} uds. Cantidad solicitada: ${cant} uds.`
        });
      }
      stockDespues = stockAntes - cant;
    } else {
      // ajuste: la cantidad es el nuevo valor absoluto de stock
      stockDespues = cant;
    }

    // Actualizar stock del producto
    await client.query(
      'UPDATE productos SET stock = $1, actualizado_en = NOW() WHERE id = $2',
      [stockDespues, producto_id]
    );

    // Registrar el movimiento
    const movResult = await client.query(`
      INSERT INTO movimientos_inventario
        (producto_id, tipo, cantidad, stock_antes, stock_despues, motivo, usuario_id, creado_en)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [
      producto_id,
      tipo,
      tipo === 'ajuste' ? Math.abs(stockDespues - stockAntes) || 1 : cant,
      stockAntes,
      stockDespues,
      motivo || null,
      req.user.id
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      movimiento: movResult.rows[0],
      stock_actualizado: stockDespues,
      mensaje: `Movimiento registrado. Stock de "${producto.nombre}": ${stockAntes} → ${stockDespues} uds.`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error POST /inventario/movimientos:', error);
    res.status(500).json({ error: 'Error al registrar el movimiento: ' + error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
