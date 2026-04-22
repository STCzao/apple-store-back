const { Schema, model } = require("mongoose");

const UsuarioSchema = new Schema({
  nombreUsuario: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    maxlength: [40, "El nombre no puede tener más de 40 caracteres"],
    match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"],
  },
  correo: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Debe ser un correo válido"],
  },
  contraseña: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    select: false,
  },
  img: { type: String, default: null },
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
  const { __v, _id, contraseña, tokenVerificacion, tokenVerificacionExp, resetToken, resetTokenExp, ...usuario } = this.toObject();
  usuario.uid = _id;
  return usuario;
};

module.exports = model("Usuario", UsuarioSchema);
