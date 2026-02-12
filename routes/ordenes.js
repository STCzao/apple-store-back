/**
 * RUTAS DE ÓRDENES
 *
 * Endpoints para gestionar órdenes de compra
 * Todas las rutas requieren autenticación (validarJWT)
 *
 * @module OrdenRoutes
 */

const { Router } = require("express");
const { check } = require("express-validator");
const { validarJWT, validarCampos } = require("../middlewares/index");
const {
  ordenesGet,
  ordenGet,
  ordenPost,
  ordenPut,
  ordenDelete,
} = require("../controllers/orden");

const router = Router();

/**
 * @route GET /api/orden
 * @access Private - Requiere JWT
 * @description Obtener órdenes del usuario autenticado (paginadas)
 * @query {Number} limite - Cantidad por página (default: 10, max: 50)
 * @query {Number} desde - Posición inicial (default: 0)
 * @returns {Object} { total, ordenes }
 */
router.get("/", [validarJWT], ordenesGet);

/**
 * @route GET /api/orden/:id
 * @access Private - Requiere JWT
 * @description Obtener orden por ID (solo si pertenece al usuario)
 * @param {String} id - ID de la orden (ObjectId válido)
 * @returns {Object} { orden }
 */
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "El id debe ser un ID válido de MongoDB").isMongoId(),
    validarCampos,
  ],
  ordenGet,
);

/**
 * @route POST /api/orden
 * @access Private - Requiere JWT
 * @description Crear nueva orden desde carrito activo
 * @body {Object} datosFacturacion - Datos fiscales obligatorios
 * @body {String} datosFacturacion.tipoFacturacion - CONSUMIDOR_FINAL o RESPONSABLE_INSCRIPTO
 * @body {String} datosFacturacion.nombreCompleto - Nombre completo
 * @body {String} datosFacturacion.DNI - DNI
 * @body {String} datosFacturacion.CUIL - CUIL (obligatorio para Responsable Inscripto)
 * @body {String} datosFacturacion.razonSocial - Razón social (obligatorio para Responsable Inscripto)
 * @body {Object} datosFacturacion.domicilioFiscal - Domicilio completo
 * @body {String} datosFacturacion.domicilioFiscal.calle - Calle
 * @body {String} datosFacturacion.domicilioFiscal.numero - Número
 * @body {String} datosFacturacion.domicilioFiscal.ciudad - Ciudad
 * @body {String} datosFacturacion.domicilioFiscal.provincia - Provincia
 * @body {String} datosFacturacion.domicilioFiscal.codigoPostal - Código postal
 * @body {String} moneda - Moneda (ars/usd, default: ars)
 * @returns {Object} { orden, msg }
 */
router.post(
  "/",
  [
    validarJWT,
    // datosFacturacion es opcional - si no se proporciona, se usan los datos del usuario
    check("datosFacturacion")
      .optional()
      .isObject()
      .withMessage("datosFacturacion debe ser un objeto"),
    check(
      "datosFacturacion.tipoFacturacion",
      "El tipo de facturación debe ser CONSUMIDOR_FINAL o RESPONSABLE_INSCRIPTO",
    )
      .optional()
      .isIn(["CONSUMIDOR_FINAL", "RESPONSABLE_INSCRIPTO"]),
    check(
      "datosFacturacion.nombreCompleto",
      "El nombre completo debe ser una cadena de texto",
    )
      .optional()
      .isString(),
    check("datosFacturacion.DNI", "El DNI debe ser válido")
      .optional()
      .isString(),
    check(
      "datosFacturacion.domicilioFiscal",
      "El domicilio fiscal debe ser un objeto",
    )
      .optional()
      .isObject(),
    check(
      "datosFacturacion.domicilioFiscal.calle",
      "La calle debe ser una cadena de texto",
    )
      .optional()
      .isString(),
    check(
      "datosFacturacion.domicilioFiscal.numero",
      "El número debe ser una cadena de texto",
    )
      .optional()
      .isString(),
    check(
      "datosFacturacion.domicilioFiscal.ciudad",
      "La ciudad debe ser una cadena de texto",
    )
      .optional()
      .isString(),
    check(
      "datosFacturacion.domicilioFiscal.provincia",
      "La provincia debe ser una cadena de texto",
    )
      .optional()
      .isString(),
    check(
      "datosFacturacion.domicilioFiscal.codigoPostal",
      "El código postal debe ser una cadena de texto",
    )
      .optional()
      .isString(),
    check("moneda")
      .optional()
      .isIn(["ars", "usd"])
      .withMessage("La moneda debe ser 'ars' o 'usd'"),
    validarCampos,
  ],
  ordenPost,
);

/**
 * @route PUT /api/orden/:id
 * @access Private - Requiere JWT (normalmente admin o webhook)
 * @description Actualizar estado de orden
 * @param {String} id - ID de la orden
 * @body {String} estado - Nuevo estado (PENDIENTE_PAGO, PAGADA, FALLIDA, CANCELADA)
 * @body {Object} datosPago - Datos del pago (opcional)
 * @returns {Object} { orden, msg }
 */
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "El id debe ser un ID válido de MongoDB").isMongoId(),
    check("estado", "El estado es obligatorio").notEmpty(),
    check(
      "estado",
      "El estado debe ser: PENDIENTE_PAGO, PAGADA, FALLIDA o CANCELADA",
    ).isIn(["PENDIENTE_PAGO", "PAGADA", "FALLIDA", "CANCELADA"]),
    validarCampos,
  ],
  ordenPut,
);

/**
 * @route DELETE /api/orden/:id
 * @access Private - Requiere JWT
 * @description Cancelar orden (solo si está PENDIENTE_PAGO)
 * @param {String} id - ID de la orden a cancelar
 * @returns {Object} { orden, msg }
 */
router.delete(
  "/:id",
  [
    validarJWT,
    check("id", "El id debe ser un ID válido de MongoDB").isMongoId(),
    validarCampos,
  ],
  ordenDelete,
);

module.exports = router;
