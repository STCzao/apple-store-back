const categoriaService = require("../services/categoria.service");

const categoriasGet = async (req, res, next) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    const { total, categorias } = await categoriaService.obtenerCategorias(Number(limite), Number(desde));
    res.json({ total, categorias });
  } catch (err) {
    next(err);
  }
};

const categoriaGet = async (req, res, next) => {
  try {
    const categoria = await categoriaService.obtenerCategoriaPorId(req.params.id);
    res.json({ categoria });
  } catch (err) {
    next(err);
  }
};

const categoriaPost = async (req, res, next) => {
  try {
    const categoria = await categoriaService.crearCategoria(req.body, req.usuario._id);
    res.status(201).json({ categoria });
  } catch (err) {
    next(err);
  }
};

const categoriaPatch = async (req, res, next) => {
  try {
    const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);
    res.json({ categoria });
  } catch (err) {
    next(err);
  }
};

const categoriaDelete = async (req, res, next) => {
  try {
    const categoria = await categoriaService.eliminarCategoria(req.params.id);
    res.json({ categoria });
  } catch (err) {
    next(err);
  }
};

module.exports = { categoriasGet, categoriaGet, categoriaPost, categoriaPatch, categoriaDelete };
