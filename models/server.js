const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/config");

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

    // Middlewares
    this.middlewares();

    //Rutas de mi aplicación
    this.routes();
  }

  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    // Cors
    this.app.use(cors());

    // Leer lo que envia el usuario
    this.app.use(express.json());

    // Definir carpeta pública
    this.app.use(express.static("public"));
  }
  routes() {
    this.app.use(this.paths.auth, require("../routes/auth"));
    this.app.use(this.paths.usuario, require("../routes/usuario"));
    this.app.use(this.paths.categoria, require("../routes/categoria"));
    this.app.use(this.paths.producto, require("../routes/producto"));
    this.app.use(this.paths.carrito, require("../routes/carrito"));
    this.app.use(this.paths.orden, require("../routes/ordenes"));
    // TODO: Implementar ruta de movimientos en Fase 3
    // this.app.use(this.paths.movimiento, require("../routes/movimiento"));
    this.app.use(this.paths.buscar, require("../routes/buscar"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

module.exports = Server;
