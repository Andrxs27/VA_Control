const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const usuariosRoutes = require('./routes/usuarios');
const ventasRoutes = require('./routes/ventas');
const facturasRoutes = require('./routes/facturas');
const ordenesRoutes = require('./routes/ordenes');

app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/ordenes', ordenesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'Backend VA_Control funcionando' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});