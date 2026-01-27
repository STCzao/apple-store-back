/**
 * RUTAS DE AUTENTICACIÓN
 * 
 * Endpoints para registro, login y renovación de token
 * 
 * @module AuthRoutes
 */

const { Router } = require("express");
const { check } = require("express-validator");
const {
  validarCampos, validarJWT } = require("../middlewares/index");
const { register, login , renovarToken,  } = require("../controllers/auth");

const router = Router();

/**
 * @route POST /api/auth/registro
 * @access Public
 * @description Registrar nuevo usuario
 * 
 * @body {String} nombreUsuario - Nombre (3-40 caracteres, obligatorio)
 * @body {String} correo - Email válido (obligatorio, único)
 * @body {String} contraseña - Contraseña (6+ caracteres, obligatorio)
 * @body {String} telefono - Teléfono (7-15 dígitos, obligatorio)
 * @body {String} DNI - DNI (8 dígitos, obligatorio, único)
 * @body {String} CUIL - CUIL (formato: 20-12345678-9, obligatorio, único)
 * @body {Object} domicilioFiscal - Domicilio fiscal (obligatorio)
 * @body {String} domicilioFiscal.calle - Calle (obligatorio)
 * @body {String} domicilioFiscal.numero - Número (obligatorio)
 * @body {String} domicilioFiscal.ciudad - Ciudad (obligatorio)
 * @body {String} domicilioFiscal.provincia - Provincia (obligatorio)
 * @body {String} domicilioFiscal.codigoPostal - Código postal (obligatorio)
 * 
 * @returns {Object} { usuario, token }
 * 
 * @example
 * POST /api/auth/registro
 * Body: {
 *   "nombreUsuario": "Juan Pérez",
 *   "correo": "juan@example.com",
 *   "contraseña": "123456",
 *   "telefono": "1234567890",
 *   "DNI": "12345678",
 *   "CUIL": "20-12345678-9",
 *   "domicilioFiscal": {
 *     "calle": "Av. Corrientes",
 *     "numero": "1234",
 *     "ciudad": "CABA",
 *     "provincia": "Buenos Aires",
 *     "codigoPostal": "1043"
 *   }
 * }
 * 
 * Respuesta exitosa (201):
 * {
 *   "usuario": {
 *     "uid": "65abc123...",
 *     "nombreUsuario": "Juan Pérez",
 *     "correo": "juan@example.com",
 *     "rol": "USER_ROLE",
 *     "estado": true
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */

router.post(
  "/registro",
  [
    check("nombreUsuario", "El nombre es obligatorio").not().isEmpty(),
    check("nombreUsuario", "El nombre debe tener entre 3 y 40 caracteres").isLength({ min: 3, max: 40 }),
    check("correo", "El correo no es valido").isEmail(),
    check("contraseña", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
    check("telefono", "El teléfono es obligatorio").not().isEmpty(),
    check("telefono", "El teléfono debe tener entre 7 y 15 dígitos").isLength({ min: 7, max: 15 }),
    check("DNI", "El DNI es obligatorio").not().isEmpty(),
    check("DNI", "El DNI debe tener 8 dígitos").isLength({ min: 8, max: 8 }),
    check("CUIL", "El CUIL es obligatorio").not().isEmpty(),
    check("CUIL", "CUIL inválido. Formato: 20-12345678-9").matches(/^\d{2}-\d{8}-\d{1}$/),
    check("domicilioFiscal.calle", "La calle es obligatoria").not().isEmpty(),
    check("domicilioFiscal.numero", "El número es obligatorio").not().isEmpty(),
    check("domicilioFiscal.ciudad", "La ciudad es obligatoria").not().isEmpty(),
    check("domicilioFiscal.provincia", "La provincia es obligatoria").not().isEmpty(),
    check("domicilioFiscal.codigoPostal", "El código postal es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  register
);

/**
 * @route POST /api/auth/login
 * @access Public
 * @description Iniciar sesión
 * 
 * @body {String} correo - Email del usuario (obligatorio)
 * @body {String} contraseña - Contraseña (obligatorio)
 * 
 * @returns {Object} { usuario, token }
 * 
 * @example
 * POST /api/auth/login
 * Body: {
 *   "correo": "juan@example.com",
 *   "contraseña": "123456"
 * }
 * 
 * Respuesta exitosa (200):
 * {
 *   "usuario": {
 *     "uid": "65abc123...",
 *     "nombreUsuario": "Juan Pérez",
 *     "correo": "juan@example.com",
 *     "rol": "USER_ROLE"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Errores:
 * - 400: Correo/contraseña incorrectos
 * - 400: Usuario inhabilitado
 */

router.post(
  "/login",
  [ 
    check("correo", "El correo es obligatorio ").isEmail(),
    check("contraseña", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  login
);

/**
 * @route GET /api/auth/renovar
 * @access Private
 * @description Renovar token JWT
 * 
 * @header {String} x-token - Token JWT actual
 * 
 * @returns {Object} { usuario, token }
 * 
 * @example
 * GET /api/auth/renovar
 * Headers: { "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * 
 * Respuesta exitosa (200):
 * {
 *   "usuario": { ... },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (nuevo token)
 * }
 * 
 * Uso:
 * - Frontend llama este endpoint antes de que expire el token
 * - Útil para mantener sesión activa sin hacer login de nuevo
 */

router.get("/renovar", [validarJWT], renovarToken);

module.exports = router;