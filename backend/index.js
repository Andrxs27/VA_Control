require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- AUTENTICACIÓN ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// --- RUTAS PRINCIPALES ---
const usuariosRoutes = require('./routes/usuarios');
const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const ordenesRoutes = require('./routes/ordenes');
const facturasRoutes = require('./routes/facturas');
const inventarioRoutes = require('./routes/inventario');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/inventario', inventarioRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: 'Backend VA_Control funcionando' });
});

const PORT = process.env.PORT || 8080; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
