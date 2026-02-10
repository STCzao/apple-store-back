/**
 * RUTAS DE USUARIOS
 *
 * Endpoints para gestión de usuarios
 *
 * @module UsuarioRoutes
 */

const { Router } = require("express");
const { check } = require("express-validator");
const {
  validarCampos,
  validarJWT,
  esAdminRole,
} = require("../middlewares/index");
const {
  usuariosGet,
  usuarioGet,
  usuarioPut,
  usuarioDelete,
  perfilGet,
  perfilPut,
  cambiarContrasena,
} = require("../controllers/usuario");

const router = Router();

/**
 * @route GET /api/usuario
 * @access Private - ADMIN_ROLE
 * @description Listar usuarios con paginación
 *
 * @query {Number} limite - Usuarios por página (default: 10, máx: 100)
 * @query {Number} desde - Posición inicial (default: 0)
 *
 * @returns {Object} { total, usuarios[] }
 */

router.get("/", [validarJWT, esAdminRole], usuariosGet);

/**
 * @route GET /api/usuario/perfil
 * @access Private - Usuario autenticado
 * @description Obtener perfil del usuario autenticado
 *
 * @returns {Object} { usuario }
 */

router.get("/perfil", [validarJWT], perfilGet);

/**
 * @route PUT /api/usuario/perfil
 * @access Private - Usuario autenticado
 * @description Actualizar perfil del usuario autenticado
 *
 * CAMPOS MODIFICABLES:
 * @body {String} nombreUsuario - Nombre completo (3-40 caracteres, solo letras y espacios)
 * @body {String} telefono - Teléfono (7-15 dígitos numéricos)
 * @body {String} CUIL - CUIL en formato XX-XXXXXXXX-X
 * @body {String} img - URL de imagen de perfil (opcional, nullable)
 * @body {String} tipoFacturacion - "CONSUMIDOR_FINAL" o "RESPONSABLE_INSCRIPTO"
 * @body {String} razonSocial - Razón social (opcional, solo para Responsables Inscriptos)
 * @body {Object} domicilioFiscal - Domicilio fiscal completo
 * @body {String} domicilioFiscal.calle - Calle
 * @body {String} domicilioFiscal.numero - Número
 * @body {String} domicilioFiscal.ciudad - Ciudad
 * @body {String} domicilioFiscal.provincia - Provincia
 * @body {String} domicilioFiscal.codigoPostal - Código postal
 *
 * CAMPOS BLOQUEADOS (devuelven error 400):
 * - correo (requiere endpoint específico con verificación)
 * - DNI (inmutable, contactar soporte)
 * - contraseña (usar POST /cambiar-contrasena)
 * - rol (solo admin puede modificar)
 * - estado (solo admin puede modificar)
 *
 * @returns {Object} { usuario }
 *
 * @example
 * PUT /api/usuario/perfil
 * Headers: { "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * Body: {
 *   "nombreUsuario": "Juan Pérez",
 *   "telefono": "1145678901",
 *   "img": "https://cloudinary.com/avatars/user123.jpg"
 * }
 */

