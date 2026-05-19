const request = require('supertest');
const express = require('express');
const ordenesRoutes = require('../routes/ordenes');

const app = express();
app.use(express.json());
app.use('/api/ordenes', ordenesRoutes);

describe('Pruebas de ordenes de servicio', () => {
    let testId;

    // GET ALL
    describe('GET /api/ordenes', () => {
        it('debería retornar todas las ordenes', async () => {
            const res = await request(app).get('/api/ordenes');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // POST
    describe('POST /api/ordenes', () => {
        it('deberia crear una orden correctamente', async () => {
            const res = await request(app)
                .post('/api/ordenes')
                .send({
                    cliente_id: 4,
                    tecnico_id: 3,
                    equipo: 'iPhone 13 azul',
                    falla: 'bateria dañada',
                    estado: 'pendiente',
                    tipo_entrega: 'tienda',
                    fecha_promesa: '2026-05-30'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            testId = res.body.id;
        });
    });

    // GET BY ID
    describe('GET /api/ordenes/:id', () => {
        it('deberia retornar una orden por id', async () => {
            const res = await request(app).get(`/api/ordenes/${testId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', testId);
        });
    });

    // PUT
    describe('PUT /api/ordenes/:id', () => {
        it('deberia actualizar una orden correctamente', async () => {
            const res = await request(app)
                .put(`/api/ordenes/${testId}`)
                .send({
                    cliente_id: 4,
                    tecnico_id: 3,
                    equipo: 'iPhone 13 azul',
                    falla: 'bateria dañada',
                    estado: 'en_proceso',
                    tipo_entrega: 'tienda',
                    fecha_promesa: '2026-05-30'
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('estado', 'en_proceso');
        });
    });

    // DELETE
    describe('DELETE /api/ordenes/:id', () => {
        it('deberia eliminar una orden correctamente', async () => {
            const res = await request(app).delete(`/api/ordenes/${testId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('mensaje', 'Orden eliminada correctamente');
        });
    });
});