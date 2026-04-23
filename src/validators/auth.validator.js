const { body } = require("express-validator");

const passwordComplexity = (field) =>
  body(field)
    .exists({ checkFalsy: true })
    .withMessage("La contraseña es requerida")
    .isLength({ min: 8, max: 64 })
    .withMessage("La contraseña debe tener entre 8 y 64 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe tener al menos una mayúscula")
    .matches(/\d/)
    .withMessage("La contraseña debe tener al menos un número")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("La contraseña debe tener al menos un carácter especial");

const correoValidator = (field = "correo") =>
  body(field)
    .exists({ checkFalsy: true })
    .withMessage("El correo es requerido")
    .isEmail()
    .withMessage("El correo no es válido")
    .isLength({ min: 5, max: 100 })
    .withMessage("El mail debe tener entre 5 y 100 caracteres")
    .normalizeEmail();

const registerValidator = [
  body("nombreUsuario")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 3, max: 40 })
    .withMessage("El nombre debe tener entre 3 y 40 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),
  body("correo")
    .isEmail()
    .withMessage("El correo no es válido")
    .normalizeEmail(),
  body("fechaNacimiento")
    .exists({ checkFalsy: true })
    .withMessage("La fecha de nacimiento es requerida")
    .isISO8601()
    .withMessage("La fecha de nacimiento debe tener el formato YYYY-MM-DD")
    .custom((value) => {
      if (new Date(value) >= new Date())
        throw new Error("La fecha de nacimiento debe ser en el pasado");
      return true;
    }),
  passwordComplexity("contraseña"),
  body("confirmarContraseña")
    .exists({ checkFalsy: true })
    .withMessage("La confirmacion de contraseña es requerida")
    .custom((value, { req }) => {
      if (value !== req.body.contraseña)
        throw new Error("Las contraseñas no coinciden");
      return true;
    }),
];

const loginValidator = [
  correoValidator(),
  body("contraseña")
    .exists({ checkFalsy: true })
    .withMessage("La contraseña es requerida")
    .isLength({ min: 8, max: 64 })
    .withMessage("La contraseña debe tener entre 8 y 64 caracteres"),
];

const forgotPasswordValidator = [correoValidator()];

const resetPasswordValidator = [passwordComplexity("contraseña")];

const reenviarVerificacionValidator = [correoValidator()];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  reenviarVerificacionValidator,
};
