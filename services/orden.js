/**
 * SERVICE DE ÓRDENES
 *
 * Lógica de negocio de órdenes de compra
 * - Creación de órdenes desde carrito
 * - Validación de stock y datos fiscales
 * - Gestión de estados de pago
 * - Integración con Stripe (preparado)
 * - Snapshot de datos fiscales inmutables
 *
 * @module OrdenService
 */

const { Orden, Carrito, Producto, Usuario } = require("../models/index");
const { validObjectId } = require("../helpers/validObjectId");
const { validarStock } = require("../helpers/validarStock");

/**
 * Obtener órdenes del usuario (paginadas)
 *
 * @param {String} usuarioId - ID del usuario
 * @param {Number} limite - Cantidad por página (default: 10, max: 50)
 * @param {Number} desde - Posición inicial (default: 0)
 * @returns {Promise<Object>} { total, ordenes }
 */
const obtenerOrdenes = async (usuarioId, limite = 10, desde = 0) => {
  // Validaciones
  if (!validObjectId(usuarioId)) {
    throw new Error("El id del usuario no es válido");
  }

  if (isNaN(limite) || isNaN(desde)) {
    throw new Error(
      "Los parámetros 'limite' y 'desde' deben ser números válidos",
    );
  }

  if (limite < 0 || desde < 0) {
    throw new Error("Los parámetros 'limite' y 'desde' no pueden ser negativos");
  }

  if (limite > 50) {
    throw new Error("El parámetro 'limite' no puede ser mayor a 50");
  }

  // Queries en paralelo con populate
  const [total, ordenes] = await Promise.all([
    Orden.countDocuments({ usuarioId }),
    Orden.find({ usuarioId })
      .sort({ createdAt: -1 }) // Más recientes primero
      .skip(desde)
      .limit(limite)
      .populate("usuarioId", "nombreUsuario correo")
      .populate("items.productoId", "nombreProducto img"),
  ]);

  return { total, ordenes };
};

/**
 * Obtener orden por ID
 *
 * @param {String} ordenId - ID de la orden
 * @param {String} usuarioId - ID del usuario (para validar pertenencia)
 * @returns {Promise<Object>} orden
 * @throws {Error} Si el ID no es válido, no existe o no pertenece al usuario
 */
const obtenerOrdenPorId = async (ordenId, usuarioId) => {
  // Validar ObjectId
  if (!validObjectId(ordenId)) {
    throw new Error("El id de la orden no es válido");
  }

  if (!validObjectId(usuarioId)) {
    throw new Error("El id del usuario no es válido");
  }

  const orden = await Orden.findById(ordenId)
    .populate("usuarioId", "nombreUsuario correo DNI CUIL")
    .populate("items.productoId", "nombreProducto img inventario");

  // Validar existencia
  if (!orden) {
    throw new Error("La orden no existe");
  }

  // Validar pertenencia (solo el usuario puede ver su orden)
  if (orden.usuarioId._id.toString() !== usuarioId.toString()) {
    throw new Error("No tienes permisos para ver esta orden");
  }

  return orden;
};

/**
 * Crear nueva orden desde carrito activo
 *
 * @param {String} usuarioId - ID del usuario
 * @param {Object} datosFacturacion - Datos fiscales del usuario
 * @param {String} moneda - Moneda (ars/usd)
 * @returns {Promise<Object>} orden creada
 * @throws {Error} Si carrito vacío, sin stock o datos inválidos
 */
const crearOrden = async (usuarioId, datosFacturacion, moneda = "ars") => {
  // Validar ObjectId
  if (!validObjectId(usuarioId)) {
    throw new Error("El id del usuario no es válido");
  }

  // Validar moneda
  if (!["ars", "usd"].includes(moneda.toLowerCase())) {
    throw new Error("La moneda debe ser 'ars' o 'usd'");
  }

  // Validar datos de facturación
  if (!datosFacturacion || typeof datosFacturacion !== "object") {
    throw new Error("Los datos de facturación son obligatorios");
  }

  const {
    tipoFacturacion,
    nombreCompleto,
    DNI,
    CUIL,
    razonSocial,
    domicilioFiscal,
  } = datosFacturacion;

  // Validar campos obligatorios según tipo de facturación
  if (!tipoFacturacion || !["CONSUMIDOR_FINAL", "RESPONSABLE_INSCRIPTO"].includes(tipoFacturacion)) {
    throw new Error(
      "El tipo de facturación debe ser 'CONSUMIDOR_FINAL' o 'RESPONSABLE_INSCRIPTO'",
    );
  }

  if (!nombreCompleto || !DNI || !domicilioFiscal) {
    throw new Error(
      "Faltan datos obligatorios: nombreCompleto, DNI, domicilioFiscal",
    );
  }

  if (tipoFacturacion === "RESPONSABLE_INSCRIPTO" && (!CUIL || !razonSocial)) {
    throw new Error(
      "Para Responsable Inscripto son obligatorios: CUIL y razónSocial",
    );
  }

  // Validar domicilio fiscal
  const { calle, numero, ciudad, provincia, codigoPostal } =
    domicilioFiscal || {};
  if (!calle || !numero || !ciudad || !provincia || !codigoPostal) {
    throw new Error(
      "El domicilio fiscal debe incluir: calle, numero, ciudad, provincia, codigoPostal",
    );
  }

  // Obtener carrito activo del usuario
  const carrito = await Carrito.findOne({
    usuarioId,
    estado: "ACTIVO",
  }).populate("items.productoId");

  if (!carrito) {
    throw new Error("No tienes un carrito activo");
  }

  if (!carrito.items || carrito.items.length === 0) {
    throw new Error("El carrito está vacío");
  }

  // Validar stock de todos los productos
  for (const item of carrito.items) {
    const producto = item.productoId;

    // Verificar que el producto aún existe y está activo
    if (!producto || !producto.estado) {
      throw new Error(
        `El producto "${item.nombreSnapshot}" ya no está disponible`,
      );
    }

    // Validar stock suficiente
    validarStock(producto, item.cantidad);
  }

  // Calcular desglose fiscal
  const desgloseFiscal = calcularDesgloseFiscal(
    tipoFacturacion,
    carrito.total,
  );

  // Crear la orden
  const orden = new Orden({
    usuarioId,
    carritoId: carrito._id,
    estado: "PENDIENTE_PAGO",
    items: carrito.items.map((item) => ({
      productoId: item.productoId._id,
      nombreSnapshot: item.nombreSnapshot,
      precioSnapshot: item.precioSnapshot,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
    })),
    moneda: moneda.toLowerCase(),
    subtotal: carrito.subtotal,
    total: carrito.total,
    datosFacturacion: {
      tipoFacturacion,
      nombreCompleto,
      DNI,
      CUIL: CUIL || null,
      razonSocial: razonSocial || null,
      domicilioFiscal: {
        calle,
        numero,
        ciudad,
        provincia,
        codigoPostal,
      },
    },
    desgloseFiscal,
  });

  await orden.save();

  // Cambiar estado del carrito a CHEQUEANDO
  carrito.estado = "CHEQUEANDO";
  await carrito.save();

  // Popular antes de retornar
  await orden.populate("usuarioId", "nombreUsuario correo");
  await orden.populate("items.productoId", "nombreProducto img");

  return orden;
};

/**
 * Actualizar estado de orden (admin o webhook de pago)
 *
 * @param {String} ordenId - ID de la orden
 * @param {String} nuevoEstado - Nuevo estado
 * @param {Object} datosPago - Datos adicionales del pago (opcional)
 * @returns {Promise<Object>} orden actualizada
 * @throws {Error} Si transición inválida o no existe
 */
const actualizarEstadoOrden = async (ordenId, nuevoEstado, datosPago = {}) => {
  // Validar ObjectId
  if (!validObjectId(ordenId)) {
    throw new Error("El id de la orden no es válido");
  }

  // Validar estado
  const estadosValidos = ["PENDIENTE_PAGO", "PAGADA", "FALLIDA", "CANCELADA"];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error(
      "Estado inválido. Debe ser: PENDIENTE_PAGO, PAGADA, FALLIDA o CANCELADA",
    );
  }

  const orden = await Orden.findById(ordenId);
  if (!orden) {
    throw new Error("La orden no existe");
  }

  // Validar transiciones permitidas
  const estadoActual = orden.estado;

  // De PENDIENTE_PAGO puede ir a cualquiera
  // De PAGADA no puede cambiar a nada
  if (estadoActual === "PAGADA") {
    throw new Error("Una orden pagada no puede cambiar de estado");
  }

  // De FALLIDA o CANCELADA solo puede volver a PENDIENTE_PAGO
  if (
    (estadoActual === "FALLIDA" || estadoActual === "CANCELADA") &&
    nuevoEstado !== "PENDIENTE_PAGO"
  ) {
    throw new Error(
      `Una orden ${estadoActual} solo puede volver a PENDIENTE_PAGO`,
    );
  }

  // Actualizar estado
  orden.estado = nuevoEstado;

  // Si se pagó, guardar datos del pago
  if (nuevoEstado === "PAGADA") {
    orden.fechaPago = new Date();

    if (datosPago.stripePaymentIntentId) {
      orden.stripePaymentIntentId = datosPago.stripePaymentIntentId;
    }

    if (datosPago.stripeCheckoutSessionId) {
      orden.stripeCheckoutSessionId = datosPago.stripeCheckoutSessionId;
    }

    // Actualizar inventario de productos (restar stock)
    await descontarInventario(orden.items);

    // Marcar carrito como COMPLETADO
    const carrito = await Carrito.findById(orden.carritoId);
    if (carrito) {
      carrito.estado = "COMPLETADO";
      await carrito.save();
    }
  }

  // Si se canceló, marcar carrito como EXPIRADO
  if (nuevoEstado === "CANCELADA") {
    const carrito = await Carrito.findById(orden.carritoId);
    if (carrito && carrito.estado === "CHEQUEANDO") {
      carrito.estado = "EXPIRADO";
      await carrito.save();
    }
  }

  await orden.save();

  // Popular antes de retornar
  await orden.populate("usuarioId", "nombreUsuario correo");
  await orden.populate("items.productoId", "nombreProducto img inventario");

  return orden;
};

/**
 * Cancelar orden (solo si está PENDIENTE_PAGO)
 *
 * @param {String} ordenId - ID de la orden
 * @param {String} usuarioId - ID del usuario (para validar pertenencia)
 * @returns {Promise<Object>} orden cancelada
 * @throws {Error} Si no existe, no pertenece al usuario o ya está procesada
 */
const cancelarOrden = async (ordenId, usuarioId) => {
  // Validar ObjectId
  if (!validObjectId(ordenId)) {
    throw new Error("El id de la orden no es válido");
  }

  if (!validObjectId(usuarioId)) {
    throw new Error("El id del usuario no es válido");
  }

  const orden = await Orden.findById(ordenId);

  if (!orden) {
    throw new Error("La orden no existe");
  }

  // Validar pertenencia
  if (orden.usuarioId.toString() !== usuarioId.toString()) {
    throw new Error("No tienes permisos para cancelar esta orden");
  }

  // Solo se puede cancelar si está PENDIENTE_PAGO
  if (orden.estado !== "PENDIENTE_PAGO") {
    throw new Error(
      `No se puede cancelar una orden con estado ${orden.estado}`,
    );
  }

  // Cambiar estado a CANCELADA
  return await actualizarEstadoOrden(ordenId, "CANCELADA");
};

/**
 * HELPER INTERNO: Calcular desglose fiscal según tipo de facturación
 *
 * @param {String} tipoFacturacion - CONSUMIDOR_FINAL o RESPONSABLE_INSCRIPTO
 * @param {Number} total - Total de la compra
 * @returns {Object} { tipoFactura, baseImponible, IVA21, total }
 */
const calcularDesgloseFiscal = (tipoFacturacion, total) => {
  if (tipoFacturacion === "RESPONSABLE_INSCRIPTO") {
    // Factura A: Discrimina IVA
    const baseImponible = total / 1.21; // Quitar IVA del total
    const IVA21 = total - baseImponible;

    return {
      tipoFactura: "A",
      baseImponible: Math.round(baseImponible * 100) / 100,
      IVA21: Math.round(IVA21 * 100) / 100,
      total,
    };
  } else {
    // Factura B o C: No discrimina IVA
    const tipoFactura = total > 100000 ? "B" : "C"; // Ejemplo simplificado

    return {
      tipoFactura,
      baseImponible: null,
      IVA21: null,
      total,
    };
  }
};

/**
 * HELPER INTERNO: Descontar inventario de productos
 *
 * @param {Array} items - Items de la orden
 * @returns {Promise<void>}
 */
const descontarInventario = async (items) => {
  for (const item of items) {
    const producto = await Producto.findById(item.productoId);

    if (producto) {
      // Restar cantidad del inventario
      producto.inventario -= item.cantidad;

      // Evitar inventario negativo
      if (producto.inventario < 0) {
        producto.inventario = 0;
      }

      await producto.save();
    }
  }
};

module.exports = {
  obtenerOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  actualizarEstadoOrden,
  cancelarOrden,
};
