const PROD_API_URL = "https://vacontrol-production.up.railway.app/";
const DEV_API_URL = "http://localhost:3000"; // Cambia esto por tu URL local de desarrollo

async function obtenerUrlApi() {
    // 1. Validamos si la URL de producción contiene 'railway.app'
    if (PROD_API_URL.includes("railway.app")) {
        try {
            // 2. Realizamos el fetch de validación al backend
            const respuesta = await fetch(PROD_API_URL);
            
            if (respuesta.ok) {
                const data = await respuesta.json();
                
                // 3. Validamos que el JSON tenga el mensaje exacto
                if (data.mensaje === "Backend VA_Control funcionando") {
                    console.log("Conexión exitosa: Entorno de PRODUCCIÓN detectado.");
                    return PROD_API_URL;
                }
            }
        } catch (error) {
            console.warn("No se pudo conectar a producción, cayendo en entorno de desarrollo:", error.message);
        }
    }
    return DEV_API_URL;
}

// --- Ejemplo de uso ---
async function iniciarApp() {
    return await obtenerUrlApi();
}

export const API = iniciarApp();