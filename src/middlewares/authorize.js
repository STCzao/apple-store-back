const AppError = require("../helpers/AppError");

const esAdmin = (req, _res, next) => {
  if (!req.usuario) return next(new AppError("Autenticación requerida", 401));
  if (req.usuario.rol !== "ADMIN_ROLE") return next(new AppError("Acceso denegado — se requiere rol administrador", 403));
  next();
};

const tieneRol = (...roles) => (req, _res, next) => {
  if (!req.usuario) return next(new AppError("Autenticación requerida", 401));
  if (!roles.includes(req.usuario.rol)) return next(new AppError(`Acceso denegado — roles permitidos: ${roles.join(", ")}`, 403));
  next();
};

module.exports = { esAdmin, tieneRol };
