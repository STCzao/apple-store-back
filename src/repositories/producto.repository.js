const Producto = require("../models/Producto");

const findById = (id) =>
  Producto.findById(id)
    .populate("categoria", "nombreCategoria")
    .populate("creadoPor", "nombreUsuario");

const findAll = (filter, skip, limit) =>
  Producto.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("categoria", "nombreCategoria")
    .populate("creadoPor", "nombreUsuario");

const count = (filter) => Producto.countDocuments(filter);
const create = (data) => Producto.create(data);
const update = (id, data) =>
  Producto.findByIdAndUpdate(id, data, { new: true })
    .populate("categoria", "nombreCategoria")
    .populate("creadoPor", "nombreUsuario");
const findOne = (filter) => Producto.findOne(filter);

module.exports = { findById, findAll, count, create, update, findOne };
