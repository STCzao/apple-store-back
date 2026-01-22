/**
 * CONTROLADOR DE PRODUCTOS
 * 
 * Maneja todas las operaciones CRUD para productos en la tienda
 * - Lectura: Pública (sin autenticación)
 * - Escritura: Protegida (solo ADMIN_ROLE)
 * 
 * @module ProductoController
 */

const { response, request } = require("express");
const { Producto, Categoria } = require("./../models/index");
const { validarObjectId } = require("../helpers/validarObjectId");

/**
 * GET /api/productos
 * 
 * Obtiene un listado paginado de productos activos
 * 
 * @async
 * @param {Object} req - Request
 * @param {Object} req.query.limite - Cantidad de productos por página (default: 12, máx: 100)
 * @param {Object} req.query.desde - Posición de inicio para paginación (default: 0)
 * @param {Object} res - Response
 * 
 * @returns {Object} { total: number, productos: Array }
 * 
 * @example
 * GET /api/productos?limite=10&desde=0
 * 
 * Respuesta exitosa (200):
 * {
 *   "total": 50,
 *   "productos": [
 *     {
 *       "_id": "...",
 *       "nombreProducto": "IPHONE 15",
 *       "marca": "APPLE",
 *       "precio": 999,
 *       "categoria": { "_id": "...", "nombreCategoria": "Celulares" },
 *       "creadoPor": { "_id": "...", "nombreUsuario": "Admin" },
 *       "estado": true
 *     }
 *   ]
 * }
 */
const productosGet = async (req = request, res = response) => {
  const { limite = 12, desde = 0 } = req.query;

  // Validar que limite y desde sean números válidos
  if (isNaN(limite) || isNaN(desde)) {
    return res.status(400).json({
      msg: "Los parámetros 'limite' y 'desde' deben ser números válidos",
    });
  }

  const limiteNum = Number(limite);
  const desdeNum = Number(desde);

  // Validar que no sean negativos
  if (limiteNum < 0 || desdeNum < 0) {
    return res.status(400).json({
      msg: "Los parámetros 'limite' y 'desde' no pueden ser negativos",
    });
  }

  // Validar que el límite no sea excesivo (máximo 100 para no sobrecargar)
  if (limiteNum > 100) {
    return res.status(400).json({
      msg: "El parámetro 'limite' no puede ser mayor a 100",
    });
  }

  // Obtener total de productos y listado paginado en paralelo
  const [total, productos] = await Promise.all([
    Producto.countDocuments({ estado: true }),
    Producto.find({ estado: true })
      .skip(desdeNum)
      .limit(limiteNum)
      .populate("categoria", "nombreCategoria")
      .populate("creadoPor", "nombreUsuario"),
  ]);

  res.json({
    total,
    productos,
  });
};

/**
 * GET /api/productos/:id
 * 
 * Obtiene un producto específico por su ID
 * 
 * @async
 * @param {Object} req - Request
 * @param {String} req.params.id - MongoDB ObjectId del producto
 * @param {Object} res - Response
 * 
 * @returns {Object} { producto: Object }
 * 
 * @example
 * GET /api/productos/65abc123def456
 * 
 * Respuesta exitosa (200):
 * {
 *   "producto": {
 *     "_id": "65abc123def456",
 *     "nombreProducto": "IPHONE 15",
 *     "marca": "APPLE",
 *     "precio": 999,
 *     "estado": true,
 *     "categoria": { "_id": "...", "nombreCategoria": "Celulares" },
 *     "creadoPor": { "_id": "...", "nombreUsuario": "Admin" }
 *   }
 * }
 * 
 * Error 400 (ID inválido):
 * { "msg": "El id del producto no es válido" }
 * 
 * Error 404 (No existe):
 * { "msg": "El producto no existe" }
 */
