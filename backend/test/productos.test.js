const request = require('supertest');
const express = require('express');
const productosRoutes = require('../routes/productos');

const app = express();
app.use(express.json());
app.use('/api/productos', productosRoutes);

describe('Pruebas de Productos', () => {
    let testId;

    
    describe('GET /api/productos', () => {
        it('deberia retornar todos los productos', async () => {
            const res = await request(app).get('/api/productos');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/productos', () => {
        it('deberia crear un producto correctamente', async () => {
            const res = await request(app)
                .post('/api/productos')
                .send({
                    sku: 'TEST-999',
                    nombre: 'Producto de prueba',
                    categoria: 'electronicos',
                    stock: 10,
                    stock_minimo: 2,
                    precio_venta: 100000
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            testId = res.body.id;
        });
    });

    describe('GET /api/productos/:id', () => {
        it('deberia retornar un producto por id', async () => {
            const res = await request(app).get(`/api/productos/${testId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', testId);
        });
    });

    describe('PUT /api/productos/:id', () => {
        it('deberia actualizar un producto correctamente', async () => {
            const res = await request(app)
                .put(`/api/productos/${testId}`)
                .send({
                    sku: 'TEST-999',
                    nombre: 'Producto actualizado',
                    categoria: 'repuestos',
                    stock: 20,
                    stock_minimo: 5,
                    precio_venta: 150000
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('nombre', 'Producto actualizado');
        });
    });

    describe('DELETE /api/productos/:id', () => {
        it('deberia desactivar un producto correctamente', async () => {
            const res = await request(app).delete(`/api/productos/${testId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('mensaje', 'Producto desactivado correctamente');
        });
    });
});