const { body } = require("express-validator");

const crearCategoriaValidator = [
  body("nombreCategoria").trim().notEmpty().withMessage("El nombre de la categoría es obligatorio")
    .isLength({ min: 3, max: 50 }).withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  body("descripcion").optional().trim()
    .isLength({ max: 200 }).withMessage("La descripción no puede tener más de 200 caracteres"),
];

const actualizarCategoriaValidator = [
  body("nombreCategoria").optional().trim()
    .isLength({ min: 3, max: 50 }).withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  body("descripcion").optional().trim()
    .isLength({ max: 200 }).withMessage("La descripción no puede tener más de 200 caracteres"),
];

module.exports = { crearCategoriaValidator, actualizarCategoriaValidator };
