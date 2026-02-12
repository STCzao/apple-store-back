/**
 * CONTROLADOR DE PRODUCTOS
 * 
 * Maneja todas las operaciones CRUD para productos en la tienda
 * Refactorizado para usar capa de servicios
 * - Lectura: Pública (sin autenticación)
 * - Escritura: Protegida (solo ADMIN_ROLE)
 * 
 * @module ProductoController
 */

const { response, request } = require("express");
const productoService = require("../services/producto");

/**
 * GET /api/productos
 * 
 * Obtiene un listado paginado de productos activos
 * 
 * @async
 * @param {Object} req - Request
 * @param {Object} req.query.limite - Cantidad de productos por página (default: 12, máx: 100)
 * @param {Object} req.query.desde - Posición de inicio para paginación (default: 0)
 * @param {Object} res - Response
 * 
 * @returns {Object} { total: number, productos: Array }
 */
const productosGet = async (req = request, res = response) => {
  try {
    const { limite = 12, desde = 0 } = req.query;

    const { total, productos } = await productoService.obtenerProductos(
      Number(limite),
      Number(desde)
    );

    res.json({ total, productos });
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * GET /api/productos/:id
 * 
 * Obtiene un producto específico por su ID
 * 
 * @async
 * @param {Object} req - Request
 * @param {String} req.params.id - MongoDB ObjectId del producto
 * @param {Object} res - Response
 * 
 * @returns {Object} { producto: Object }
 */
const productoGet = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const producto = await productoService.obtenerProductoPorId(id);
    
    res.json({ producto });
  } catch (error) {
    const statusCode = error.message.includes("no es válido") ? 400 : 404;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * POST /api/productos
 * 
 * Crea un nuevo producto en la tienda
 * Requiere: ADMIN_ROLE y JWT válido
 * 
 * @async
 * @param {Object} req - Request
 * @param {Object} req.body - Datos del producto
 * @param {Object} req.usuario - Usuario autenticado (inyectado por middleware)
 * @param {Object} res - Response
 * 
 * @returns {Object} { producto: Object, msg: String }
 */
const productoPost = async (req = request, res = response) => {
  try {
    const producto = await productoService.crearProducto(
      req.body,
      req.usuario._id
    );

    res.status(201).json({
      producto,
      errors: [{ msg: "Producto creado con éxito" }],
    });
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * PUT /api/productos/:id
 * 
 * Actualiza un producto existente
 * Requiere: ADMIN_ROLE y JWT válido
 * 
 * @async
 * @param {Object} req - Request
 * @param {String} req.params.id - MongoDB ObjectId del producto
 * @param {Object} req.body - Datos a actualizar (todos opcionales)
 * @param {Object} res - Response
 * 
 * @returns {Object} { producto: Object, msg: String }
 */
const productoPut = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const producto = await productoService.actualizarProducto(id, req.body);

    res.json({
      producto,
      errors: [{ msg: "El producto se actualizó con éxito" }],
    });
  } catch (error) {
    const statusCode = error.message.includes("no existe") ? 404 : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * DELETE /api/productos/:id
 * 
 * Elimina (soft delete) un producto
 * Requiere: ADMIN_ROLE y JWT válido
 * 
 * @async
 * @param {Object} req - Request
 * @param {String} req.params.id - MongoDB ObjectId del producto
 * @param {Object} res - Response
 * 
 * @returns {Object} { producto: Object, msg: String }
 */
const productoDelete = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const producto = await productoService.eliminarProducto(id);

    res.json({
      producto,
      errors: [{ msg: `El producto ${producto.nombreProducto} se eliminó con éxito` }],
    });
  } catch (error) {
    const statusCode = error.message.includes("no existe") ? 404 : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

// Exportar todos los controladores para usar en rutas
module.exports = {
  productosGet,
  productoGet,
  productoPost,
  productoPut,
  productoDelete,
};
