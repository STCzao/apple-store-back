const AppError = require("../helpers/AppError");
const sanitizarTexto = require("../helpers/sanitizarTexto");
const categoriaRepo = require("../repositories/categoria.repository");

const obtenerCategorias = async (limite = 10, desde = 0) => {
  const [total, categorias] = await Promise.all([
    categoriaRepo.count({ estado: true }),
    categoriaRepo.findAll({ estado: true }, desde, limite),
  ]);
  return { total, categorias };
};

const obtenerCategoriaPorId = async (id) => {
  const categoria = await categoriaRepo.findById(id);
  if (!categoria || !categoria.estado) throw new AppError("Categoría no encontrada", 404);
  return categoria;
};

const crearCategoria = async ({ nombreCategoria, descripcion, img }, usuarioId) => {
  const nombreNormalizado = nombreCategoria.toLowerCase().trim();

  const existe = await categoriaRepo.findOne({ nombreCategoria: nombreNormalizado });
  if (existe) throw new AppError(`La categoría "${nombreCategoria}" ya existe`, 409);

  const data = { nombreCategoria: nombreNormalizado, creadoPor: usuarioId };
  if (descripcion) data.descripcion = sanitizarTexto(descripcion);
  if (img) data.img = img;

  return categoriaRepo.create(data);
};

const actualizarCategoria = async (id, datosActualizar) => {
  const existe = await categoriaRepo.findById(id);
  if (!existe) throw new AppError("Categoría no encontrada", 404);

  const { nombreCategoria, descripcion, img, estado } = datosActualizar;
  const data = {};

  if (nombreCategoria) {
    const nombreNormalizado = nombreCategoria.toLowerCase().trim();
    const duplicado = await categoriaRepo.findOne({ nombreCategoria: nombreNormalizado, _id: { $ne: id } });
    if (duplicado) throw new AppError(`La categoría "${nombreCategoria}" ya existe`, 409);
    data.nombreCategoria = nombreNormalizado;
  }

  if (descripcion !== undefined) data.descripcion = sanitizarTexto(descripcion);
  if (img !== undefined) data.img = img;
  if (estado !== undefined) data.estado = estado;

  return categoriaRepo.update(id, data);
};

const eliminarCategoria = async (id) => {
  const existe = await categoriaRepo.findById(id);
  if (!existe) throw new AppError("Categoría no encontrada", 404);
  if (!existe.estado) throw new AppError("La categoría ya fue eliminada", 400);
  return categoriaRepo.update(id, { estado: false });
};

module.exports = { obtenerCategorias, obtenerCategoriaPorId, crearCategoria, actualizarCategoria, eliminarCategoria };
