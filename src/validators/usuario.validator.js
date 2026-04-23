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
  body("contraseñaActual")
    .exists({ checkFalsy: true })
    .withMessage("La contraseña actual es obligatoria"),
  body("contraseñaNueva")
    .exists({ checkFalsy: true })
    .withMessage("La nueva contraseña es requerida")
    .isLength({ min: 8, max: 64 })
    .withMessage("La contraseña debe tener entre 8 y 64 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe tener al menos una mayúscula")
    .matches(/\d/)
    .withMessage("La contraseña debe tener al menos un número")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("La contraseña debe tener al menos un carácter especial"),
];

module.exports = { actualizarPerfilValidator, actualizarUsuarioValidator, cambiarContrasenaValidator };
