const { Schema, model, models } = require("mongoose");

const UsuarioSchema = Schema({
  nombreUsuario: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    maxlength: [40, "El nombre no puede tener más de 40 caracteres"], // Cambiado de 15 a 40
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El nombre solo puede contener letras y espacios",
    ],
  },
  correo: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Debe ser un correo válido"],
    maxlength: [35, "El correo no puede tener más de 35 caracteres"],
  },
  contraseña: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  telefono: {
    type: String,
    required: [true, "El teléfono es obligatorio"],
    match: [
      /^[0-9]{7,15}$/,
      "El teléfono debe contener entre 7 y 15 dígitos numéricos",
    ],
  },
  DNI: {
    type: String,
    required: [true, "El DNI es obligatorio"],
    unique: true,
    match: [/^[0-9]{8}$/, "El DNI debe tener 8 números seguidos"],
  },

  //Datos fiscales opcionales
  tipoFacturacion: {
    type: String,
    enum: ["CONSUMIDOR_FINAL", "RESPONSABLE_INSCRIPTO"],
    default: "CONSUMIDOR_FINAL",
  },

  CUIL: {
    type: String,
    required: [true, "El CUIL es obligatorio"],
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{2}-\d{8}-\d{1}$/.test(v);
      },
      message: "CUIL inválido. Formato: 20-12345678-9"
    },
  },

  razonSocial: String, //Opcional, solo para factura A

  domicilioFiscal: {
    calle: {
      type: String,
      required: [true, "La calle es obligatoria"]
    },
    numero: {
      type: String,
      required: [true, "El número es obligatorio"]
    },
    ciudad: {
      type: String,
      required: [true, "La ciudad es obligatoria"]
    },
    provincia: {
      type: String,
      required: [true, "La provincia es obligatoria"]
    },
    codigoPostal: {
      type: String,
      required: [true, "El código postal es obligatorio"]
    }
  },

  img: { type: String },
  rol: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: ["ADMIN_ROLE", "USER_ROLE"],
  },
  estado: { type: Boolean, default: true },
  resetToken: { type: String },
  resetTokenExp: { type: Date },
});

// Sobreescribir JSON para no devolver campos sensibles
UsuarioSchema.methods.toJSON = function () {
  const { __v, contraseña, resetToken, resetTokenExp, _id, ...usuario } =
    this.toObject();
  usuario.uid = _id;
  return usuario;
};

module.exports = models.Usuario || model("Usuario", UsuarioSchema);
