const Usuario = require("../models/Usuario");

const findById = (id) => Usuario.findById(id);
const findByIdConContraseña = (id) => Usuario.findById(id).select("+contraseña");
const findByCorreo = (correo) => Usuario.findOne({ correo });
const findByCorreoConContraseña = (correo) => Usuario.findOne({ correo }).select("+contraseña");
const findAll = (filter, skip, limit) => Usuario.find(filter).skip(skip).limit(limit);
const count = (filter) => Usuario.countDocuments(filter);
const create = (data) => Usuario.create(data);
const update = (id, data) => Usuario.findByIdAndUpdate(id, data, { new: true });
const findOne = (filter) => Usuario.findOne(filter);
const findOneConTokens = (filter) => Usuario.findOne(filter).select("+tokenVerificacion +tokenVerificacionExp +resetToken +resetTokenExp");

const findActivos = () =>
  Usuario.find({ estado: true, emailVerificado: true }).select("correo nombreUsuario");

module.exports = {
  findById,
  findByIdConContraseña,
  findByCorreo,
  findByCorreoConContraseña,
  findAll,
  count,
  create,
  update,
  findOne,
  findOneConTokens,
  findActivos,
};
