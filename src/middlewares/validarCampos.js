const { validationResult } = require("express-validator");
const AppError = require("../helpers/AppError");

const validarCampos = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
  next();
};

module.exports = validarCampos;