const productoGet = async (req = request, res = response) => {
  const { id } = req.params;

  // Validar que el ID sea un ObjectId válido de MongoDB
  if (!validarObjectId(id)) {
    return res.status(400).json({
      msg: "El id del producto no es válido",
    });
  }

  // Buscar producto y poblar referencias
  const producto = await Producto.findById(id)
    .populate("categoria", "nombreCategoria")
    .populate("creadoPor", "nombreUsuario");

  // Validar que existe y está activo (soft delete)
  if (!producto || !producto.estado) {
    return res.status(404).json({
      msg: "El producto no existe",
    });
  }

  res.json({
    producto,
  });
};

/**
 * POST /api/productos
 * 
 * Crea un nuevo producto en la tienda
 * Requiere: ADMIN_ROLE y JWT válido
 * 
 * @async
 * @param {Object} req - Request
 * @param {Object} req.body - Datos del producto
 * @param {String} req.body.nombreProducto - Nombre (3-50 caracteres, obligatorio)
 * @param {String} req.body.marca - Marca (2-30 caracteres, obligatorio)
 * @param {String} req.body.categoria - MongoDB ObjectId de categoría (obligatorio)
 * @param {Number} req.body.precio - Precio > 0 (obligatorio)
 * @param {String} req.body.descripcion - Descripción (10-500 caracteres, obligatorio)
 * @param {String} req.body.img - URL de imagen (opcional)
 * @param {Number} req.body.inventario - Stock inicial >= 0 (obligatorio)
 * @param {Boolean} req.body.estado - Estado inicial (default: true)
 * @param {Object} req.usuario - Usuario autenticado (inyectado por middleware)
 * @param {Object} res - Response
 * 
 * @returns {Object} { producto: Object, msg: String }
 * 
 * Notas:
 * - nombreProducto y marca se normalizan a MAYÚSCULAS
 * - Se valida que no exista otro producto con el mismo nombre
 * - Se asigna automáticamente creadoPor con el ID del admin
 * 
 * @example
 * POST /api/productos
 * Headers: { "x-token": "token_admin_valido" }
 * Body:
 * {
 *   "nombreProducto": "iPhone 15",
 *   "marca": "Apple",
 *   "categoria": "65abc123def456",
 *   "precio": 999,
 *   "descripcion": "Último modelo con A18 Pro",
 *   "img": "https://...",
 *   "inventario": 50,
 *   "estado": true
 * }
 * 
 * Respuesta exitosa (201):
 * {
 *   "producto": {
 *     "_id": "65xyz789abc123",
 *     "nombreProducto": "IPHONE 15",
 *     "marca": "APPLE",
 *     "precio": 999,
 *     "creadoPor": "65admin123...",
 *     "estado": true
 *   },
 *   "msg": "Producto creado con éxito"
 * }
 */
const productoPost = async (req = request, res = response) => {
  const {
    nombreProducto,
    marca,
    categoria,
    precio,
    descripcion,
    img,
    estado,
    inventario,
  } = req.body;

  // Validar que los campos requeridos existan
  if (!nombreProducto || !marca || !categoria || !precio || !descripcion) {
    return res.status(400).json({
      msg: "Faltan campos obligatorios",
    });
  }

  // Validar que categoria es un ObjectId válido de MongoDB
  if (!validarObjectId(categoria)) {
    return res.status(400).json({
      msg: "El id de la categoría no es válido",
    });
  }

  // Validar que la categoría existe en BD (integridad referencial)
  const categoriaExiste = await Categoria.findById(categoria);

  if (!categoriaExiste) {
    return res.status(400).json({
      msg: "La categoría no existe",
    });
  }

  // Normalizar nombre y marca a MAYÚSCULAS para consistencia
  const nombreNormalizado = nombreProducto.toUpperCase();
  const marcaNormalizada = marca.toUpperCase();

  // Validar que no exista otro producto con el mismo nombre
  const productoDB = await Producto.findOne({
    nombreProducto: nombreNormalizado,
  });
  if (productoDB) {
    return res.status(400).json({
      msg: `El producto ${productoDB.nombreProducto} ya existe`,
    });
  }

  // Validar que el precio sea un número válido y positivo
  const precioNum = Number(precio);
  if (isNaN(precioNum) || precioNum <= 0) {
    return res.status(400).json({
      msg: "El precio debe ser un número válido y no negativo",
    });
  }

  // Validar que el inventario sea un número válido y no negativo
  const inventarioNum = Number(inventario);
  if (isNaN(inventarioNum) || inventarioNum < 0) {
    return res.status(400).json({
      msg: "El inventario debe ser un número válido y no negativo",
    });
  }

  // Generar objeto con datos a guardar
  const data = {
    nombreProducto: nombreNormalizado,
    marca: marcaNormalizada,
    categoria,
    precio,
    descripcion,
    img,
    inventario: inventarioNum,
    estado,
    creadoPor: req.usuario._id, // Auditoría: quién creó el producto
  };

  // Crear y guardar el producto
  const producto = new Producto(data);
  await producto.save();

  res.status(201).json({
    producto,
    msg: "Producto creado con éxito",
  });
};

