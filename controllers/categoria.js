/**
 * CONTROLADOR DE CATEGORÍAS
 *
 * Maneja operaciones CRUD de categorías de productos
 * Refactorizado para usar capa de servicios
 *
 * @module CategoriaController
 */

const { response } = require("express");
const categoriaService = require("../services/categoria");

/**
 * GET /api/categoria
 *
 * Obtener lista paginada de categorías activas
 *
 * @param {Object} req - Request de Express
 * @param {Object} req.query.limite - Categorías por página (default: 10, max: 100)
 * @param {Object} req.query.desde - Posición inicial (default: 0)
 * @param {Object} res - Response de Express
 *
 * @returns {Object} { total, categorias[] }
 */
const categoriasGet = async (req, res = response) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    
    const { total, categorias } = await categoriaService.obtenerCategorias(
      Number(limite),
      Number(desde)
    );

    res.json({ total, categorias });
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * GET /api/categoria/:id
 *
 * Obtener detalles de una categoría específica
 *
 * @param {Object} req - Request de Express
 * @param {String} req.params.id - ObjectId de la categoría
 * @param {Object} res - Response de Express
 *
 * @returns {Object} { categoria }
 */
const categoriaGet = async (req, res = response) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaService.obtenerCategoriaPorId(id);
    
    res.json({ categoria });
  } catch (error) {
    const statusCode = error.message.includes("no es válido") ? 400 : 404;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * POST /api/categoria
 *
 * Crear nueva categoría (solo admin)
 *
 * @param {Object} req - Request de Express
 * @param {Object} req.body.nombreCategoria - Nombre de la categoría
 * @param {Object} req.body.descripcion - Descripción (opcional)
 * @param {Object} req.body.img - URL de imagen (opcional)
 * @param {Object} req.usuario - Usuario autenticado (del middleware validarJWT)
 * @param {Object} res - Response de Express
 *
 * @returns {Object} { categoria, msg }
 */
const categoriaPost = async (req, res = response) => {
  try {
    const categoria = await categoriaService.crearCategoria(
      req.body,
      req.usuario._id
    );

    res.status(201).json({
      categoria,
      errors: [{ msg: "Categoría creada con éxito" }],
    });
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * PUT /api/categoria/:id
 *
 * Actualizar categoría existente (solo admin)
 *
 * @param {Object} req - Request de Express
 * @param {String} req.params.id - ObjectId de la categoría
 * @param {Object} req.body.nombreCategoria - Nuevo nombre (opcional)
 * @param {Object} req.body.descripcion - Nueva descripción (opcional)
 * @param {Object} req.body.img - Nueva URL de imagen (opcional)
 * @param {Object} res - Response de Express
 *
 * @returns {Object} { categoria, msg }
 */
const categoriaPut = async (req, res = response) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaService.actualizarCategoria(id, req.body);

    res.json({
      categoria,
      errors: [{ msg: "La categoría se actualizó con éxito" }],
    });
  } catch (error) {
    const statusCode = error.message.includes("no existe") ? 404 : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * DELETE /api/categoria/:id
 *
 * Soft delete de categoría (solo admin)
 * Cambia estado a false en lugar de eliminar físicamente
 *
 * @param {Object} req - Request de Express
 * @param {String} req.params.id - ObjectId de la categoría
 * @param {Object} res - Response de Express
 *
 * @returns {Object} { categoria, msg }
 */
const categoriaDelete = async (req, res = response) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaService.eliminarCategoria(id);

    res.json({
      categoria,
      errors: [{ msg: `La categoría ${categoria.nombreCategoria} se eliminó con éxito` }],
    });
  } catch (error) {
    const statusCode = error.message.includes("no existe") ? 404 : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

module.exports = {
  categoriasGet,
  categoriaGet,
  categoriaPost,
  categoriaPut,
  categoriaDelete,
};
