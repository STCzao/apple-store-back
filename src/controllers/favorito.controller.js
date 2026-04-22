const AppError = require("../helpers/AppError");
const favoritoService = require("../services/favorito.service");

const getFavoritos = async (req, res, next) => {
  try {
    const { total, favoritos } = await favoritoService.obtenerFavoritos(req.usuario._id);
    res.json({ total, favoritos });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const addFavorito = async (req, res, next) => {
  try {
    const favorito = await favoritoService.agregarFavorito(req.usuario._id, req.params.productoId);
    res.status(201).json({ favorito });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const removeFavorito = async (req, res, next) => {
  try {
    await favoritoService.eliminarFavorito(req.usuario._id, req.params.productoId);
    res.json({ message: "Producto eliminado de favoritos" });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

module.exports = { getFavoritos, addFavorito, removeFavorito };
