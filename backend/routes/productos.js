const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// CRUD - GET
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - GET id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - POST
router.post('/', async (req, res) => {
    try {
        const { sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta } = req.body;
        const result = await pool.query(
            'INSERT INTO productos (sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta, activo, creado_en, actualizado_en) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()) RETURNING *',
            [sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - PUT
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta } = req.body;
        const result = await pool.query(
            'UPDATE productos SET sku=$1, nombre=$2, descripcion=$3, categoria=$4, stock=$5, stock_minimo=$6, precio_venta=$7, actualizado_en=NOW() WHERE id=$8 RETURNING *',
            [sku, nombre, descripcion, categoria, stock, stock_minimo, precio_venta, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD - DELETE ( lo desactiva pero no lo borra)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('UPDATE productos SET activo=false WHERE id=$1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ mensaje: 'Producto desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;