const AppError = require("../helpers/AppError");
const productoService = require("../services/producto.service");

const productosGet = async (req, res, next) => {
  try {
    const { limite = 12, desde = 0 } = req.query;
    const { total, productos } = await productoService.obtenerProductos(Number(limite), Number(desde));
    res.json({ total, productos });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const productoGet = async (req, res, next) => {
  try {
    const producto = await productoService.obtenerProductoPorId(req.params.id);
    res.json({ producto });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const productoPost = async (req, res, next) => {
  try {
    const producto = await productoService.crearProducto(req.body, req.usuario._id);
    res.status(201).json({ producto });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const productoPatch = async (req, res, next) => {
  try {
    const producto = await productoService.actualizarProducto(req.params.id, req.body);
    res.json({ producto });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const productoDelete = async (req, res, next) => {
  try {
    const producto = await productoService.eliminarProducto(req.params.id);
    res.json({ producto });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

module.exports = { productosGet, productoGet, productoPost, productoPatch, productoDelete };
