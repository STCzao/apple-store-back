/**
 * CONTROLADOR DE ÓRDENES
 *
 * Maneja operaciones de órdenes de compra
 * Refactorizado con arquitectura de services
 *
 * @module OrdenController
 */

const { response } = require("express");
const ordenService = require("../services/orden");

/**
 * GET /api/orden
 *
 * Obtener órdenes del usuario autenticado (paginadas)
 *
 * @query {Number} limite - Cantidad por página (default: 10, max: 50)
 * @query {Number} desde - Posición inicial (default: 0)
 */
const ordenesGet = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { limite = 10, desde = 0 } = req.query;

    const { total, ordenes } = await ordenService.obtenerOrdenes(
      usuario._id,
      Number(limite),
      Number(desde),
    );

    res.json({
      total,
      ordenes,
    });
  } catch (error) {
    const statusCode = error.message.includes("no es válido") ? 400 : 500;
    res.status(statusCode).json({ msg: error.message });
  }
};

/**
 * GET /api/orden/:id
 *
 * Obtener orden por ID (solo si pertenece al usuario)
 *
 * @param {String} id - ID de la orden
 */
const ordenGet = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { id } = req.params;

    const orden = await ordenService.obtenerOrdenPorId(id, usuario._id);

    res.json({ orden });
  } catch (error) {
    const statusCode = error.message.includes("no existe")
      ? 404
      : error.message.includes("no tienes permisos")
        ? 403
        : error.message.includes("no es válido")
          ? 400
          : 500;

    res.status(statusCode).json({ msg: error.message });
  }
};

/**
 * POST /api/orden
 *
 * Crear nueva orden desde carrito activo
 *
 * @body {Object} datosFacturacion - Datos fiscales obligatorios
 * @body {String} moneda - Moneda (ars/usd, default: ars)
 */
const ordenPost = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { datosFacturacion, moneda = "ars" } = req.body;

    const orden = await ordenService.crearOrden(
      usuario._id,
      datosFacturacion,
      moneda,
    );

    res.status(201).json({
      orden,
      msg: "Orden creada exitosamente",
    });
  } catch (error) {
    const statusCode = error.message.includes("carrito")
      ? 400
      : error.message.includes("Stock insuficiente")
        ? 409 // Conflict
        : error.message.includes("no está disponible")
          ? 410 // Gone
          : error.message.includes("Faltan datos")
            ? 400
            : 500;

    res.status(statusCode).json({ msg: error.message });
  }
};

/**
 * PUT /api/orden/:id
 *
 * Actualizar estado de orden
 * (Normalmente usado por webhooks de pago o admin)
 *
 * @param {String} id - ID de la orden
 * @body {String} estado - Nuevo estado
 * @body {Object} datosPago - Datos del pago (opcional)
 */
const ordenPut = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { estado, datosPago } = req.body;

    const orden = await ordenService.actualizarEstadoOrden(
      id,
      estado,
      datosPago,
    );

    res.json({
      orden,
      msg: "Estado de orden actualizado",
    });
  } catch (error) {
    const statusCode = error.message.includes("no existe")
      ? 404
      : error.message.includes("no puede cambiar")
        ? 409 // Conflict
        : error.message.includes("Estado inválido")
          ? 400
          : 500;

    res.status(statusCode).json({ msg: error.message });
  }
};

/**
 * DELETE /api/orden/:id
 *
 * Cancelar orden (solo si está PENDIENTE_PAGO)
 *
 * @param {String} id - ID de la orden a cancelar
 */
const ordenDelete = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { id } = req.params;

    const orden = await ordenService.cancelarOrden(id, usuario._id);

    res.json({
      orden,
      msg: "Orden cancelada exitosamente",
    });
  } catch (error) {
    const statusCode = error.message.includes("no existe")
      ? 404
      : error.message.includes("no tienes permisos")
        ? 403
        : error.message.includes("No se puede cancelar")
          ? 409 // Conflict
          : 500;

    res.status(statusCode).json({ msg: error.message });
  }
};

module.exports = {
  ordenesGet,
  ordenGet,
  ordenPost,
  ordenPut,
  ordenDelete,
};
