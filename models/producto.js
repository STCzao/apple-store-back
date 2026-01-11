const { Schema, model } = require("mongoose");

const ProductoSchema = Schema({
  img: { type: String },
  nombreProducto: {
    type: String,
    required: [true, "El nombre del producto es obligatorio"],
    minlength: [3, "El nombre del producto debe tener al menos 3 caracteres"],
    maxlength: [
      50,
      "El nombre del producto no puede tener más de 50 caracteres",
    ],
  },
  precio: {
    type: Number,
    required: [true, "El precio del producto es obligatorio"],
    min: [0, "El precio no puede ser negativo"],
  },
  descripcion: {
    type: String,
    required: [true, "La descripción del producto es obligatoria"],
    minlength: [10, "La descripción debe tener al menos 10 caracteres"],
    maxlength: [500, "La descripción no puede tener más de 500 caracteres"],
  },
});

module.exports = model("Producto", ProductoSchema);
