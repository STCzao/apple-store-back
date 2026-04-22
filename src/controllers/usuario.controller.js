const AppError = require("../helpers/AppError");
const usuarioService = require("../services/usuario.service");

const usuariosGet = async (req, res, next) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    const { total, usuarios } = await usuarioService.obtenerUsuarios(Number(limite), Number(desde));
    res.json({ total, usuarios });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const perfilGet = (req, res) => {
  res.json({ usuario: req.usuario });
};

const perfilPatch = async (req, res, next) => {
  try {
    const usuario = await usuarioService.actualizarPerfil(req.usuario._id, req.body);
    res.json({ usuario });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const usuarioGet = async (req, res, next) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(req.params.id);
    res.json({ usuario });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const usuarioPatch = async (req, res, next) => {
  try {
    const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);
    res.json({ usuario });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const usuarioDelete = async (req, res, next) => {
  try {
    const usuario = await usuarioService.eliminarUsuario(req.params.id);
    res.json({ usuario });
  } catch (err) {
    if (err.name === "CastError") return next(new AppError("ID inválido", 400));
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const cambiarContrasena = async (req, res, next) => {
  try {
    const { contraseñaActual, contraseñaNueva } = req.body;
    await usuarioService.cambiarContrasena(req.usuario._id, contraseñaActual, contraseñaNueva);
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

module.exports = { usuariosGet, perfilGet, perfilPatch, usuarioGet, usuarioPatch, usuarioDelete, cambiarContrasena };
