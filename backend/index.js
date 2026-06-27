require('dotenv').config();
const { execSync } = require('child_process');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

try {
  console.log('Ejecutando migraciones...');
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  console.log('Migraciones completadas.');
} catch (err) {
  console.error('Error en migraciones:', err.message);
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

// --- DOCUMENTACIÓN SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

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
    console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});