/**
 * PUT /api/productos/:id
 * 
 * Actualiza un producto existente
 * Requiere: ADMIN_ROLE y JWT válido
 * 
 * @async
 * @param {Object} req - Request
 * @param {String} req.params.id - MongoDB ObjectId del producto
 * @param {Object} req.body - Datos a actualizar (todos opcionales)
 * @param {String} req.body.nombreProducto - Nuevo nombre (opcional)
 * @param {String} req.body.marca - Nueva marca (opcional)
 * @param {String} req.body.categoria - Nueva categoría (opcional)
 * @param {Number} req.body.precio - Nuevo precio (opcional)
 * @param {String} req.body.descripcion - Nueva descripción (opcional)
 * @param {String} req.body.img - Nueva imagen (opcional)
 * @param {Number} req.body.inventario - Nuevo stock (opcional)
 * @param {Boolean} req.body.estado - Nuevo estado (opcional)
 * @param {Boolean} req.body.destacado - Marcar como destacado (opcional, solo ADMIN)
 * @param {Object} req.usuario - Usuario autenticado (inyectado por middleware)
 * @param {Object} res - Response
 * 
 * @returns {Object} { producto: Object, msg: String }
 * 
 * Notas:
 * - Los campos nombreProducto y marca se normalizan a MAYÚSCULAS
 * - El campo creadoPor es PROTEGIDO y no puede cambiar
 * - Solo se actualizan los campos que vienen en el request
 * - Se valida existencia de categoría si se intenta cambiar
 * - Se valida no crear duplicados después de normalizar
 * 
 * @example
 * PUT /api/productos/65abc123def456
 * Headers: { "x-token": "token_admin_valido" }
 * Body:
 * {
 *   "precio": 899,
 *   "inventario": 25,
 *   "destacado": true
 * }
 * 
 * Respuesta exitosa (200):
 * {
 *   "producto": { "_id": "65abc123def456", "precio": 899, ... },
 *   "msg": "El producto se actualizó con éxito"
 * }
 */
