const bcryptjs = require("bcryptjs");
const AppError = require("../helpers/AppError");
const sanitizarTexto = require("../helpers/sanitizarTexto");
const usuarioRepo = require("../repositories/usuario.repository");

const obtenerUsuarios = async (limite = 10, desde = 0) => {
  const [total, usuarios] = await Promise.all([
    usuarioRepo.count({ estado: true }),
    usuarioRepo.findAll({ estado: true }, desde, limite),
  ]);
  return { total, usuarios };
};

const obtenerUsuarioPorId = async (id) => {
  const usuario = await usuarioRepo.findById(id);
  if (!usuario || !usuario.estado) throw new AppError("Usuario no encontrado", 404);
  return usuario;
};

const actualizarPerfil = async (usuarioId, { nombreUsuario, img }) => {
  const data = {};
  if (nombreUsuario) data.nombreUsuario = sanitizarTexto(nombreUsuario);
  if (img !== undefined) data.img = img;
  return usuarioRepo.update(usuarioId, data);
};

const actualizarUsuario = async (id, datosActualizar) => {
  const { contraseña, correo, ...resto } = datosActualizar;

  if (contraseña) {
    resto.contraseña = await bcryptjs.hash(contraseña, 10);
  }

  const usuario = await usuarioRepo.update(id, resto);
  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  return usuario;
};

const eliminarUsuario = async (id) => {
  const usuario = await usuarioRepo.update(id, { estado: false });
  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  return usuario;
};

const cambiarContrasena = async (usuarioId, contraseñaActual, contraseñaNueva) => {
  const usuario = await usuarioRepo.findByIdConContraseña(usuarioId);

  const valida = await bcryptjs.compare(contraseñaActual, usuario.contraseña);
  if (!valida) throw new AppError("La contraseña actual es incorrecta", 401);

  const misma = await bcryptjs.compare(contraseñaNueva, usuario.contraseña);
  if (misma) throw new AppError("La nueva contraseña debe ser diferente a la actual", 400);

  const hash = await bcryptjs.hash(contraseñaNueva, 10);
  await usuarioRepo.update(usuarioId, { contraseña: hash });
};

module.exports = { obtenerUsuarios, obtenerUsuarioPorId, actualizarPerfil, actualizarUsuario, eliminarUsuario, cambiarContrasena };
