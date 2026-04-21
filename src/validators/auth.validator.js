const { body } = require("express-validator");

const registerValidator = [
  body("nombreUsuario").trim().notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 3, max: 40 }).withMessage("El nombre debe tener entre 3 y 40 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El nombre solo puede contener letras y espacios"),
  body("correo").isEmail().withMessage("El correo no es válido").normalizeEmail(),
  body("contraseña").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
];

const loginValidator = [
  body("correo").isEmail().withMessage("El correo no es válido").normalizeEmail(),
  body("contraseña").notEmpty().withMessage("La contraseña es obligatoria"),
];

const forgotPasswordValidator = [
  body("correo").isEmail().withMessage("El correo no es válido").normalizeEmail(),
];

const resetPasswordValidator = [
  body("contraseña").isLength({ min: 6 }).withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
];

module.exports = { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator };
