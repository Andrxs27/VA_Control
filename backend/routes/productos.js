const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// CRUD - GET ALL
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

// CRUD - DELETE (Desactivación lógica)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('UPDATE productos SET activo=false WHERE id=$1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'El producto seleccionado no existe' });
        }
        res.json({ mensaje: 'Producto inactivado correctamente del sistema' });
    } catch (error) {
        console.error("Error en DELETE /productos/:id:", error);
        res.status(500).json({ error: 'Error al procesar la baja del producto' });
    }
});

module.exports = router;