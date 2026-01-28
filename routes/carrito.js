/**
 * RUTAS DE CARRITO
 * 
 * Endpoints para gestionar el carrito de compras
 * Todas las rutas requieren autenticación (validarJWT)
 * 
 * @module CarritoRoutes
 */

const { Router } = require("express");
const { check } = require("express-validator");
const { validarJWT, validarCampos } = require("../middlewares/index");
const {
  carritoGet,
  carritoPost,
  carritoPut,
  carritoDeleteItem,
  carritoDelete,
} = require("../controllers/carrito");

const router = Router();

/**
 * @route GET /api/carrito
 * @access Private - Requiere JWT
 * @description Obtener carrito activo del usuario
 * @returns {Object} { carrito }
 */
router.get("/", [validarJWT], carritoGet);

/**
 * @route POST /api/carrito
 * @access Private - Requiere JWT
 * @description Agregar producto al carrito
 * @body {String} productoId - ID del producto (ObjectId válido)
 * @body {Number} cantidad - Cantidad a agregar (opcional, default: 1, min: 1, max: 100)
 * @returns {Object} { carrito, msg }
 */
router.post(
  "/",
  [
    validarJWT,
    check("productoId", "El productoId es obligatorio").notEmpty(),
    check("productoId", "El productoId debe ser un ID válido").isMongoId(),
    check("cantidad")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("La cantidad debe ser un número entre 1 y 100"),
    validarCampos,
  ],
  carritoPost
);

/**
 * @route PUT /api/carrito/:productoId
 * @access Private - Requiere JWT
 * @description Actualizar cantidad de un producto en el carrito
 * @param {String} productoId - ID del producto
 * @body {Number} cantidad - Nueva cantidad (min: 1, max: 100)
 * @returns {Object} { carrito, msg }
 */
router.put(
  "/:productoId",
  [
    validarJWT,
    check("productoId", "El productoId debe ser un ID válido").isMongoId(),
    check("cantidad", "La cantidad es obligatoria").notEmpty(),
    check("cantidad")
      .isInt({ min: 1, max: 100 })
      .withMessage("La cantidad debe ser un número entre 1 y 100"),
    validarCampos,
  ],
  carritoPut
);

/**
 * @route DELETE /api/carrito/:productoId
 * @access Private - Requiere JWT
 * @description Eliminar un producto del carrito
 * @param {String} productoId - ID del producto a eliminar
 * @returns {Object} { carrito, msg }
 */
router.delete(
  "/:productoId",
  [
    validarJWT,
    check("productoId", "El productoId debe ser un ID válido").isMongoId(),
    validarCampos,
  ],
  carritoDeleteItem
);

/**
 * @route DELETE /api/carrito
 * @access Private - Requiere JWT
 * @description Vaciar carrito completamente
 * @returns {Object} { carrito, msg }
 */
router.delete("/", [validarJWT], carritoDelete);

module.exports = router;