const { body } = require("express-validator");

const crearProductoValidator = [
  body("nombreProducto").trim().notEmpty().withMessage("El nombre del producto es obligatorio")
    .isLength({ min: 3, max: 50 }).withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  body("marca").trim().notEmpty().withMessage("La marca es obligatoria")
    .isLength({ min: 2, max: 30 }).withMessage("La marca debe tener entre 2 y 30 caracteres"),
  body("categoria").notEmpty().withMessage("El ID de categoría es obligatorio"),
  body("precio").isFloat({ min: 0.01 }).withMessage("El precio debe ser mayor a 0"),
  body("descripcion").trim().notEmpty().withMessage("La descripción es obligatoria")
    .isLength({ min: 10, max: 500 }).withMessage("La descripción debe tener entre 10 y 500 caracteres"),
  body("imagenes").optional().isArray().withMessage("Las imágenes deben ser un array"),
  body("imagenes.*.url").optional().isURL().withMessage("Cada imagen debe tener una URL válida"),
  body("imagenes.*.publicId").optional().notEmpty().withMessage("Cada imagen debe tener un publicId"),
];

const actualizarProductoValidator = [
  body("nombreProducto").optional().trim()
    .isLength({ min: 3, max: 50 }).withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  body("marca").optional().trim()
    .isLength({ min: 2, max: 30 }).withMessage("La marca debe tener entre 2 y 30 caracteres"),
  body("precio").optional().isFloat({ min: 0.01 }).withMessage("El precio debe ser mayor a 0"),
  body("descripcion").optional().trim()
    .isLength({ min: 10, max: 500 }).withMessage("La descripción debe tener entre 10 y 500 caracteres"),
  body("imagenes").optional().isArray().withMessage("Las imágenes deben ser un array"),
  body("imagenes.*.url").optional().isURL().withMessage("Cada imagen debe tener una URL válida"),
  body("imagenes.*.publicId").optional().notEmpty().withMessage("Cada imagen debe tener un publicId"),
];

module.exports = { crearProductoValidator, actualizarProductoValidator };
