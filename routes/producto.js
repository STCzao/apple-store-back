/**
 * RUTAS DE PRODUCTOS
 * 
 * Define los endpoints para gestionar productos en la tienda
 * 
 * Patrón de seguridad:
 * - GET (Lectura): Público - Acceso sin autenticación
 * - POST/PUT/DELETE (Escritura): Protegido - Requiere ADMIN_ROLE
 * 
 * Middlewares aplicados:
 * - validarJWT: Verifica token válido
 * - esAdminRole: Verifica que el usuario sea administrador
 * 
 * @module ProductoRoutes
 */

const { Router } = require("express");
const { validarJWT, esAdminRole } = require("../middlewares/index");
const {
  productosGet,
  productoGet,
  productoPost,
  productoPut,
  productoDelete,
} = require("../controllers/producto");

const router = Router();

/**
 * @route GET /api/productos
 * @access Public
 * @description Obtener listado paginado de productos activos
 * @query {Number} limite - Productos por página (default: 12, máx: 100)
 * @query {Number} desde - Posición inicial (default: 0)
 * @returns {Object} { total, productos[] }
 */
router.get("/", productosGet);

/**
 * @route GET /api/productos/:id
 * @access Public
 * @description Obtener un producto específico por ID
 * @param {String} id - MongoDB ObjectId del producto
 * @returns {Object} { producto }
 */
router.get("/:id", productoGet);

/**
 * @route POST /api/productos
 * @access Private - ADMIN_ROLE required
 * @description Crear un nuevo producto
 * @middleware validarJWT - Valida token JWT
 * @middleware esAdminRole - Valida rol administrador
 * @body {String} nombreProducto - (Obligatorio, 3-50 chars)
 * @body {String} marca - (Obligatorio, 2-30 chars)
 * @body {String} categoria - MongoDB ObjectId (Obligatorio)
 * @body {Number} precio - (Obligatorio, > 0)
 * @body {String} descripcion - (Obligatorio, 10-500 chars)
 * @body {String} img - URL de imagen (Opcional)
 * @body {Number} inventario - Stock inicial (Obligatorio, >= 0)
 * @body {Boolean} estado - (Opcional, default: true)
 * @returns {Object} { producto, msg }
 */
router.post("/", [validarJWT, esAdminRole], productoPost);

/**
 * @route PUT /api/productos/:id
 * @access Private - ADMIN_ROLE required
 * @description Actualizar producto existente
 * @middleware validarJWT - Valida token JWT
 * @middleware esAdminRole - Valida rol administrador
 * @param {String} id - MongoDB ObjectId del producto
 * @body {String} nombreProducto - (Opcional)
 * @body {String} marca - (Opcional)
 * @body {String} categoria - (Opcional)
 * @body {Number} precio - (Opcional, > 0 si se envía)
 * @body {String} descripcion - (Opcional)
 * @body {String} img - (Opcional)
 * @body {Number} inventario - (Opcional, >= 0 si se envía)
 * @body {Boolean} estado - (Opcional)
 * @body {Boolean} destacado - (Opcional)
 * @returns {Object} { producto, msg }
 * 
 * Nota: El campo creadoPor (creador) es PROTEGIDO y no puede cambiar
 */
router.put("/:id", [validarJWT, esAdminRole], productoPut);

/**
 * @route DELETE /api/productos/:id
 * @access Private - ADMIN_ROLE required
 * @description Eliminar (soft delete) un producto
 * @middleware validarJWT - Valida token JWT
 * @middleware esAdminRole - Valida rol administrador
 * @param {String} id - MongoDB ObjectId del producto
 * @returns {Object} { producto, msg }
 * 
 * Nota: Usa soft delete (estado: false) en lugar de borrar de BD
 */
router.delete("/:id", [validarJWT, esAdminRole], productoDelete);

module.exports = router;
