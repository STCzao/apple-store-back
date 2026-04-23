const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const AppError = require("../helpers/AppError");
const sanitizarTexto = require("../helpers/sanitizarTexto");
const usuarioRepo = require("../repositories/usuario.repository");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../helpers/jwt");

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registrar = async ({ nombreUsuario, correo, contraseña, fechaNacimiento }) => {
  const existe = await usuarioRepo.findByCorreo(correo);
  if (existe) throw new AppError("El correo ya está registrado", 409);

  const hash = await bcryptjs.hash(contraseña, 10);
  const tokenVerificacion = crypto.randomBytes(32).toString("hex");

  const usuario = await usuarioRepo.create({
    nombreUsuario: sanitizarTexto(nombreUsuario),
    correo,
    contraseña: hash,
    fechaNacimiento,
    tokenVerificacion,
    tokenVerificacionExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return { usuario, tokenVerificacion };
};

const login = async (correo, contraseña) => {
  const usuario = await usuarioRepo.findByCorreoConContraseña(correo);
  if (!usuario) throw new AppError("Credenciales inválidas", 401);
  if (!usuario.estado) throw new AppError("Usuario inhabilitado. Contacte al administrador.", 403);
  if (!usuario.emailVerificado) throw new AppError("Debes verificar tu correo antes de iniciar sesión", 403);

  const valida = await bcryptjs.compare(contraseña, usuario.contraseña);
  if (!valida) throw new AppError("Credenciales inválidas", 401);

  const accessToken = generateAccessToken(usuario.id);
  const refreshToken = generateRefreshToken(usuario.id);

  return { usuario, accessToken, refreshToken };
};

const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw new AppError("Sesión expirada, iniciá sesión nuevamente", 401);
    throw new AppError("Refresh token inválido", 401);
  }

  const usuario = await usuarioRepo.findById(payload.uid);
  if (!usuario || !usuario.estado) throw new AppError("Usuario no encontrado o inhabilitado", 401);

  const nuevoAccessToken = generateAccessToken(usuario.id);
  const nuevoRefreshToken = generateRefreshToken(usuario.id);

  return { usuario, accessToken: nuevoAccessToken, refreshToken: nuevoRefreshToken };
};

const confirmarEmail = async (token) => {
  const usuario = await usuarioRepo.findOneConTokens({ tokenVerificacion: token });
  if (!usuario) throw new AppError("Token de verificación inválido", 400);
  if (usuario.tokenVerificacionExp < new Date()) throw new AppError("El token de verificación expiró", 400);

  await usuarioRepo.update(usuario._id, {
    emailVerificado: true,
    tokenVerificacion: null,
    tokenVerificacionExp: null,
  });
};

const reenviarVerificacion = async (correo) => {
  const usuario = await usuarioRepo.findByCorreo(correo);
  if (!usuario || usuario.emailVerificado) return; // No revelar si el correo existe ni si ya está verificado

  const tokenVerificacion = crypto.randomBytes(32).toString("hex");

  await usuarioRepo.update(usuario._id, {
    tokenVerificacion,
    tokenVerificacionExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return { usuario, tokenVerificacion };
};

const solicitarResetPassword = async (correo) => {
  const usuario = await usuarioRepo.findByCorreo(correo);
  if (!usuario) return; // No revelar si el correo existe

  const resetToken = crypto.randomBytes(32).toString("hex");

  await usuarioRepo.update(usuario._id, {
    resetToken,
    resetTokenExp: new Date(Date.now() + 15 * 60 * 1000),
  });

  return { usuario, resetToken };
};

const resetPassword = async (token, contraseñaNueva) => {
  const usuario = await usuarioRepo.findOneConTokens({ resetToken: token });
  if (!usuario) throw new AppError("Token de reset inválido", 400);
  if (usuario.resetTokenExp < new Date()) throw new AppError("El token de reset expiró", 400);

  const hash = await bcryptjs.hash(contraseñaNueva, 10);

  await usuarioRepo.update(usuario._id, {
    contraseña: hash,
    resetToken: null,
    resetTokenExp: null,
  });
};

module.exports = { registrar, login, refresh, confirmarEmail, reenviarVerificacion, solicitarResetPassword, resetPassword, REFRESH_COOKIE_OPTIONS };
