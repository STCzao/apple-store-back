const productoService = require("../services/producto.service");

const productosGet = async (req, res, next) => {
  try {
    const { limite = 12, desde = 0 } = req.query;
    const { total, productos } = await productoService.obtenerProductos(Number(limite), Number(desde));
    res.json({ total, productos });
  } catch (err) {
    next(err);
  }
};

const productoGet = async (req, res, next) => {
  try {
    const producto = await productoService.obtenerProductoPorId(req.params.id);
    res.json({ producto });
  } catch (err) {
    next(err);
  }
};

const productoPost = async (req, res, next) => {
  try {
    const producto = await productoService.crearProducto(req.body, req.usuario._id);
    res.status(201).json({ producto });
  } catch (err) {
    next(err);
  }
};

const productoPatch = async (req, res, next) => {
  try {
    const producto = await productoService.actualizarProducto(req.params.id, req.body);
    res.json({ producto });
  } catch (err) {
    next(err);
  }
};

const productoDelete = async (req, res, next) => {
  try {
    const producto = await productoService.eliminarProducto(req.params.id);
    res.json({ producto });
  } catch (err) {
    next(err);
  }
};

module.exports = { productosGet, productoGet, productoPost, productoPatch, productoDelete };
