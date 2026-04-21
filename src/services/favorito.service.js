const AppError = require("../helpers/AppError");
const favoritoRepo = require("../repositories/favorito.repository");
const productoRepo = require("../repositories/producto.repository");

const obtenerFavoritos = async (usuarioId) => {
  const [favoritos, total] = await Promise.all([
    favoritoRepo.findByUsuario(usuarioId),
    favoritoRepo.count(usuarioId),
  ]);
  return { total, favoritos };
};

const agregarFavorito = async (usuarioId, productoId) => {
  const producto = await productoRepo.findById(productoId);
  if (!producto || !producto.estado) throw new AppError("Producto no encontrado", 404);

  const existe = await favoritoRepo.findOne(usuarioId, productoId);
  if (existe) throw new AppError("El producto ya está en favoritos", 409);

  return favoritoRepo.create(usuarioId, productoId);
};

const eliminarFavorito = async (usuarioId, productoId) => {
  const eliminado = await favoritoRepo.remove(usuarioId, productoId);
  if (!eliminado) throw new AppError("El producto no está en favoritos", 404);
  return eliminado;
};

module.exports = { obtenerFavoritos, agregarFavorito, eliminarFavorito };
