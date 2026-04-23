const { body } = require("express-validator");

const crearProductoValidator = [
  body("nombreProducto").trim().notEmpty().withMessage("El nombre del producto es obligatorio")
    .isLength({ min: 3, max: 50 }).withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  body("marca").trim().notEmpty().withMessage("La marca es obligatoria")
    .isLength({ min: 2, max: 30 }).withMessage("La marca debe tener entre 2 y 30 caracteres"),
  body("categoria").notEmpty().withMessage("El ID de categoría es obligatorio")
    .isMongoId().withMessage("El ID de categoría no es válido"),
  body("precio").isFloat({ min: 0.01 }).withMessage("El precio debe ser mayor a 0"),
  body("descripcion").trim().notEmpty().withMessage("La descripción es obligatoria")
    .isLength({ min: 10, max: 500 }).withMessage("La descripción debe tener entre 10 y 500 caracteres"),
  body("imagenes").optional().isArray().withMessage("Las imágenes deben ser un array"),
  body("imagenes.*.url").optional().isURL().withMessage("Cada imagen debe tener una URL válida"),
  body("imagenes.*.publicId").optional().notEmpty().withMessage("Cada imagen debe tener un publicId"),
  body("destacado").optional().isBoolean().withMessage("destacado debe ser un booleano"),
  body("whatsappActivo").optional().isBoolean().withMessage("whatsappActivo debe ser un booleano"),
  body("whatsappMensaje").optional().isLength({ max: 300 }).withMessage("El mensaje de WhatsApp no puede superar los 300 caracteres"),
];

const actualizarProductoValidator = [
  body("nombreProducto").optional().trim()
    .isLength({ min: 3, max: 50 }).withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  body("marca").optional().trim()
    .isLength({ min: 2, max: 30 }).withMessage("La marca debe tener entre 2 y 30 caracteres"),
  body("categoria").optional()
    .isMongoId().withMessage("El ID de categoría no es válido"),
  body("precio").optional().isFloat({ min: 0.01 }).withMessage("El precio debe ser mayor a 0"),
  body("descripcion").optional().trim()
    .isLength({ min: 10, max: 500 }).withMessage("La descripción debe tener entre 10 y 500 caracteres"),
  body("imagenes").optional().isArray().withMessage("Las imágenes deben ser un array"),
  body("imagenes.*.url").optional().isURL().withMessage("Cada imagen debe tener una URL válida"),
  body("imagenes.*.publicId").optional().notEmpty().withMessage("Cada imagen debe tener un publicId"),
  body("destacado").optional().isBoolean().withMessage("destacado debe ser un booleano"),
  body("whatsappActivo").optional().isBoolean().withMessage("whatsappActivo debe ser un booleano"),
  body("whatsappMensaje").optional().isLength({ max: 300 }).withMessage("El mensaje de WhatsApp no puede superar los 300 caracteres"),
  body("estado").optional().isBoolean().withMessage("estado debe ser un booleano"),
];

module.exports = { crearProductoValidator, actualizarProductoValidator };