router.put(
  "/perfil",
  [
    validarJWT,

    // BLOQUEAR campos sensibles/críticos
    check("correo", "El correo no puede ser modificado desde aquí")
      .not()
      .exists(),
    check("DNI", "El DNI no puede ser modificado").not().exists(),
    check("rol", "El rol no puede ser modificado").not().exists(),
    check("contraseña", "La contraseña no puede ser modificada aquí")
      .not()
      .exists(),
    check("estado", "El estado no puede ser modificado").not().exists(),

    // VALIDAR campos permitidos
    check("nombreUsuario", "El nombre debe tener entre 3 y 40 caracteres")
      .optional()
      .isLength({ min: 3, max: 40 })
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage("El nombre solo puede contener letras y espacios"),

    check("telefono", "El teléfono debe contener entre 7 y 15 dígitos")
      .optional()
      .isLength({ min: 7, max: 15 })
      .isNumeric()
      .withMessage("El teléfono solo puede contener números"),

    check("CUIL", "CUIL inválido. Formato: 20-12345678-9")
      .optional()
      .matches(/^\d{2}-\d{8}-\d{1}$/),

    check("img", "La URL de imagen no es válida")
      .optional({ nullable: true })
      .isURL()
      .withMessage("Debe ser una URL válida"),

    check("tipoFacturacion", "Tipo de facturación inválido")
      .optional()
      .isIn(["CONSUMIDOR_FINAL", "RESPONSABLE_INSCRIPTO"]),

    check("razonSocial", "La razón social no puede tener más de 100 caracteres")
      .optional()
      .isLength({ max: 100 }),

    // Validaciones de domicilioFiscal anidado
    check("domicilioFiscal.calle", "La calle es obligatoria si se envía domicilio")
      .optional()
      .notEmpty(),
    check("domicilioFiscal.numero", "El número es obligatorio si se envía domicilio")
      .optional()
      .notEmpty(),
    check("domicilioFiscal.ciudad", "La ciudad es obligatoria si se envía domicilio")
      .optional()
      .notEmpty(),
    check("domicilioFiscal.provincia", "La provincia es obligatoria si se envía domicilio")
      .optional()
      .notEmpty(),
    check("domicilioFiscal.codigoPostal", "El código postal es obligatorio si se envía domicilio")
      .optional()
      .notEmpty(),

    validarCampos,
  ],
  perfilPut,
);

/**
 * @route GET /api/usuario/:id
 * @access Private - ADMIN_ROLE
 * @description Obtener usuario específico por ID
 *
 * @param {String} id - MongoDB ObjectId del usuario
 *
 * @returns {Object} { usuario }
 */

router.get("/:id", [validarJWT, esAdminRole], usuarioGet);

/**
 * @route PUT /api/usuario/:id
 * @access Private - ADMIN_ROLE
 * @description Actualizar usuario (solo admin)
 *
 * @param {String} id - MongoDB ObjectId del usuario
 * @body Campos a actualizar
 *
 * @returns {Object} { usuario }
 */

router.put(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("correo", "El correo no es válido").optional().isEmail(),
    check("nombreUsuario", "El nombre debe tener entre 3 y 40 caracteres")
      .optional()
      .isLength({ min: 3, max: 40 }),
    validarCampos,
  ],
  usuarioPut,
);

/**
 * @route DELETE /api/usuario/:id
 * @access Private - ADMIN_ROLE
 * @description Soft delete de usuario (estado = false)
 *
 * @param {String} id - MongoDB ObjectId del usuario
 *
 * @returns {Object} { usuario }
 */

router.delete("/:id", [validarJWT, esAdminRole], usuarioDelete);

/**
 * @route POST /api/usuario/cambiar-contrasena
 * @access Private - Usuario autenticado
 * @description Cambiar contraseña del usuario autenticado
 *
 * @body {String} contraseñaActual - Contraseña actual (obligatorio)
 * @body {String} contraseñaNueva - Nueva contraseña (mínimo 6 caracteres)
 *
 * @returns {Object} { msg }
 *
 * @example
 * POST /api/usuario/cambiar-contrasena
 * Headers: { "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * Body: {
 *   "contraseñaActual": "miPasswordVieja123",
 *   "contraseñaNueva": "miPasswordNueva456"
 * }
 *
 * Respuesta exitosa (200):
 * {
 *   "msg": "Contraseña actualizada correctamente. Por seguridad, inicia sesión nuevamente."
 * }
 *
 * Errores:
 * - 401: Contraseña actual incorrecta
 * - 400: Nueva contraseña igual a la actual
 * - 400: Validación fallida (mínimo 6 caracteres)
 */

router.post(
  "/cambiar-contrasena",
  [
    validarJWT,
    check("contraseñaActual", "La contraseña actual es obligatoria")
      .notEmpty(),
    check("contraseñaNueva", "La nueva contraseña debe tener al menos 6 caracteres")
      .isLength({ min: 6 }),
    validarCampos,
  ],
  cambiarContrasena
);

module.exports = router;
