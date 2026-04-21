const { body } = require("express-validator");

const actualizarPerfilValidator = [
  body("correo").not().exists().withMessage("El correo no puede modificarse desde aquí"),
  body("contraseña").not().exists().withMessage("La contraseña no puede modificarse aquí"),
  body("rol").not().exists().withMessage("El rol no puede modificarse"),
  body("estado").not().exists().withMessage("El estado no puede modificarse"),
  body("nombreUsuario").optional().trim()
    .isLength({ min: 3, max: 40 }).withMessage("El nombre debe tener entre 3 y 40 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El nombre solo puede contener letras y espacios"),
];

const actualizarUsuarioValidator = [
  body("correo").optional().isEmail().withMessage("El correo no es válido").normalizeEmail(),
  body("nombreUsuario").optional().trim()
    .isLength({ min: 3, max: 40 }).withMessage("El nombre debe tener entre 3 y 40 caracteres"),
  body("rol").optional().isIn(["ADMIN_ROLE", "USER_ROLE"]).withMessage("El rol no es válido"),
];

const cambiarContrasenaValidator = [
  body("contraseñaActual").notEmpty().withMessage("La contraseña actual es obligatoria"),
  body("contraseñaNueva").isLength({ min: 6 }).withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
];

module.exports = { actualizarPerfilValidator, actualizarUsuarioValidator, cambiarContrasenaValidator };
