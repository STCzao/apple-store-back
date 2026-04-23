const AppError = require("../helpers/AppError");
const sanitizarTexto = require("../helpers/sanitizarTexto");
const productoRepo = require("../repositories/producto.repository");
const categoriaRepo = require("../repositories/categoria.repository");
const emailService = require("../helpers/email");
const cloudinaryService = require("../helpers/cloudinary");
const logger = require("../config/logger");

const obtenerProductos = async (limite = 12, desde = 0) => {
  const [total, productos] = await Promise.all([
    productoRepo.count({ estado: true }),
    productoRepo.findAll({ estado: true }, desde, limite),
  ]);
  return { total, productos };
};

const obtenerProductoPorId = async (id) => {
  const producto = await productoRepo.findById(id);
  if (!producto || !producto.estado) throw new AppError("Producto no encontrado", 404);
  return producto;
};

const crearProducto = async (
  { nombreProducto, marca, categoria, precio, descripcion, imagenes, destacado, whatsappActivo, whatsappMensaje },
  usuarioId
) => {
  const categoriaExiste = await categoriaRepo.findById(categoria);
  if (!categoriaExiste || !categoriaExiste.estado) throw new AppError("Categoría no encontrada", 404);

  const nombreNormalizado = nombreProducto.toLowerCase().trim();
  const duplicado = await productoRepo.findOne({ nombreProducto: nombreNormalizado });
  if (duplicado) throw new AppError(`El producto "${nombreProducto}" ya existe`, 409);

  const data = {
    nombreProducto: nombreNormalizado,
    marca: marca.toLowerCase().trim(),
    categoria,
    precio: Number(precio),
    descripcion: sanitizarTexto(descripcion),
    creadoPor: usuarioId,
  };

  if (imagenes) data.imagenes = imagenes;
  if (destacado !== undefined) data.destacado = destacado;
  if (whatsappActivo !== undefined) data.whatsappActivo = whatsappActivo;
  if (whatsappMensaje) data.whatsappMensaje = sanitizarTexto(whatsappMensaje);

  const producto = await productoRepo.create(data);

  emailService.enviarNotificacionNuevoProducto(producto).catch((err) =>
    logger.error("Error enviando notificación de nuevo producto", { error: err.message })
  );

  return producto;
};

const actualizarProducto = async (id, datosActualizar) => {
  const existe = await productoRepo.findById(id);
  if (!existe) throw new AppError("Producto no encontrado", 404);

  const { nombreProducto, marca, categoria, precio, descripcion, imagenes, estado, destacado, whatsappActivo, whatsappMensaje } = datosActualizar;
  const data = {};

  if (nombreProducto) {
    const nombreNormalizado = nombreProducto.toLowerCase().trim();
    const duplicado = await productoRepo.findOne({ nombreProducto: nombreNormalizado, _id: { $ne: id } });
    if (duplicado) throw new AppError(`El producto "${nombreProducto}" ya existe`, 409);
    data.nombreProducto = nombreNormalizado;
  }

  if (marca) data.marca = marca.toLowerCase().trim();

  if (categoria) {
    const categoriaExiste = await categoriaRepo.findById(categoria);
    if (!categoriaExiste || !categoriaExiste.estado) throw new AppError("Categoría no encontrada", 404);
    data.categoria = categoria;
  }

  if (precio !== undefined) data.precio = Number(precio);
  if (descripcion) data.descripcion = sanitizarTexto(descripcion);

  if (imagenes) {
    // Eliminar imágenes viejas de Cloudinary antes de reemplazarlas
    await cloudinaryService.eliminarImagenes(existe.imagenes);
    data.imagenes = imagenes;
  }

  if (estado !== undefined) data.estado = estado;
  if (destacado !== undefined) data.destacado = destacado;
  if (whatsappActivo !== undefined) data.whatsappActivo = whatsappActivo;
  if (whatsappMensaje !== undefined) data.whatsappMensaje = sanitizarTexto(whatsappMensaje);

  return productoRepo.update(id, data);
};

const eliminarProducto = async (id) => {
  const existe = await productoRepo.findById(id);
  if (!existe) throw new AppError("Producto no encontrado", 404);
  if (!existe.estado) throw new AppError("El producto ya fue eliminado", 400);

  // Eliminar imágenes de Cloudinary junto con el soft-delete
  await cloudinaryService.eliminarImagenes(existe.imagenes);

  return productoRepo.update(id, { estado: false });
};

module.exports = { obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto };
