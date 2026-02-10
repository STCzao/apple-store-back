const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const { dbConnection } = require("../database/config");
const logger = require("../config/logger");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    // Configurar Rate Limiters
    this.configurarRateLimiters();

    this.paths = {
      auth: "/api/auth",
      usuario: "/api/usuario",
      categoria: "/api/categoria",
      producto: "/api/producto",
      carrito: "/api/carrito",
      orden: "/api/orden",
      movimiento: "/api/movimiento",
      buscar: "/api/buscar",
    };

    // Conectar a base de datos
    this.conectarDB();

    // Middlewares de seguridad y configuración
    this.middlewares();

    // Rutas de mi aplicación
    this.routes();

    // Error handler global (debe ir después de las rutas)
    this.errorHandler();
  }

  async conectarDB() {
    await dbConnection();
  }

  /**
   * CONFIGURACIÓN DE RATE LIMITERS
   * 
   * Protege la API contra ataques de fuerza bruta y DDoS
   */
  configurarRateLimiters() {
    // Rate limiter general para toda la API
    this.generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por IP
      message: {
        ok: false,
        msg: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos',
      },
      standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
      legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
      // Excluir de rate limiting en desarrollo (opcional)
      skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
    });

    // Rate limiter estricto para rutas de autenticación
    this.authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 5, // máximo 5 intentos de login
      message: {
        ok: false,
        msg: 'Demasiados intentos de autenticación. Por favor intenta de nuevo en 15 minutos',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Rate limiter moderado para operaciones de escritura
    this.writeLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 50, // máximo 50 operaciones de escritura
      message: {
        ok: false,
        msg: 'Demasiadas operaciones de escritura. Por favor intenta de nuevo en 15 minutos',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  /**
   * MIDDLEWARES DE SEGURIDAD Y CONFIGURACIÓN
   */
  middlewares() {
    // ============================================
    // SEGURIDAD
    // ============================================

    // Helmet: Headers de seguridad HTTP
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
        crossOriginEmbedderPolicy: false, // Permitir recursos externos
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );

    // Rate limiting general para todas las rutas
    this.app.use(this.generalLimiter);

    // Sanitización de datos contra inyección NoSQL
    this.app.use(
      mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
          logger.warn(`SECURITY: Intento de inyección NoSQL detectado y bloqueado`, {
            ip: req.ip,
            path: req.path,
            key: key,
          });
        },
      })
    );

    // ============================================
    // CONFIGURACIÓN
    // ============================================

    // CORS: Control de origen cruzado
    this.app.use(cors());

    // Body parser: Leer JSON del body
    this.app.use(express.json());

    // Directorio público para archivos estáticos
    this.app.use(express.static("public"));

    // Logging de peticiones HTTP
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.httpRequest(req.method, req.path, res.statusCode, duration);
      });
      
      next();
    });
  }
  /**
   * RUTAS DE LA APLICACIÓN
   * 
   * Rate limiting específico aplicado a rutas críticas
   */
  routes() {
    // Rutas de autenticación con rate limiting estricto
    this.app.use(this.paths.auth, this.authLimiter, require("../routes/auth"));

    // Rutas de escritura con rate limiting moderado
    this.app.use(this.paths.usuario, this.writeLimiter, require("../routes/usuario"));
    this.app.use(this.paths.categoria, this.writeLimiter, require("../routes/categoria"));
    this.app.use(this.paths.producto, this.writeLimiter, require("../routes/producto"));
    this.app.use(this.paths.carrito, require("../routes/carrito"));
    this.app.use(this.paths.orden, this.writeLimiter, require("../routes/ordenes"));

    // TODO: Implementar ruta de movimientos en Fase 3
    // this.app.use(this.paths.movimiento, require("../routes/movimiento"));

    // Rutas de solo lectura (sin rate limiting adicional)
    this.app.use(this.paths.buscar, require("../routes/buscar"));

    // Ruta de health check (útil para monitoreo)
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        ok: true,
        msg: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
    });

    // Manejo de rutas no encontradas (404)
    this.app.use((req, res) => {
      res.status(404).json({
        ok: false,
        msg: `Ruta ${req.method} ${req.path} no encontrada`,
      });
    });
  }

  /**
   * ERROR HANDLER GLOBAL
   * 
   * Captura todos los errores no manejados en la aplicación
   * IMPORTANTE: Debe ir después de todas las rutas
   */
  errorHandler() {
    this.app.use((err, req, res, next) => {
      // Log del error en servidor con Winston
      logger.error('[ERROR] Error no manejado:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      // Determinar código de estado
      const statusCode = err.statusCode || err.status || 500;

      // Mensaje genérico para errores de servidor en producción
      const message =
        statusCode === 500 && process.env.NODE_ENV === 'production'
          ? 'Error interno del servidor'
          : err.message || 'Error desconocido';

      // Respuesta al cliente
      res.status(statusCode).json({
        ok: false,
        msg: message,
        // Stack trace solo en desarrollo
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        // Información adicional del error si existe
        ...(err.errors && { errors: err.errors }),
      });
    });
  }

  /**
   * INICIAR SERVIDOR
   */
  listen() {
    this.app.listen(this.port, () => {
      logger.serverStart(this.port, process.env.NODE_ENV);
    });
  }
}

module.exports = Server;
