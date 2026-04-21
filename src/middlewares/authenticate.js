const jwt = require("jsonwebtoken");
const AppError = require("../helpers/AppError");
const Usuario = require("../models/Usuario");

const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Token no proporcionado", 401));
    }

    const token = authHeader.split(" ")[1];
    const { uid } = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const usuario = await Usuario.findById(uid);
    if (!usuario) return next(new AppError("Token inválido — usuario no existe", 401));
    if (!usuario.estado) return next(new AppError("Token inválido — usuario inhabilitado", 401));

    req.usuario = usuario;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return next(new AppError("Token expirado", 401));
    if (err.name === "JsonWebTokenError") return next(new AppError("Token inválido", 401));
    next(err);
  }
};

module.exports = authenticate;
