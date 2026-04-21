const Favorito = require("../models/Favorito");

const findByUsuario = (usuarioId) =>
  Favorito.find({ usuario: usuarioId }).populate({
    path: "producto",
    populate: { path: "categoria", select: "nombreCategoria" },
  });

const findOne = (usuarioId, productoId) =>
  Favorito.findOne({ usuario: usuarioId, producto: productoId });

const create = (usuarioId, productoId) =>
  Favorito.create({ usuario: usuarioId, producto: productoId });

const remove = (usuarioId, productoId) =>
  Favorito.findOneAndDelete({ usuario: usuarioId, producto: productoId });

const count = (usuarioId) => Favorito.countDocuments({ usuario: usuarioId });

module.exports = { findByUsuario, findOne, create, remove, count };
