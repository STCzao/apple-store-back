/**
 * SERVICE DE CATEGORÍAS
 * 
 * Contiene toda la lógica de negocio para categorías
 * - Validaciones complejas
 * - Operaciones de base de datos
 * - Transformaciones de datos
 * 
 * @module CategoriaService
 */

const Categoria = require("../models/categoria");
const { validarObjectId } = require("../helpers/validarObjectId");

/**
 * Obtener categorías paginadas
 * 
 * @param {Number} limite - Cantidad por página (default: 10, max: 100)
 * @param {Number} desde - Posición inicial (default: 0)
 * @returns {Promise<Object>} { total, categorias }
 */
const obtenerCategorias = async (limite = 10, desde = 0) => {
  // Validaciones
  if (isNaN(limite) || isNaN(desde)) {
    throw new Error("Los parámetros 'limite' y 'desde' deben ser números válidos");
  }

  if (limite < 0 || desde < 0) {
    throw new Error("Los parámetros 'limite' y 'desde' no pueden ser negativos");
  }

  if (limite > 100) {
    throw new Error("El parámetro 'limite' no puede ser mayor a 100");
  }

  // Queries en paralelo
  const [total, categorias] = await Promise.all([
    Categoria.countDocuments({ estado: true }),
    Categoria.find({ estado: true })
      .skip(desde)
      .limit(limite),
  ]);

  return { total, categorias };
};

/**
 * Obtener categoría por ID
 * 
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Object>} categoria
 * @throws {Error} Si el ID no es válido o no existe
 */
const obtenerCategoriaPorId = async (id) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El id de la categoría no es válido");
  }

  const categoria = await Categoria.findById(id);

  // Validar existencia y estado activo
  if (!categoria || !categoria.estado) {
    throw new Error("La categoría no existe");
  }

  return categoria;
};

/**
 * Crear nueva categoría
 * 
 * @param {Object} data - Datos de la categoría
 * @param {String} data.nombreCategoria - Nombre (obligatorio)
 * @param {String} data.descripcion - Descripción (opcional)
 * @param {String} data.img - URL imagen (opcional)
 * @param {String} usuarioId - ID del usuario creador
 * @returns {Promise<Object>} categoria creada
 * @throws {Error} Si ya existe o datos inválidos
 */
const crearCategoria = async ({ nombreCategoria, descripcion, img }, usuarioId) => {
  // Normalizar nombre
  const nombreNormalizado = nombreCategoria.toLowerCase().trim();

  // Validar que no exista duplicado
  const categoriaExistente = await Categoria.findOne({
    nombreCategoria: nombreNormalizado,
  });

  if (categoriaExistente) {
    throw new Error(`La categoría ${nombreCategoria} ya existe`);
  }

  // Crear objeto data
  const data = {
    nombreCategoria: nombreNormalizado,
    usuario: usuarioId,
  };

  // Agregar campos opcionales solo si vienen
  if (descripcion) data.descripcion = descripcion;
  if (img) data.img = img;

  // Crear y guardar
  const categoria = new Categoria(data);
  await categoria.save();

  return categoria;
};

/**
 * Actualizar categoría existente
 * 
 * @param {String} id - MongoDB ObjectId
 * @param {Object} datosActualizar - Campos a actualizar
 * @returns {Promise<Object>} categoria actualizada
 * @throws {Error} Si no existe o datos inválidos
 */
const actualizarCategoria = async (id, datosActualizar) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El id de la categoría no es válido");
  }

  // Validar que existe
  const categoriaExistente = await Categoria.findById(id);
  if (!categoriaExistente) {
    throw new Error("La categoría no existe");
  }

  const { nombreCategoria, descripcion, img, estado } = datosActualizar;

  // Construir data dinámicamente
  const data = {};

  // Si viene nombre, normalizar y validar duplicados
  if (nombreCategoria) {
    const nombreNormalizado = nombreCategoria.toLowerCase().trim();
    
    // Validar que no exista otro con ese nombre (excluir el actual)
    const categoriaDuplicada = await Categoria.findOne({
      nombreCategoria: nombreNormalizado,
      _id: { $ne: id },
    });

    if (categoriaDuplicada) {
      throw new Error(`La categoría ${nombreCategoria} ya existe`);
    }

    data.nombreCategoria = nombreNormalizado;
  }

  // Agregar campos opcionales solo si vienen
  if (descripcion !== undefined) data.descripcion = descripcion;
  if (img !== undefined) data.img = img;
  if (estado !== undefined) data.estado = estado;

  // Actualizar y retornar
  const categoria = await Categoria.findByIdAndUpdate(id, data, { new: true });

  return categoria;
};

/**
 * Eliminar categoría (soft delete)
 * 
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Object>} categoria eliminada
 * @throws {Error} Si no existe o ya está eliminada
 */
const eliminarCategoria = async (id) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El id de la categoría no es válido");
  }

  // Validar que existe
  const categoriaExistente = await Categoria.findById(id);
  if (!categoriaExistente) {
    throw new Error("La categoría no existe");
  }

  // Validar que no está ya eliminada
  if (!categoriaExistente.estado) {
    throw new Error("La categoría ya fue eliminada");
  }

  // Soft delete
  const categoria = await Categoria.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  return categoria;
};

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
