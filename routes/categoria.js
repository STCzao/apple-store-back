/**
 * RUTAS DE CATEGORÍAS
 *
 * Endpoints para gestión de categorías de productos
 *
 * @module CategoriaRoutes
 */

const { Router } = require("express");
const { check } = require("express-validator");
const {
  validarCampos,
  validarJWT,
  esAdminRole,
} = require("../middlewares/index");
const {
  categoriasGet,
  categoriaGet,
  categoriaPost,
  categoriaPut,
  categoriaDelete,
} = require("../controllers/categoria");

const router = Router();

/**
 * @route GET /api/categoria
 * @access Public
 * @description Listar todas las categorías activas con paginación
 *
 * @query {Number} limite - Categorías por página (default: 10, máx: 100)
 * @query {Number} desde - Posición inicial (default: 0)
 *
 * @returns {Object} { total, categorias[] }
 *
 * @example
 * GET /api/categoria?limite=20&desde=0
 *
 * Respuesta exitosa (200):
 * {
 *   "total": 45,
 *   "categorias": [
 *     {
 *       "uid": "65abc...",
 *       "nombreCategoria": "iphone",
 *       "descripcion": "Smartphones Apple",
 *       "img": "https://cloudinary.com/...",
 *       "estado": true,
 *       "usuario": {
 *         "nombreUsuario": "Admin Principal",
 *         "correo": "admin@apple.com"
 *       },
 *       "createdAt": "2026-01-28T10:30:00.000Z",
 *       "updatedAt": "2026-01-28T10:30:00.000Z"
 *     }
 *     // ... más categorías
 *   ]
 * }
 */

router.get("/", categoriasGet);

/**
 * @route GET /api/categoria/:id
 * @access Public
 * @description Obtener detalles de una categoría específica
 *
 * @param {String} id - MongoDB ObjectId de la categoría
 *
 * @returns {Object} { categoria }
 *
 * @example
 * GET /api/categoria/65abc123def456789012abcd
 *
 * Respuesta exitosa (200):
 * {
 *   "categoria": {
 *     "uid": "65abc123def456789012abcd",
 *     "nombreCategoria": "iphone",
 *     "descripcion": "Toda la línea de smartphones iPhone de Apple",
 *     "img": "https://res.cloudinary.com/...",
 *     "estado": true,
 *     "usuario": {
 *       "nombreUsuario": "Admin Principal",
 *       "correo": "admin@apple.com"
 *     },
 *     "createdAt": "2026-01-28T10:30:00.000Z",
 *     "updatedAt": "2026-01-28T10:30:00.000Z"
 *   }
 * }
 *
 * Errores:
 * - 400: ID de categoría no es válido
 * - 404: Categoría no encontrada o eliminada
 */

router.get("/:id", categoriaGet);

/**
 * @route POST /api/categoria
 * @access Private - ADMIN_ROLE
 * @description Crear nueva categoría
 *
 * @body {String} nombreCategoria - Nombre único (3-50 caracteres, obligatorio)
 * @body {String} descripcion - Descripción (max 200 caracteres, opcional)
 * @body {String} img - URL de imagen de Cloudinary (opcional)
 *
 * @returns {Object} { categoria }
 *
 * @example
 * POST /api/categoria
 * Headers: { "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * Body: {
 *   "nombreCategoria": "iPhone",
 *   "descripcion": "Toda la línea de smartphones iPhone de Apple",
 *   "img": "https://res.cloudinary.com/tu-cloud/image/upload/v123/categorias/iphone-banner.jpg"
 * }
 *
 * Respuesta exitosa (201):
 * {
 *   "categoria": {
 *     "uid": "65abc123...",
 *     "nombreCategoria": "iphone",
 *     "descripcion": "Toda la línea de smartphones iPhone de Apple",
 *     "img": "https://res.cloudinary.com/...",
 *     "estado": true,
 *     "usuario": "65def456...",
 *     "createdAt": "2026-01-28T14:30:00.000Z",
 *     "updatedAt": "2026-01-28T14:30:00.000Z"
 *   }
 * }
 *
 * Errores:
 * - 401: Token inválido o faltante
 * - 403: Usuario no es administrador
 * - 400: Validación fallida (nombre muy corto, descripción muy larga, etc.)
 * - 400: La categoría ya existe
 */

