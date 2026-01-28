const { Schema, model } = require("mongoose");

const ProductoSchema = Schema({
  img: { type: String },

  categoria: {
    type: Schema.Types.ObjectId,
    ref: "Categoria",
    required: true,
  },
  creadoPor: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },

  nombreProducto: {
    type: String,
    required: [true, "El nombre del producto es obligatorio"],
    lowercase: true,
    trim: true,
    minlength: [3, "El nombre del producto debe tener al menos 3 caracteres"],
    maxlength: [
      50,
      "El nombre del producto no puede tener más de 50 caracteres",
    ],
  },
  marca: {
    type: String,
    required: [true, "La marca del producto es obligatoria"],
    lowercase: true,
    trim: true,
    minlength: [2, "La marca debe tener al menos 2 caracteres"],
    maxlength: [30, "La marca no puede tener más de 30 caracteres"],
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

  destacado: {
    type: Boolean,
    default: false,
  },

  inventario: {
    type: Number,
    required: true,
    min: 0,
  },
  whatsappActivo: {
    type: Boolean,
    default: true,
  },

  whatsappMensaje: {
    type: String,
    maxlength: 300,
  },

  estado: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = model("Producto", ProductoSchema);
