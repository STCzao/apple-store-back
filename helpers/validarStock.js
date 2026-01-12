const validarStock = (producto, cantidadSolicitada) => {
  if (!producto) {
    throw new Error("El producto no existe.");
  }

  if (!producto.activo) {
    throw new Error("El producto no está disponible.");
  }

  if (cantidadSolicitada <= 0) {
    throw new Error("La cantidad solicitada no es válida.");
  }

  if (producto.stock < cantidadSolicitada) {
    throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
  }
};

module.exports = { validarStock };
