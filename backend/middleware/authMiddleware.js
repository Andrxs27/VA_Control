const jwt = require('jsonwebtoken');

// Verifica que el token JWT sea válido
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticación requerido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'va_control_secret_key');
        req.user = decoded; // { id, rol, nombre }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    }
};

// Solo administradores
const soloAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
    next();
};

// Administradores y vendedores
const adminOVendedor = (req, res, next) => {
    if (!['admin', 'vendedor'].includes(req.user.rol)) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador o Vendedor.' });
    }
    next();
};

// Administradores y técnicos
const adminOTecnico = (req, res, next) => {
    if (!['admin', 'tecnico'].includes(req.user.rol)) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador o Técnico.' });
    }
    next();
};

module.exports = { verifyToken, soloAdmin, adminOVendedor, adminOTecnico };
