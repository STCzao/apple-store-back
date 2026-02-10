/**
 * SERVICE DE PRODUCTOS
 * 
 * Contiene toda la lógica de negocio para productos
 * - Validaciones complejas
 * - Operaciones de base de datos
 * - Transformaciones de datos
 * - Validaciones de integridad referencial
 * 
 * @module ProductoService
 */

const { Producto, Categoria } = require("../models/index");
const { validarObjectId } = require("../helpers/validarObjectId");

/**
 * Obtener productos paginados
 * 
 * @param {Number} limite - Cantidad por página (default: 12, max: 100)
 * @param {Number} desde - Posición inicial (default: 0)
 * @returns {Promise<Object>} { total, productos }
 */
const obtenerProductos = async (limite = 12, desde = 0) => {
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

  // Queries en paralelo con populate
  const [total, productos] = await Promise.all([
    Producto.countDocuments({ estado: true }),
    Producto.find({ estado: true })
      .skip(desde)
      .limit(limite)
      .populate("categoria", "nombreCategoria")
      .populate("creadoPor", "nombreUsuario"),
  ]);

  return { total, productos };
};

/**
 * Obtener producto por ID
 * 
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Object>} producto
 * @throws {Error} Si el ID no es válido o no existe
 */
const obtenerProductoPorId = async (id) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El id del producto no es válido");
  }

  const producto = await Producto.findById(id)
    .populate("categoria", "nombreCategoria")
    .populate("creadoPor", "nombreUsuario");

  // Validar existencia y estado activo
  if (!producto || !producto.estado) {
    throw new Error("El producto no existe");
  }

  return producto;
};

/**
 * Crear nuevo producto
 * 
 * @param {Object} data - Datos del producto
 * @param {String} data.nombreProducto - Nombre (obligatorio)
 * @param {String} data.marca - Marca (obligatorio)
 * @param {String} data.categoria - ID categoría (obligatorio)
 * @param {Number} data.precio - Precio (obligatorio)
 * @param {String} data.descripcion - Descripción (obligatorio)
 * @param {String} data.img - URL imagen (opcional)
 * @param {Number} data.inventario - Stock inicial (obligatorio)
 * @param {Boolean} data.estado - Estado (opcional)
 * @param {String} usuarioId - ID del usuario creador
 * @returns {Promise<Object>} producto creado
 * @throws {Error} Si faltan campos, categoría no existe o producto duplicado
 */
const crearProducto = async (
  { nombreProducto, marca, categoria, precio, descripcion, img, inventario, estado },
  usuarioId
) => {
  // Validar campos obligatorios
  if (!nombreProducto || !marca || !categoria || !precio || !descripcion) {
    throw new Error("Faltan campos obligatorios");
  }

  // Validar ObjectId de categoría
  if (!validarObjectId(categoria)) {
    throw new Error("El id de la categoría no es válido");
  }

  // Validar que la categoría existe (integridad referencial)
  const categoriaExiste = await Categoria.findById(categoria);
  if (!categoriaExiste) {
    throw new Error("La categoría no existe");
  }

  // Normalizar nombre y marca
  const nombreNormalizado = nombreProducto.toLowerCase().trim();
  const marcaNormalizada = marca.toLowerCase().trim();

  // Validar que no exista duplicado
  const productoDuplicado = await Producto.findOne({
    nombreProducto: nombreNormalizado,
  });
  if (productoDuplicado) {
    throw new Error("El producto ya existe");
  }

  // Validar precio
  const precioNum = Number(precio);
  if (isNaN(precioNum) || precioNum <= 0) {
    throw new Error("El precio debe ser un número válido y mayor que cero");
  }

  // Validar inventario
  const inventarioNum = Number(inventario);
  if (isNaN(inventarioNum) || inventarioNum < 0) {
    throw new Error("El inventario debe ser un número válido y no negativo");
  }

  // Crear objeto data
  const data = {
    nombreProducto: nombreNormalizado,
    marca: marcaNormalizada,
    categoria,
    precio: precioNum,
    descripcion,
    inventario: inventarioNum,
    creadoPor: usuarioId,
  };

  // Agregar campos opcionales
  if (img) data.img = img;
  if (estado !== undefined) data.estado = estado;

  // Crear y guardar
  const producto = new Producto(data);
  await producto.save();

  return producto;
};

/**
 * Actualizar producto existente
 * 
 * @param {String} id - MongoDB ObjectId
 * @param {Object} datosActualizar - Campos a actualizar
 * @returns {Promise<Object>} producto actualizado
 * @throws {Error} Si no existe, datos inválidos o creadoPor protegido
 */
const actualizarProducto = async (id, datosActualizar) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El id del producto no es válido");
  }

  // Validar que existe
  const productoExistente = await Producto.findById(id);
  if (!productoExistente) {
    throw new Error("El producto no existe");
  }

  // Proteger campo creadoPor (auditoría - no puede cambiar)
  if (
    datosActualizar.creadoPor &&
    datosActualizar.creadoPor.toString() !== productoExistente.creadoPor.toString()
  ) {
    throw new Error("No se puede cambiar el creador del producto");
  }

  const {
    nombreProducto,
    marca,
    categoria,
    precio,
    descripcion,
    img,
    estado,
    destacado,
    inventario,
  } = datosActualizar;

  // Construir data dinámicamente
  const data = {};

  // Si viene nombre, normalizar y validar duplicados
  if (nombreProducto) {
    const nombreNormalizado = nombreProducto.toLowerCase().trim();
    
    // Validar que no exista otro con ese nombre (excluir el actual)
    const productoDuplicado = await Producto.findOne({
      nombreProducto: nombreNormalizado,
      _id: { $ne: id },
    });
    if (productoDuplicado) {
      throw new Error(`El producto ${productoDuplicado.nombreProducto} ya existe`);
    }

    data.nombreProducto = nombreNormalizado;
  }

  // Si viene marca, normalizar
  if (marca) {
    data.marca = marca.toLowerCase().trim();
  }

  // Si viene categoría, validar que existe
  if (categoria) {
    if (!validarObjectId(categoria)) {
      throw new Error("El id de la categoría no es válido");
    }

    const categoriaExiste = await Categoria.findById(categoria);
    if (!categoriaExiste) {
      throw new Error("La categoría no existe");
    }

    data.categoria = categoria;
  }

  // Validar y agregar precio
  if (precio !== undefined) {
    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      throw new Error("El precio debe ser un número válido y mayor que cero");
    }
    data.precio = precioNum;
  }

  // Validar y agregar inventario
  if (inventario !== undefined) {
    const inventarioNum = Number(inventario);
    if (isNaN(inventarioNum) || inventarioNum < 0) {
      throw new Error("El inventario debe ser un número válido y no negativo");
    }
    data.inventario = inventarioNum;
  }

  // Agregar campos opcionales solo si vienen
  if (descripcion) data.descripcion = descripcion;
  if (img !== undefined) data.img = img;
  if (estado !== undefined) data.estado = estado;
  if (destacado !== undefined) data.destacado = destacado;

  // Actualizar y retornar
  const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

  return producto;
};

/**
 * Eliminar producto (soft delete)
 * 
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Object>} producto eliminado
 * @throws {Error} Si no existe o ya está eliminado
 */
const eliminarProducto = async (id) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El id del producto no es válido");
  }

  // Validar que existe
  const productoExistente = await Producto.findById(id);
  if (!productoExistente) {
    throw new Error("El producto no existe");
  }

  // Validar que no está ya eliminado
  if (!productoExistente.estado) {
    throw new Error("El producto ya fue eliminado");
  }

  // Soft delete
  const producto = await Producto.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  return producto;
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
