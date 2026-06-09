/**
 * hash-passwords.js
 * 
 * Ejecuta este script UNA SOLA VEZ si tienes usuarios con contraseñas
 * en texto plano en la base de datos.
 * 
 * Uso: node scripts/hash-passwords.js
 */

require('dotenv').config();
const pool = require('../db');
const bcrypt = require('bcrypt');

async function hashPasswords() {
    console.log('🔐 Iniciando proceso de hasheo de contraseñas...\n');

    try {
        const result = await pool.query('SELECT id, nombre, email, password FROM usuarios');
        const usuarios = result.rows;

        console.log(`📋 Encontrados ${usuarios.length} usuarios.\n`);

        for (const usuario of usuarios) {
            // Si ya está hasheado con bcrypt, el hash empieza con $2b$
            if (usuario.password.startsWith('$2b$') || usuario.password.startsWith('$2a$')) {
                console.log(`⏭️  ${usuario.nombre} (${usuario.email}) — ya tiene bcrypt, saltando.`);
                continue;
            }

            const passwordHasheada = await bcrypt.hash(usuario.password, 10);
            await pool.query(
                'UPDATE usuarios SET password = $1 WHERE id = $2',
                [passwordHasheada, usuario.id]
            );
            console.log(`✅ ${usuario.nombre} (${usuario.email}) — password hasheado correctamente.`);
        }

        console.log('\n🎉 Proceso completado. Todos los passwords están ahora protegidos con bcrypt.');
    } catch (error) {
        console.error('❌ Error durante el proceso:', error);
    } finally {
        await pool.end();
    }
}

hashPasswords();
