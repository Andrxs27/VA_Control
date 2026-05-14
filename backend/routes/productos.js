const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'va_control_db',
    password: '123456',
    port: 5432,
});

// GET ALL - Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET BY ID - Obtener un producto por id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Crear un producto
router.post('/', async (req, res) => {
    try {
        const { sku, nombre, categoria, stock, stock_minimo, precio_venta } = req.body;
        const result = await pool.query(
            'INSERT INTO productos (sku, nombre, categoria, stock, stock_minimo, precio_venta, activo) VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *',
            [sku, nombre, categoria, stock, stock_minimo, precio_venta]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, nombre, categoria, stock, stock_minimo, precio_venta } = req.body;
        const result = await pool.query(
            'UPDATE productos SET sku=$1, nombre=$2, categoria=$3, stock=$4, stock_minimo=$5, precio_venta=$6 WHERE id=$7 RETURNING *',
            [sku, nombre, categoria, stock, stock_minimo, precio_venta, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Desactivar un producto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE productos SET activo=false WHERE id=$1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;