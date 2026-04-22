const bcryptjs = require("bcryptjs");
const Usuario = require("../../src/models/Usuario");
const { generateAccessToken } = require("../../src/helpers/jwt");

const crearUsuarioVerificado = async (datos = {}) => {
  const correo = datos.correo || `test${Date.now()}@test.com`;
  const contraseña = datos.contraseña || "Password123!";
  const hash = await bcryptjs.hash(contraseña, 10);

  const usuario = await Usuario.create({
    nombreUsuario: datos.nombreUsuario || "Usuario Test",
    correo,
    contraseña: hash,
    emailVerificado: true,
    estado: datos.estado !== undefined ? datos.estado : true,
    rol: datos.rol || "USER_ROLE",
  });

  const token = generateAccessToken(usuario._id.toString());
  return { usuario, correo, contraseña, token };
};

module.exports = { crearUsuarioVerificado };
