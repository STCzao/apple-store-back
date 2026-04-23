const { Schema, model } = require("mongoose");

const UsuarioSchema = new Schema({
  nombreUsuario: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    maxlength: [40, "El nombre no puede tener más de 40 caracteres"],
  },
  correo: {
    type: String,
    required: [true, "El email es requerido"],
    unique: true,
    lowercase: true,
    minlength: [5, "El email debe tener al menos 5 caracteres"],
    maxlength: [100, "El email no puede superar los 100 caracteres"],
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "El email no tiene un formato válido",
    ],
  },
  fechaNacimiento: {
    type: String,
    required: [true, "La fecha de nacimiento es requerida"],
  },
  contraseña: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    select: false,
  },
  img: {
    type: String,
    default: null,
    maxlength: [300, "La URL de la foto no puede superar los 300 caracteres"],
    match: [/^https:\/\/.+/, "La URL de la foto no es válida"],
  },
  rol: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: { values: ["ADMIN_ROLE", "USER_ROLE"], message: "Rol no válido" },
  },
  estado: { type: Boolean, default: true },
  emailVerificado: { type: Boolean, default: false },
  tokenVerificacion: { type: String, default: null, select: false },
  tokenVerificacionExp: { type: Date, default: null, select: false },
  resetToken: { type: String, default: null, select: false },
  resetTokenExp: { type: Date, default: null, select: false },
});

UsuarioSchema.methods.toJSON = function () {
  const {
    __v,
    _id,
    contraseña,
    tokenVerificacion,
    tokenVerificacionExp,
    resetToken,
    resetTokenExp,
    ...usuario
  } = this.toObject();
  usuario.uid = _id;
  return usuario;
};

module.exports = model("Usuario", UsuarioSchema);
