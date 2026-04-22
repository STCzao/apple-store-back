const AppError = require("../helpers/AppError");
const categoriaService = require("../services/categoria.service");

const categoriasGet = async (req, res, next) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    const { total, categorias } = await categoriaService.obtenerCategorias(Number(limite), Number(desde));
    res.json({ total, categorias });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const categoriaGet = async (req, res, next) => {
  try {
    const categoria = await categoriaService.obtenerCategoriaPorId(req.params.id);
    res.json({ categoria });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const categoriaPost = async (req, res, next) => {
  try {
    const categoria = await categoriaService.crearCategoria(req.body, req.usuario._id);
    res.status(201).json({ categoria });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const categoriaPatch = async (req, res, next) => {
  try {
    const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);
    res.json({ categoria });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const categoriaDelete = async (req, res, next) => {
  try {
    const categoria = await categoriaService.eliminarCategoria(req.params.id);
    res.json({ categoria });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

module.exports = { categoriasGet, categoriaGet, categoriaPost, categoriaPatch, categoriaDelete };
