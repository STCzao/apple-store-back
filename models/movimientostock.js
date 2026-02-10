const { Schema, model, models } = require("mongoose");

const MovimientoStockSchema = Schema({
  productoId: {
    type: Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },

  tipo: {
    type: String,
    enum: ["ENTRADA", "SALIDA", "AJUSTE"],
    required: true,
  },

  cantidad: {
    type: Number,
    required: true,
  },

  motivo: {
    type: String,
    enum: ["COMPRA", "VENTA", "CANCELACION", "AJUSTE_MANUAL", "ERROR"],
    required: true,
  },

  ordenId: {
    type: Schema.Types.ObjectId,
    ref: "Orden",
  },

  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },

  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = models.MovimientoStock || model("MovimientoStock", MovimientoStockSchema);
