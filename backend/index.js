const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const ordenesRoutes = require('./routes/ordenes');
const facturasRoutes = require('./routes/facturas');
const detalleFacturaRoutes = require('./routes/detalle_factura');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/detalle-factura', detalleFacturaRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'Backend VA_Control funcionando' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});