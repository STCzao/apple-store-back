/**
 * CONFIGURACIÓN DE WINSTON LOGGER
 *
 * Sistema de logging profesional con múltiples niveles y transportes
 *
 * Niveles de logging (en orden de severidad):
 * - error:   Errores críticos que requieren atención inmediata
 * - warn:    Advertencias de situaciones problemáticas
 * - info:    Información general de eventos importantes
 * - http:    Logs de peticiones HTTP
 * - debug:   Información detallada para debugging
 *
 * @module Logger
 */

const winston = require("winston");
const path = require("path");

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores para cada nivel (en consola)
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

// Determinar nivel de log según entorno
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "info";
};

// Formato para archivos (JSON estructurado)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Formato para consola (colorido y legible)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    // Mensaje base
    let msg = `${timestamp} [${level}]: ${message}`;

    // Agregar metadata si existe (excepto stack)
    if (Object.keys(meta).length > 0) {
      const { stack, ...otherMeta } = meta;
      if (Object.keys(otherMeta).length > 0) {
        msg += `\n${JSON.stringify(otherMeta, null, 2)}`;
      }
      // Agregar stack trace si existe
      if (stack) {
        msg += `\n${stack}`;
      }
    }

    return msg;
  }),
);

// Definir transportes (dónde se guardan los logs)
const transports = [
  // Consola - siempre activa
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Archivo de errores - solo errores
  new winston.transports.File({
    filename: path.join("logs", "error.log"),
    level: "error",
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Archivo combinado - todos los logs
  new winston.transports.File({
    filename: path.join("logs", "combined.log"),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// En producción, agregar archivo separado para warnings
if (process.env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: path.join("logs", "warn.log"),
      level: "warn",
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  );
}

// Crear instancia del logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // No salir en errores no capturados
  exitOnError: false,
});

// Agregar método stream para integración con Morgan (futuro)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * MÉTODOS AUXILIARES PERSONALIZADOS
 */

// Log de inicio de servidor
logger.serverStart = (port, env) => {
  logger.info(" Apple Store Backend API Iniciado");
  logger.info(` Puerto: ${port}`);
  logger.info(` Entorno: ${env}`);
  logger.info(` Seguridad: Helmet | Rate Limiting `);
  logger.info(` Logging: Winston | Sanitización `);
};

// Log de conexión a base de datos
logger.dbConnected = (dbName) => {
  logger.info(` Base de datos conectada: ${dbName || "MongoDB"}`);
};

// Log de desconexión de base de datos
logger.dbDisconnected = () => {
  logger.warn(" Base de datos desconectada");
};

// Log de error de base de datos
logger.dbError = (error) => {
  logger.error(" Error de base de datos:", {
    message: error.message,
    stack: error.stack,
  });
};

// Log de petición HTTP
logger.httpRequest = (method, path, statusCode, responseTime) => {
  const level = statusCode >= 400 ? "warn" : "http";
  logger[level](`${method} ${path} - ${statusCode} - ${responseTime}ms`);
};

// Log de autenticación
logger.authSuccess = (userId, action) => {
  logger.info(` Auth exitosa - Usuario: ${userId} - Acción: ${action}`);
};

logger.authFailed = (reason, ip) => {
  logger.warn(` Auth fallida - Razón: ${reason} - IP: ${ip}`);
};

// Log de operaciones críticas
logger.criticalOperation = (operation, userId, details) => {
  logger.info(` Operación crítica: ${operation}`, {
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Log de rate limiting
logger.rateLimitExceeded = (ip, endpoint) => {
  logger.warn(` Rate limit excedido - IP: ${ip} - Endpoint: ${endpoint}`);
};

// Log de inicio de aplicación con validaciones
logger.startupValidation = (validations) => {
  logger.info(" Validaciones de inicio:", validations);
};

module.exports = logger;
