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
 * get:
 * summary: Resumen de stock de todos los productos (excluye categoría "servicios")
 * tags: [Inventario]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Resumen de inventario con estado de stock
 * 500:
 * description: Error interno del servidor
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.sku,
        p.nombre,
        p.categoria,
        COALESCE(p.stock, 0) AS stock,
        COALESCE(p.stock_minimo, 1) AS stock_minimo,
        p.activo,
        COALESCE(p.actualizado_en, p.creado_en) AS actualizado_en,
        CASE
          WHEN COALESCE(p.stock, 0) = 0                  THEN 'sin_stock'
          WHEN COALESCE(p.stock, 0) <= COALESCE(p.stock_minimo, 1) THEN 'stock_bajo'
          ELSE                                                    'normal'
        END AS estado_stock,
        COALESCE(
          (
            SELECT m.creado_en
            FROM movimientos_inventario m
            WHERE m.producto_id = p.id
            ORDER BY m.creado_en DESC
            LIMIT 1
          ), 
          p.creado_en
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
 * get:
 * summary: Listar productos con stock bajo o sin stock (alertas)
 * tags: [Inventario]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Productos en estado de alerta de stock
 * 500:
 * description: Error interno del servidor
 */
router.get('/alertas', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.sku,
        p.nombre,
        p.categoria,
        COALESCE(p.stock, 0) AS stock,
        COALESCE(p.stock_minimo, 1) AS stock_minimo,
        CASE
          WHEN COALESCE(p.stock, 0) = 0 THEN 'sin_stock'
          WHEN COALESCE(p.stock, 0) <= COALESCE(p.stock_minimo, 1) THEN 'stock_bajo'
        END AS estado_stock
      FROM productos p
      WHERE p.activo = true
        AND p.categoria != 'servicios'
        AND COALESCE(p.stock, 0) <= COALESCE(p.stock_minimo, 1)
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
// ============================================================
/**
 * @swagger
 * /api/inventario/movimientos:
 * get:
 * summary: Historial de movimientos de inventario (con filtros opcionales)
 * tags: [Inventario]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Historial de movimientos
 * 500:
 * description: Error interno del servidor
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
        COALESCE(m.motivo, 'Sin motivo especificado') AS motivo,
        m.creado_en,
        p.id        AS producto_id,
        p.sku       AS producto_sku,
        p.nombre    AS producto_nombre,
        COALESCE(u.nombre, 'Sistema / Remoto') AS usuario_nombre
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
 * get:
 * summary: Historial de movimientos de un producto específico (últimos 50)
 * tags: [Inventario]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Producto y su historial de movimientos
 * 404:
 * description: Producto no encontrado
 */
router.get('/movimientos/:productoId', verifyToken, async (req, res) => {
  try {
    const { productoId } = req.params;

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
        COALESCE(m.motivo, 'Sin motivo especificado') AS motivo,
        m.creado_en,
        COALESCE(u.nombre, 'Sistema / Remoto') AS usuario_nombre
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
// ============================================================
/**
 * @swagger
 * /api/inventario/movimientos:
 * post:
 * summary: Registrar un movimiento de inventario y actualizar el stock
 * tags: [Inventario]
 * security:
 * - bearerAuth: []
 * responses:
 * 201:
 * description: Movimiento registrado con éxito
 * 400:
 * description: Datos inválidos o stock insuficiente
 */
router.post('/movimientos', verifyToken, adminOVendedor, async (req, res) => {
  const client = await pool.connect();
  try {
    const { producto_id, tipo, cantidad, motivo } = req.body;

    // Validar existencia de parámetros de forma segura (permitiendo el número 0)
    if (producto_id === undefined || !tipo || cantidad === undefined) {
      return res.status(400).json({ error: 'Los campos producto, tipo y cantidad son obligatorios' });
    }
    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return res.status(400).json({ error: 'El tipo de movimiento debe ser: entrada, salida o ajuste' });
    }

    const cant = parseInt(cantidad, 10);
    if (isNaN(cant)) {
      return res.status(400).json({ error: 'La cantidad debe ser un número entero válido' });
    }

    // Reglas de negocio para las cantidades según tipo de movimiento
    if (tipo !== 'ajuste' && cant <= 0) {
      return res.status(400).json({ error: 'La cantidad para entradas o salidas debe ser mayor a 0' });
    }
    if (tipo === 'ajuste' && cant < 0) {
      return res.status(400).json({ error: 'El stock de ajuste no puede ser un número negativo' });
    }

    await client.query('BEGIN');

    // Forzar bloqueo de fila para transacciones simultáneas limpias
    const prodResult = await client.query(
      'SELECT id, nombre, sku, COALESCE(stock, 0) AS stock FROM productos WHERE id = $1 FOR UPDATE',
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
      // Ajuste: El valor enviado se vuelve el nuevo stock total absoluto
      stockDespues = cant;
    }

    // Actualizar la tabla de productos
    await client.query(
      'UPDATE productos SET stock = $1, actualizado_en = NOW() WHERE id = $2',
      [stockDespues, producto_id]
    );

    // Calcular la variación real del ajuste para la bitácora
    const deltaCantidad = tipo === 'ajuste' ? Math.abs(stockDespues - stockAntes) : cant;

    // Guardar el historial sin nulos críticos en usuario_id o motivo
    const movResult = await client.query(`
      INSERT INTO movimientos_inventario
        (producto_id, tipo, cantidad, stock_antes, stock_despues, motivo, usuario_id, creado_en)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [
      producto_id,
      tipo,
      deltaCantidad === 0 ? 1 : deltaCantidad, // Evita registrar movimientos de 0 unidades
      stockAntes,
      stockDespues,
      motivo ? motivo.trim() : 'Ajuste manual de inventario',
      req.user?.id || req.user?.usuario_id || null
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      movimiento: {
        ...movResult.rows[0],
        motivo: movResult.rows[0].motivo || 'Ajuste manual de inventario'
      },
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