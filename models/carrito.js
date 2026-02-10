const { Schema, model, models } = require("mongoose");

const CarritoSchema = new Schema(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: false,
    },

    estado: {
      type: String,
      enum: ["ACTIVO", "CHEQUEANDO", "EXPIRADO", "COMPLETADO"],
      default: "ACTIVO",
    },

    items: [
      {
        productoId: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: true,
        },
        nombreSnapshot: { type: String, required: true },
        precioSnapshot: { type: Number, required: true },
        cantidad: {
          type: Number,
          min: 1,
          default: 1,
        },
        subtotal: { type: Number, required: true },
      },
    ],

    moneda: {
      type: String,
      enum: ["ars", "usd"],
      default: "ars",
    },

    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = models.Carrito || model("Carrito", CarritoSchema);