router.post(
  "/",
  [
    validarJWT,
    esAdminRole,
    check("nombreCategoria", "El nombre de la categoría es obligatorio")
      .notEmpty()
      .isLength({ min: 3, max: 50 }),
    check("descripcion", "La descripción no puede tener más de 200 caracteres")
      .optional()
      .isLength({ max: 200 }),
    check("img", "Debe ser una URL válida")
      .optional({ nullable: true })
      .isURL(),
    validarCampos,
  ],
  categoriaPost,
);

/**
 * @route PUT /api/categoria/:id
 * @access Private - ADMIN_ROLE
 * @description Actualizar categoría existente
 *
 * @param {String} id - MongoDB ObjectId de la categoría
 * @body {String} nombreCategoria - Nuevo nombre (3-50 caracteres, opcional)
 * @body {String} descripcion - Nueva descripción (max 200 caracteres, opcional)
 * @body {String} img - Nueva URL de imagen (opcional, nullable)
 *
 * @returns {Object} { categoria }
 *
 * @example
 * PUT /api/categoria/65abc123def456789012abcd
 * Headers: { "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * Body: {
 *   "descripcion": "Nueva descripción actualizada"
 * }
 *
 * Respuesta exitosa (200):
 * {
 *   "categoria": {
 *     "uid": "65abc123...",
 *     "nombreCategoria": "iphone",
 *     "descripcion": "Nueva descripción actualizada",
 *     "img": "https://res.cloudinary.com/...",
 *     "estado": true,
 *     "usuario": "65def456...",
 *     "createdAt": "2026-01-28T10:30:00.000Z",
 *     "updatedAt": "2026-01-28T15:45:00.000Z"
 *   }
 * }
 *
 * Errores:
 * - 401: Token inválido
 * - 403: Usuario no es administrador
 * - 400: ID inválido o validación fallida
 * - 404: Categoría no encontrada
 * - 400: Ya existe una categoría con ese nombre
 */

router.put(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("nombreCategoria", "El nombre debe tener entre 3 y 50 caracteres")
      .optional()
      .isLength({ min: 3, max: 50 }),
    check("descripcion", "La descripción no puede tener más de 200 caracteres")
      .optional()
      .isLength({ max: 200 }),
    check("img", "Debe ser una URL válida")
      .optional({ nullable: true })
      .isURL(),
    validarCampos,
  ],
  categoriaPut,
);

/**
 * @route DELETE /api/categoria/:id
 * @access Private - ADMIN_ROLE
 * @description Soft delete de categoría (estado = false)
 *
 * @param {String} id - MongoDB ObjectId de la categoría
 *
 * @returns {Object} { categoria, msg }
 *
 * @example
 * DELETE /api/categoria/65abc123def456789012abcd
 * Headers: { "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *
 * Respuesta exitosa (200):
 * {
 *   "categoria": {
 *     "uid": "65abc123...",
 *     "nombreCategoria": "iphone",
 *     "descripcion": "...",
 *     "estado": false,
 *     "usuario": "65def456...",
 *     "createdAt": "2026-01-28T10:30:00.000Z",
 *     "updatedAt": "2026-01-28T16:00:00.000Z"
 *   },
 *   "msg": "Categoría eliminada correctamente"
 * }
 *
 * Errores:
 * - 401: Token inválido
 * - 403: Usuario no es administrador
 * - 400: ID inválido
 * - 404: Categoría no encontrada
 */

router.delete("/:id", [validarJWT, esAdminRole], categoriaDelete);

module.exports = router;
