/**
 * CONTROLADOR DE CARRITO
 *
 * Maneja operaciones del carrito de compras
 * Refactorizado con arquitectura de services
 *
 * @module CarritoController
 */

const { response } = require("express");
const carritoService = require("../services/carrito");

/**
 * GET /api/carrito
 *
 * Obtener carrito activo del usuario autenticado
 */

const carritoGet = async (req, res = response) => {
  try {
    const { usuario } = req;
    const carrito = await carritoService.obtenerCarritoActivo(usuario._id);

    res.json({ carrito });
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * POST /api/carrito
 *
 * Agregar producto al carrito
 *
 * @body {String} productoId - ID del producto
 * @body {Number} cantidad - Cantidad a agregar (default: 1)
 */

const carritoPost = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { productoId, cantidad = 1 } = req.body;

    const carrito = await carritoService.agregarProducto(
      usuario._id,
      productoId,
      cantidad,
    );

    res.status(201).json({
      carrito,
      errors: [{ msg: "Producto agregado al carrito" }],
    });
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * PUT /api/carrito/:productoId
 *
 * Actualizar cantidad de un producto en el carrito
 *
 * @param {String} productoId - ID del producto
 * @body {Number} cantidad - Nueva cantidad
 */

const carritoPut = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { productoId } = req.params;
    const { cantidad } = req.body;

    const carrito = await carritoService.actualizarCantidad(
      usuario._id,
      productoId,
      cantidad,
    );

    res.json({
      carrito,
      errors: [{ msg: "Cantidad actualizada en el carrito" }],
    });
  } catch (error) {
    const statusCode = error.message.includes("no está en el carrito")
      ? 404
      : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * DELETE /api/carrito/:productoId
 *
 * Eliminar producto del carrito
 *
 * @param {String} productoId - ID del producto a eliminar
 */

const carritoDeleteItem = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { productoId } = req.params;

    const carrito = await carritoService.eliminarProducto(
      usuario._id,
      productoId,
    );

    res.json({
      carrito,
      errors: [{ msg: "Producto eliminado del carrito" }],
    });
  } catch (error) {
    const statusCode = error.message.includes("no está en el carrito")
      ? 404
      : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * DELETE /api/carrito
 *
 * Vaciar carrito completamente
 */
const carritoDelete = async (req, res = response) => {
  try {
    const { usuario } = req;
    const carrito = await carritoService.vaciarCarrito(usuario._id);

    res.json({
      carrito,
      errors: [{ msg: "Carrito vaciado" }],
    });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

module.exports = {
  carritoGet,
  carritoPost,
  carritoPut,
  carritoDeleteItem,
  carritoDelete,
};
