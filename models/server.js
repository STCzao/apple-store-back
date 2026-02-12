const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { dbConnection } = require("../database/config");
const logger = require("../config/logger");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

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
   * MIDDLEWARES DE SEGURIDAD Y CONFIGURACIÓN
   */
  middlewares() {
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
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );

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
   */
  routes() {
    this.app.use(this.paths.auth, require("../routes/auth"));
    this.app.use(this.paths.usuario, require("../routes/usuario"));
    this.app.use(this.paths.categoria, require("../routes/categoria"));
    this.app.use(this.paths.producto, require("../routes/producto"));
    this.app.use(this.paths.carrito, require("../routes/carrito"));
    this.app.use(this.paths.orden, require("../routes/ordenes"));
    this.app.use(this.paths.buscar, require("../routes/buscar"));

    // Ruta de health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        ok: true,
        errors: [{ msg: 'Server is running' }],
        timestamp: new Date().toISOString(),
      });
    });

    // Manejo de rutas no encontradas (404)
    this.app.use((req, res) => {
      res.status(404).json({
        ok: false,
        errors: [{ msg: `Ruta ${req.method} ${req.path} no encontrada` }],
      });
    });
  }

  /**
   * ERROR HANDLER GLOBAL
   */
  errorHandler() {
    this.app.use((err, req, res, next) => {
      logger.error('[ERROR] Error no manejado:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      const statusCode = err.statusCode || err.status || 500;
      const message = err.message || 'Error desconocido';

      res.status(statusCode).json({
        ok: false,
        errors: err.errors || [{ msg: message }],
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
