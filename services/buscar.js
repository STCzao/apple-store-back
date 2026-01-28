/**
 * SERVICE DE BÚSQUEDA
 *
 * Lógica de negocio para búsqueda de productos y categorías
 * - Búsqueda por nombre, marca y categoría
 * - Búsqueda case-insensitive con regex
 * - Filtrado por estado activo
 *
 * @module BuscarService
 */

const { Producto, Categoria } = require("../models/index");

/**
 * Buscar categorías por término
 *
 * @param {String} termino - Término de búsqueda
 * @returns {Promise<Array>} categorías encontradas
 */
const buscarCategorias = async (termino) => {
  // Validar término
  if (!termino || termino.trim().length === 0) {
    throw new Error("El término de búsqueda no puede estar vacío");
  }

  // Crear regex case-insensitive
  const regex = new RegExp(termino, "i");

  // Buscar categorías activas que coincidan
  const categorias = await Categoria.find({
    $or: [{ nombreCategoria: regex }],
    $and: [{ estado: true }],
  });

  return categorias;
};

/**
 * Buscar productos por término
 *
 * @param {String} termino - Término de búsqueda
 * @returns {Promise<Array>} productos encontrados
 */
const buscarProductos = async (termino) => {
  // Validar término
  if (!termino || termino.trim().length === 0) {
    throw new Error("El término de búsqueda no puede estar vacío");
  }

  // Crear regex case-insensitive
  const regex = new RegExp(termino, "i");

  // Buscar categorías que coincidan (para búsqueda indirecta)
  const categorias = await Categoria.find({
    nombreCategoria: regex,
    estado: true,
  });

  const categoriaIds = categorias.map((cat) => cat._id);

  // Buscar productos por nombre, marca o categoría
  const productos = await Producto.find({
    $or: [
      { nombreProducto: regex },
      { marca: regex },
      { categoria: { $in: categoriaIds } },
    ],
    $and: [{ estado: true }],
  }).populate("categoria", "nombreCategoria");

  return productos;
};

module.exports = {
  buscarCategorias,
  buscarProductos,
};
