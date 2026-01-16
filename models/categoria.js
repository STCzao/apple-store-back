const { Schema, model } = require("mongoose");

const CategoriaSchema = Schema({
  nombreCategoria: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    unique: true,
    lowercase: true,
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    maxlength: [30, "El nombre no puede tener más de 30 caracteres"],
    trim: true,
  },
  estado: { type: Boolean, required: true, default: true },
  usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
});

module.exports = model("Categoria", CategoriaSchema);
