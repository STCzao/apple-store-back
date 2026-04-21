const AppError = require("../helpers/AppError");
const logger = require("../config/logger");

const errorHandler = (err, req, res, _next) => {
  // Error operacional conocido
  if (err instanceof AppError) {
    logger.warn(`[${req.method}] ${req.path} — ${err.status}: ${err.message}`);
    return res.status(err.status).json({ message: err.message });
  }

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)[0].message;
    logger.warn(`[${req.method}] ${req.path} — 400: ${message}`);
    return res.status(400).json({ message });
  }

  // Clave duplicada en MongoDB (unique constraint)
  if (err.name === "MongoServerError" && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    logger.warn(`[${req.method}] ${req.path} — 409: duplicate key ${field}`);
    return res.status(409).json({ message: `El valor de "${field}" ya está registrado` });
  }

  // ObjectId inválido en parámetros de ruta
  if (err.name === "CastError" && err.kind === "ObjectId") {
    logger.warn(`[${req.method}] ${req.path} — 400: invalid ObjectId`);
    return res.status(400).json({ message: "ID inválido" });
  }

  // Error inesperado — se loguea con stack, no se expone al cliente
  logger.error(`[${req.method}] ${req.path} — 500: ${err.message}`, { stack: err.stack });
  res.status(500).json({ message: "Error interno del servidor" });
};

module.exports = errorHandler;
