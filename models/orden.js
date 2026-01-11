const { Schema, model } = require("mongoose");

const OrdenSchema = new Schema({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },

  carritoId: {
    type: Schema.Types.ObjectId,
    ref: "Carrito",
    required: true,
  },

  estado: {
    type: String,
    enum: ["PENDIENTE_PAGO", "PAGADA", "FALLIDA", "CANCELADA"],
    default: "PENDIENTE_PAGO",
  },

  items: [
    {
      productoId: {
        type: Schema.Types.ObjectId,
        ref: "Producto",
        required: true,
      },
      nombreSnapshot: {
        type: String,
        required: true,
      },
      precioSnapshot: {
        type: Number,
        required: true,
        min: 0,
      },
      cantidad: {
        type: Number,
        required: true,
        min: 1,
      },
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],

  moneda: {
    type: String,
    enum: ["ars", "usd"],
    required: true,
  },

  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },

  total: {
    type: Number,
    required: true,
    min: 0,
  },

  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true,
  },

  stripeCheckoutSessionId: {
    type: String,
  },

  fechaPago: {
    type: Date,
  },
}, { timestamps: true });

module.exports = model("Orden", OrdenSchema);
