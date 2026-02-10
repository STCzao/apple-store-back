/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 *
 * Inicializa el servidor validando variables de entorno críticas
 */

const Server = require("./models/server");
const logger = require("./config/logger");

// Cargar variables de entorno según el entorno
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config();
}

// VALIDACIÓN DE VARIABLES DE ENTORNO

const requiredEnvVars = ["MONGODB_CNN", "SECRETORPRIVATEKEY"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error("ERROR: Faltan variables de entorno obligatorias:", {
    missing: missingVars,
  });
  logger.error("Crea un archivo .env basado en .env.example");
  process.exit(1);
}

// Validar entorno
if (!["development", "production", "test"].includes(process.env.NODE_ENV)) {
  logger.warn(
    'WARNING: NODE_ENV no definido o inválido. Usando "development" por defecto.',
  );
  process.env.NODE_ENV = "development";
}

// Validar PORT
if (process.env.PORT) {
  const port = parseInt(process.env.PORT, 10);
  
  if (isNaN(port)) {
    logger.warn(`WARNING: PORT "${process.env.PORT}" no es un número válido. Usando puerto 3000 por defecto.`);
    delete process.env.PORT; // Eliminar para que use el default
  } else if (port < 1024 || port > 65535) {
    logger.warn(`WARNING: PORT ${port} fuera de rango recomendado (1024-65535). Usando puerto 3000 por defecto.`);
    delete process.env.PORT;
  } else {
    logger.info(`Puerto configurado: ${port}`);
  }
} else {
  logger.info('INFO: PORT no definido. Usando puerto 3000 por defecto.');
}

// Log de validaciones exitosas
logger.startupValidation({
  envVarsPresent: true,
  environment: process.env.NODE_ENV,
  requiredVars: requiredEnvVars,
});

// INICIALIZACIÓN DEL SERVIDOR

const server = new Server();

server.listen();
