/**
 * MODELO DE CATEGORÍA
 *
 * Representa las categorías de productos en la tienda
 *
 * @module CategoriaModel
 */

const { Schema, model } = require("mongoose");

const CategoriaSchema = Schema(
  {
    nombreCategoria: {
      type: String,
      required: [true, "El nombre de la categoría es obligatorio"],
      unique: true,
      lowercase: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
      trim: true,
    },
    descripcion: {
      type: String,
      maxlength: [200, "La descripción no puede tener más de 200 caracteres"],
      trim: true,
    },
    img: {
      type: String,
      default: null,
    },
    estado: {
      type: Boolean,
      required: true,
      default: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Middleware para popular usuario automáticamente en queries
 */
CategoriaSchema.pre(/^find/, function (next) {
  this.populate("usuario", "nombreUsuario correo");
  next();
});

/**
 * Método para formato JSON personalizado
 */
CategoriaSchema.methods.toJSON = function () {
  const { __v, _id, ...categoria } = this.toObject();
  categoria.uid = _id;
  return categoria;
};

module.exports = model("Categoria", CategoriaSchema);
