const request = require('supertest');
const express = require('express');
const ordenesRoutes = require('../routes/ordenes');

const app = express();
app.use(express.json());
app.use('/api/ordenes', ordenesRoutes);

describe('Pruebas de ordenes de servicio', () => {
    let testId;

    describe('GET /api/ordenes', () => {
        it('deberia retornar todas las ordenes', async () => {
            const res = await request(app).get('/api/ordenes');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/ordenes', () => {
        it('deberia crear una orden correctamente', async () => {
            const res = await request(app)
                .post('/api/ordenes')
                .send({
                    cliente_id: 1,
                    tecnico_id: 3,
                    equipo: 'iPhone 14 azul',
                    falla: 'Bateria dañada',
                    estado: 'pendiente',
                    tipo_entrega: 'tienda',
                    fecha_promesa: '2026-06-30'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            testId = res.body.id;
        });
    });

    describe('GET /api/ordenes/:id', () => {
        it('deberia retornar una orden por id', async () => {
            const res = await request(app).get(`/api/ordenes/${testId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', testId);
        });
    });

    describe('PUT /api/ordenes/:id', () => {
        it('deberia actualizar una orden correctamente', async () => {
            const res = await request(app)
                .put(`/api/ordenes/${testId}`)
                .send({
                    cliente_id: 1,
                    tecnico_id: 3,
                    equipo: 'iPhone 14 azul',
                    falla: 'Bateria dañada',
                    diagnostico: 'Se requiere cambio de bateria',
                    estado: 'en_proceso',
                    tipo_entrega: 'tienda',
                    fecha_promesa: '2026-06-30',
                    costo_servicio: 150000,
                    notas: null
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('estado', 'en_proceso');
        });
    });

    describe('DELETE /api/ordenes/:id', () => {
        it('deberia eliminar una orden correctamente', async () => {
            const res = await request(app).delete(`/api/ordenes/${testId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('mensaje', 'Orden eliminada correctamente');
        });
    });
});