const { Schema, model } = require("mongoose");

const OrdenSchema = new Schema(
  {
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

    // DATOS DE FACTURACIÓN (snapshot al momento de compra):
    datosFacturacion: {
      type: {
        tipoFacturacion: {
          type: String,
          enum: ["CONSUMIDOR_FINAL", "RESPONSABLE_INSCRIPTO"],
          required: true,
        },
        nombreCompleto: {
          type: String,
          required: true,
        },
        DNI: { type: String, required: true },
        CUIL: { type: String },
        razonSocial: { type: String },
        domicilioFiscal: {
          calle: { type: String, required: true },
          numero: { type: String, required: true },
          ciudad: { type: String, required: true },
          provincia: { type: String, required: true },
          codigoPostal: { type: String, required: true },
        },
      },
      required: true,
    },

    // CÁLCULO FISCAL (solo para generar la factura):
    desgloseFiscal: {
      type: {
        tipoFactura: {
          type: String,
          enum: ["A", "B", "C"],
          required: true,
        },
        baseImponible: Number, // Solo para factura A
        IVA21: Number, // Solo para factura A
        total: { type: Number, required: true },
      },
      required: true,
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
  },
  { timestamps: true },
);

module.exports = model("Orden", OrdenSchema);
