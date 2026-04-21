const Categoria = require("../models/Categoria");

const findById = (id) => Categoria.findById(id);
const findAll = (filter, skip, limit) => Categoria.find(filter).skip(skip).limit(limit);
const count = (filter) => Categoria.countDocuments(filter);
const create = (data) => Categoria.create(data);
const update = (id, data) => Categoria.findByIdAndUpdate(id, data, { new: true });
const findOne = (filter) => Categoria.findOne(filter);

module.exports = { findById, findAll, count, create, update, findOne };
