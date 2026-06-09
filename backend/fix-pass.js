const pool = require('./db'); // Ajusta la ruta a tu conexión si es necesario
const bcrypt = require('bcrypt');

async function restaurarContraseña() {
    try {
        // Tu propio sistema genera el hash exacto para "123456789"
        const nuevoHash = await bcrypt.hash('123456789', 10);
        
        console.log("Generando hash local:", nuevoHash);

        await pool.query(
            "UPDATE usuarios SET password = $1 WHERE email = 'andrecrack1110@gmail.com'",
            [nuevoHash]
        );

        console.log("=================================================");
        console.log("   ¡Base de datos actualizada con éxito! 🎉");
        console.log("=================================================");
        process.exit(0);
    } catch (error) {
        console.error("Hubo un error al actualizar:", error);
        process.exit(1);
    }
}

restaurarContraseña();