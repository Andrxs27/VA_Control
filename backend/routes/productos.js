const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// CRUD - GET ALL
/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error al obtener los productos de la base de datos'
 */
router.get('/', async (req, res) => {
    try {
        // Traemos ordenados para mantener la consistencia visual en la tabla
        const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error en GET /productos:", error);
        res.status(500).json({ error: 'Error al obtener los productos de la base de datos' });
    }
});

// CRUD - GET BY ID
/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'El producto solicitado no existe'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error al obtener el producto.'
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'El producto solicitado no existe' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error en GET /productos/:id:", error);
        res.status(500).json({ error: error.message });
    }
});

// CRUD - POST (Crear)
/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: SKU/nombre faltante o SKU duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'El SKU "PROD-001" ya se encuentra registrado'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'No se pudo crear el producto: error de conexión con la base de datos.'
 */
router.post('/', async (req, res) => {
    try {
        const { sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta } = req.body;
        
        // Validación rápida en backend
        if (!sku || !nombre) {
            return res.status(400).json({ error: 'El SKU y el Nombre son obligatorios' });
        }

        // Validación preventiva de duplicado de SKU
        const existeSku = await pool.query('SELECT id FROM productos WHERE sku = $1', [sku]);
        if (existeSku.rows.length > 0) {
            return res.status(400).json({ error: `El SKU "${sku}" ya se encuentra registrado` });
        }

        const result = await pool.query(
            `INSERT INTO productos (sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta, activo, creado_en, actualizado_en) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()) RETURNING *`,
            [sku, nombre, descripcion || '', categoria, stock || 0, stock_minimo || 0, precio_venta || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error en POST /productos:", error);
        res.status(500).json({ error: 'No se pudo crear el producto: ' + error.message });
    }
});

// CRUD - PUT (Actualizar)
/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar un producto existente
 *     tags: [Productos]
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
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: SKU ya usado por otro producto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'El SKU "PROD-001" ya está siendo usado por otro producto'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Producto no encontrado para actualizar'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Error al actualizar el producto: tipo de dato inválido en el campo precio_venta.'
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta } = req.body;

        // Comprobar si el SKU lo tiene otro producto diferente
        const skuDuplicado = await pool.query('SELECT id FROM productos WHERE sku = $1 AND id <> $2', [sku, id]);
        if (skuDuplicado.rows.length > 0) {
            return res.status(400).json({ error: `El SKU "${sku}" ya está siendo usado por otro producto` });
        }

        const result = await pool.query(
            `UPDATE productos 
            SET sku=$1, nombre=$2, descripcion=$3, categoria=$4, stock=$5, stock_minimo=$6, precio_venta=$7, actualizado_en=NOW() 
             WHERE id=$8 RETURNING *`,
            [sku, nombre, descripcion || '', categoria, stock || 0, stock_minimo || 0, precio_venta || 0, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado para actualizar' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error en PUT /productos/:id:", error);
        res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
    }
});

// NUEVA RUTA: PATCH (Activar / Desactivar de forma lógica)
/**
 * @swagger
 * /api/productos/{id}/estado:
 *   patch:
 *     summary: Activar o desactivar un producto (borrado lógico)
 *     tags: [Productos]
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
 *               activo:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
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
 *               error: 'Error al actualizar el estado del producto'
 */
router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body; // Recibe true o false desde el frontend

        const result = await pool.query(
            'UPDATE productos SET activo=$1, actualizado_en=NOW() WHERE id=$2 RETURNING *', 
            [activo, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'El producto seleccionado no existe' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error en PATCH /productos/:id/estado:", error);
        res.status(500).json({ error: 'Error al actualizar el estado del producto' });
    }
});

// CRUD - DELETE (Eliminación física real de la base de datos)
/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto permanentemente
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
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
 *               error: 'Error al eliminar permanentemente el producto'
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Cambiado de UPDATE a DELETE real
        const result = await pool.query('DELETE FROM productos WHERE id=$1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'El producto seleccionado no existe' });
        }
        res.json({ mensaje: 'Producto eliminado permanentemente del sistema' });
    } catch (error) {
        console.error("Error en DELETE /productos/:id:", error);
        res.status(500).json({ error: 'Error al eliminar permanentemente el producto' });
    }
});

module.exports = router;