const productoPut = async (req = request, res = response) => {
  const { id } = req.params;

  // Validar que el ID sea un ObjectId válido de MongoDB
  if (!validarObjectId(id)) {
    return res.status(400).json({
      msg: "El id del producto no es válido",
    });
  }

  // Validar que el producto existe antes de actualizar
  const productoExistente = await Producto.findById(id);

  if (!productoExistente) {
    return res.status(404).json({
      msg: "El producto no existe",
    });
  }

  // Proteger campo creadoPor (auditoría - no se puede cambiar quién creó)
  if (
    req.body.creadoPor &&
    req.body.creadoPor !== productoExistente.creadoPor
  ) {
    return res.status(400).json({
      msg: "No se puede cambiar el creador del producto",
    });
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
  } = req.body;

  // Normalizar nombre y marca a MAYÚSCULAS solo si vienen en el request
  const nombreNormalizado = nombreProducto ? nombreProducto.toUpperCase() : undefined;
  const marcaNormalizada = marca ? marca.toUpperCase() : undefined;

  // Validar que no exista otro producto con el mismo nombre (duplicado)
  // Excluir el producto actual con $ne: id
  if (nombreProducto && nombreNormalizado) {
    const productoDuplicado = await Producto.findOne({
      nombreProducto: nombreNormalizado,
      _id: { $ne: id },
    });
    if (productoDuplicado) {
      return res.status(400).json({
        msg: `El producto ${productoDuplicado.nombreProducto} ya existe`,
      });
    }
  }

  // Validar que el precio sea un número válido y no negativo (si viene en la petición)
  let precioNum;
  if (precio !== undefined) {
    precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      return res.status(400).json({
        msg: "El precio debe ser un número válido y mayor que cero",
      });
    }
  }

  // Si se intenta cambiar categoría, validar que exista en BD
  if (categoria) {
    const categoriaExiste = await Categoria.findById(categoria);
    if (!categoriaExiste) {
      return res.status(400).json({
        msg: "La categoría no existe",
      });
    }
  }

  // Validar que el inventario sea un número válido y no negativo (si viene)
  let inventarioNum;
  if (inventario !== undefined) {
    inventarioNum = Number(inventario);
    if (isNaN(inventarioNum) || inventarioNum < 0) {
      return res.status(400).json({
        msg: "El inventario debe ser un número válido y no negativo",
      });
    }
  }

  // Construir objeto data dinámicamente - solo incluir campos que vinieron en request
  // Esto evita sobrescribir campos que el admin no quiso cambiar
  const data = {};

  if (nombreNormalizado) data.nombreProducto = nombreNormalizado;
  if (marcaNormalizada) data.marca = marcaNormalizada;
  if (categoria) data.categoria = categoria;
  if (precioNum !== undefined) data.precio = precioNum;
  if (descripcion) data.descripcion = descripcion;
  if (img) data.img = img;
  if (estado !== undefined) data.estado = estado;
  if (destacado !== undefined) data.destacado = destacado;
  if (inventarioNum !== undefined) data.inventario = inventarioNum;

  // Actualizar y retornar el documento actualizado
  const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

  res.json({
    producto,
    msg: "El producto se actualizó con éxito",
  });
};

/**
 * DELETE /api/productos/:id
 * 
 * Elimina (soft delete) un producto
 * Requiere: ADMIN_ROLE y JWT válido
 * 
 * Nota: Usa soft delete (marca estado: false) en lugar de borrar de la BD
 * Esto permite:
 * - Auditoría y recuperación de datos
 * - Mantener referencias histórica
 * - Evitar problemas de integridad referencial
 * 
 * @async
 * @param {Object} req - Request
 * @param {String} req.params.id - MongoDB ObjectId del producto
 * @param {Object} res - Response
 * 
 * @returns {Object} { producto: Object, msg: String }
 * 
 * @example
 * DELETE /api/productos/65abc123def456
 * Headers: { "x-token": "token_admin_valido" }
 * 
 * Respuesta exitosa (200):
 * {
 *   "producto": { "_id": "65abc123def456", "estado": false, ... },
 *   "msg": "El producto IPHONE 15 se eliminó con éxito"
 * }
 * 
 * Error 400 (Ya eliminado):
 * { "msg": "El producto ya fue eliminado" }
 * 
 * Error 404 (No existe):
 * { "msg": "El producto no existe" }
 */
const productoDelete = async (req = request, res = response) => {
  const { id } = req.params;

  // Validar que el ID sea un ObjectId válido de MongoDB
  if (!validarObjectId(id)) {
    return res.status(400).json({
      msg: "El id del producto no es válido",
    });
  }

  // Validar que el producto existe antes de eliminar
  const productoExistente = await Producto.findById(id);

  if (!productoExistente) {
    return res.status(404).json({
      msg: "El producto no existe",
    });
  }

  // Validar que no está ya eliminado (soft delete)
  if (!productoExistente.estado) {
    return res.status(400).json({
      msg: "El producto ya fue eliminado",
    });
  }

  // Realizar soft delete: marcar como inactivo en lugar de borrar de BD
  const producto = await Producto.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true },
  );

  res.json({
    producto,
    msg: `El producto ${producto.nombreProducto} se eliminó con éxito`,
  });
};

// Exportar todos los controladores para usar en rutas
module.exports = {
  productosGet,
  productoGet,
  productoPost,
  productoPut,
  productoDelete,
};
