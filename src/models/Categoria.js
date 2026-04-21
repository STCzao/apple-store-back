const { Schema, model } = require("mongoose");

const CategoriaSchema = new Schema({
  nombreCategoria: {
    type: String,
    required: [true, "El nombre de la categoría es obligatorio"],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
  },
  descripcion: {
    type: String,
    maxlength: [200, "La descripción no puede tener más de 200 caracteres"],
    trim: true,
  },
  img: { type: String, default: null },
  estado: { type: Boolean, required: true, default: true },
  creadoPor: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
}, { timestamps: true });

CategoriaSchema.methods.toJSON = function () {
  const { __v, _id, ...categoria } = this.toObject();
  categoria.uid = _id;
  return categoria;
};

module.exports = model("Categoria", CategoriaSchema);
