// Helper para obtener la app de Express para testing
const Server = require('../../models/server');

// Sobrescribir conectarDB para que no intente conectar
// (setup.js ya maneja la conexión a MongoDB Memory Server)
Server.prototype.conectarDB = async function() {};

const server = new Server();

const getApp = () => server.app;

module.exports = { getApp };
