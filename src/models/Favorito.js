const { Schema, model } = require("mongoose");

const FavoritoSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  producto: {
    type: Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
}, { timestamps: true });

FavoritoSchema.index({ usuario: 1, producto: 1 }, { unique: true });

module.exports = model("Favorito", FavoritoSchema);
