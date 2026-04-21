const favoritoService = require("../services/favorito.service");

const getFavoritos = async (req, res, next) => {
  try {
    const { total, favoritos } = await favoritoService.obtenerFavoritos(req.usuario._id);
    res.json({ total, favoritos });
  } catch (err) {
    next(err);
  }
};

const addFavorito = async (req, res, next) => {
  try {
    const favorito = await favoritoService.agregarFavorito(req.usuario._id, req.params.productoId);
    res.status(201).json({ favorito });
  } catch (err) {
    next(err);
  }
};

const removeFavorito = async (req, res, next) => {
  try {
    await favoritoService.eliminarFavorito(req.usuario._id, req.params.productoId);
    res.json({ message: "Producto eliminado de favoritos" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFavoritos, addFavorito, removeFavorito };
