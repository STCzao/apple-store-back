const cloudinary = require("../config/cloudinary");
const logger = require("../config/logger");

const eliminarImagen = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Error al eliminar imagen: ${publicId} — ${result.result}`);
  }
};

const eliminarImagenes = async (imagenes = []) => {
  if (!imagenes.length) return;

  const resultados = await Promise.allSettled(
    imagenes.map((img) => eliminarImagen(img.publicId))
  );

  const fallidos = resultados.filter((r) => r.status === "rejected");
  if (fallidos.length) {
    logger.warn(`Cloudinary: ${fallidos.length} imagen(es) no pudieron eliminarse`, {
      errores: fallidos.map((f) => f.reason?.message),
    });
  }
};

module.exports = { eliminarImagen, eliminarImagenes };
