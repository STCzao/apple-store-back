const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/config");
const { buscar } = require("../controllers/buscar");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.paths = {
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      categorias: "/api/categorias",
      productos: "/api/productos",
      carritos: "/api/carritos",
      ordenes: "/api/ordenes",
      movimientos: "/api/movimientos",
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
    this.app.use(this.paths.usuarios, require("../routes/usuarios"));
    this.app.use(this.paths.categorias, require("../routes/categorias"));
    this.app.use(this.paths.productos, require("../routes/productos"));
    this.app.use(this.paths.carritos, require("../routes/carritos"));
    this.app.use(this.paths.ordenes, require("../routes/ordens"));
    this.app.use(this.paths.movimientos, require("../routes/movimientos"));
    this.app.use(this.paths.buscar, require("../routes/buscar"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

module.exports = Server;
